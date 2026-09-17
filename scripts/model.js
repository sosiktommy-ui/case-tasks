export const STATES = new Set([
  'available', 'in_progress', 'verifying', 'verified', 'rejected',
  'already_claimed', 'claimed', 'expired', 'retry_available', 'server_error', 'claiming'
]);
export const COMPLETE = new Set(['claimed', 'already_claimed']);
const CATEGORIES = new Set(['daily', 'limited', 'social']);
const ALLOWED_ROUTES = new Set(['home', 'inventory', 'invite', 'leaderboard', 'rewards', 'deposit', 'cases', 'crash', 'channel', 'collection', 'upgrade', 'wheel', 'craft', 'wallet', 'weekly', 'profile', 'points']);
const text = (value, max = 400) => typeof value === 'string' && value.length <= max;
const safeNumber = value => Number.isFinite(value) && value >= 0;

export class IntegrationError extends Error {
  constructor(message = 'Rewards are not connected yet.') { super(message); this.name = 'IntegrationError'; }
}

export function validateSnapshot(value) {
  if (!value || !text(value.serverNow, 40) || !Number.isFinite(Date.parse(value.serverNow)) ||
      !Array.isArray(value.tasks) || !Array.isArray(value.achievements) || value.tasks.length > 100 || value.achievements.length > 100) {
    throw new IntegrationError('The rewards response is unavailable.');
  }
  if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new IntegrationError('Snapshot revision missing.');
  const ids = new Set();
  const rewardValid = reward => reward && text(reward.amount, 24) && /^\d+(\.\d{1,9})?$/.test(reward.amount) && text(reward.unit, 12);
  const itemValid = item => item && text(item.id, 128) && item.id.length > 0 && text(item.title, 100) &&
    text(item.description, 1000) && text(item.icon, 30) && safeNumber(item.progress) && safeNumber(item.target) && item.target > 0 &&
    (!item.visual || ['path','passport','reactor','crew'].includes(item.visual)) &&
    (!item.steps || (Array.isArray(item.steps) && item.steps.length <= 8 && item.steps.every(step=>step && text(step.title,100) && text(step.description,500)))) &&
    rewardValid(item.reward) && typeof item.canClaim === 'boolean' && typeof item.canVerify === 'boolean' &&
    (!item.expiresAt || (text(item.expiresAt, 40) && Number.isFinite(Date.parse(item.expiresAt)))) &&
    (!item.retryAt || (text(item.retryAt, 40) && Number.isFinite(Date.parse(item.retryAt)))) &&
    (!item.route || ALLOWED_ROUTES.has(item.route)) && STATES.has(item.state);
  for (const item of [...value.tasks, ...value.achievements]) {
    if (!itemValid(item) || ids.has(item.id)) throw new IntegrationError('The rewards response is unavailable.');
    ids.add(item.id);
  }
  if (value.tasks.some(t => !CATEGORIES.has(t.category))) throw new IntegrationError('Unknown task category.');
  if (value.balance !== null && !rewardValid(value.balance)) throw new IntegrationError('Balance unavailable.');
  return structuredClone(value);
}

export function validateHost(host) {
  if (!host || !['getSnapshot', 'verifyTask', 'claimReward', 'getOperation', 'navigate'].every(key => typeof host[key] === 'function')) throw new IntegrationError();
  return host;
}

export function validateOperation(value, taskId) {
  if (!value || !['pending','succeeded','failed','not_found'].includes(value.status)) throw new IntegrationError('Operation status unavailable.');
  const snapshot=validateSnapshot(value.snapshot);
  const item=[...snapshot.tasks,...snapshot.achievements].find(t=>t.id===taskId);
  if (!item || (value.status==='succeeded'&&!COMPLETE.has(item.state))) throw new IntegrationError('Operation is not confirmed.');
  return {status:value.status,snapshot};
}

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}
export function rewardText(reward) {
  if (!reward) return '—';
  // Display decimal strings without converting money through floating-point arithmetic.
  const [whole, decimal] = reward.amount.split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formatted}${decimal === undefined ? '' : '.' + decimal}`;
}
export function remaining(expiresAt, serverTime) {
  if (!expiresAt) return null;
  const seconds = Math.max(0, Math.floor((Date.parse(expiresAt) - serverTime) / 1000));
  if (!seconds) return 'Ended';
  const days = Math.floor(seconds / 86400), hours = Math.floor(seconds / 3600) % 24, minutes = Math.floor(seconds / 60) % 60;
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : minutes ? `${minutes}m` : '< 1m';
}
export function taskAction(task, now) {
  if (COMPLETE.has(task.state)) return {label:'Claimed', kind:'none', disabled:true};
  if (['verifying','claiming'].includes(task.state)) return {label:task.state === 'claiming' ? 'Claiming…' : 'Verifying…', kind:'none', disabled:true};
  if (task.state === 'server_error') return {label:'Check status', kind:'refresh'};
  if (task.state === 'expired' || (task.expiresAt && Date.parse(task.expiresAt) <= now)) return {label:'Expired', kind:'none', disabled:true};
  if (task.retryAt && Date.parse(task.retryAt) > now) return {label:'Try later', kind:'none', disabled:true};
  if (task.state === 'verified' && task.canClaim) return {label:'Claim reward', kind:'claim'};
  if (task.canVerify && ['available','in_progress','rejected','retry_available'].includes(task.state)) return {label:['rejected','retry_available'].includes(task.state) ? 'Try again' : 'Check task', kind:'verify'};
  if (task.route) return {label:task.route === 'invite' ? 'Invite' : 'Go to task', kind:'navigate'};
  return {label:'View details', kind:'details'};
}

// IDs contain no credential or account data. Server-side ownership remains mandatory.
export class ClaimKeys {
  constructor(storage) {
    try { this.storage = storage === undefined ? globalThis.sessionStorage : storage; } catch { this.storage = null; }
    this.memory = new Map(); this.pendingMemory = new Set();
  }
  get(id) {
    const key = `case:claim:${id}`;
    if (this.memory.has(key)) return this.memory.get(key);
    let value;
    try { value = this.storage?.getItem(key); } catch { /* memory fallback */ }
    if (!value || !/^[a-zA-Z0-9-]{16,100}$/.test(value)) value = crypto.randomUUID();
    this.memory.set(key, value);
    try { this.storage?.setItem(key, value); } catch { /* retries in this page remain stable */ }
    return value;
  }
  pending(id) {
    if (this.pendingMemory.has(id)) return true;
    try { return this.storage?.getItem(`case:pending:${id}`) === '1'; } catch { return false; }
  }
  begin(id) { this.pendingMemory.add(id); try { this.storage?.setItem(`case:pending:${id}`, '1'); } catch {} }
  settled(id) { this.pendingMemory.delete(id); try { this.storage?.removeItem(`case:pending:${id}`); } catch {} }
  rotate(id) { this.memory.delete(`case:claim:${id}`); try { this.storage?.removeItem(`case:claim:${id}`); } catch {} }
}
