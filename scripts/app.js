import { gifts, giftImage } from './gifts.js?v=15';
import { icon } from './icons.js?v=15';
import { icon3d } from './icons3d.js?v=15';
import {nftArt} from './nft-art.js?v=15';
import { PALETTES, readPalette, savePalette, tonesFor, readView, saveView } from './themes.js?v=15';
import { collectible } from './art.js?v=15';
import { COMPLETE, ClaimKeys, escapeHTML as esc, rewardText, remaining, taskAction, validateHost, validateSnapshot, validateOperation } from './model.js?v=15';

const GOLD = new URL('../assets/collectible-trio.png', import.meta.url).href;
const BUNNY = giftImage('heart-locket');
const taskGift = kind => nftArt(kind);
const taskMark = (task,index) => {
  const route={channel:'send',invite:'users',collection:'star',profile:'gem',wheel:'wheel',cases:'grid',craft:'craft',home:'rocket',weekly:'sun',upgrade:'bolt',leaderboard:'trophy',rewards:'check'};
  const art=route[task.route]||(['send','users','grid','star','rocket','check'][index%6]);
  return icon3d(art,'road-task-icon');
};
const FAVICON = new URL('../assets/favicon-v2.svg', import.meta.url).href;
const boltArt = () => icon3d('bolt','art3d');
const LABELS = {
  available:'Ready to start', in_progress:'In progress', verifying:'Verifying your task',
  verified:'Verified · reward ready', rejected:'Not verified yet', claimed:'Reward received',
  already_claimed:'Already claimed', expired:'Task ended', retry_available:'You can try again',
  server_error:'Result not confirmed', claiming:'Claiming your reward'
};
const ROUTES = {home:'Home',inventory:'Inventory',invite:'Invite',leaderboard:'Leaderboard',rewards:'Rewards',deposit:'Top up',cases:'Cases',crash:'Crash',channel:'CASE channel',collection:'Collection',upgrade:'Upgrade',wheel:'Wheel',craft:'Craft',wallet:'Connect wallet',weekly:'Weekly',profile:'Profile',points:'Points'};

export function mountCaseTasks(root, options = {}) {
  const app = new RewardsApp(root, options);
  app.start();
  return { destroy:() => app.destroy(), refresh:() => app.load(), setHost:host => app.setHost(host) };
}

class RewardsApp {
  constructor(root, {host, review = false, embedded = false}) {
    this.root = root; this.host = host; this.review = review; this.embedded = embedded;
    this.data = null; this.tab = 'tasks'; this.filter = 'all'; this.overrides = new Map();
    this.busy = new Set(); this.keys = new ClaimKeys(); this.life = new AbortController();
    this.destroyed = false; this.loading = false; this.pendingLoad = null; this.lastLoad = 0;
    this.anchor = performance.now(); this.serverNow = Date.now(); this.focusBefore = null; this.activeTask = null;
    this.generation = 0; this.requests = new Set(); this.palette = readPalette(); this.tones = tonesFor(this.palette); this.view = readView();
  }
  now() { return this.serverNow + performance.now() - this.anchor; }
  items() { return this.data ? [...this.data.tasks, ...this.data.achievements] : []; }
  item(id) {
    const t = this.items().find(item => item.id === id);
    if (!t) return null;
    const uncertain = this.keys.pending(id) && !COMPLETE.has(t.state) ? 'server_error' : null;
    return {...t, state:this.overrides.get(id) || uncertain || t.state};
  }
  async call(method, argument = {}) {
    const host = validateHost(this.host), controller = new AbortController();
    this.requests.add(controller);
    const abort = () => controller.abort();
    this.life.signal.addEventListener('abort', abort, {once:true});
    let timer;
    try {
      return await Promise.race([
        Promise.resolve().then(() => host[method]({...argument, signal:controller.signal})),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Request timeout')); }, 15000); }),
        new Promise((_, reject) => controller.signal.addEventListener('abort', () => reject(new DOMException('Aborted','AbortError')), {once:true}))
      ]);
    } finally { clearTimeout(timer); this.requests.delete(controller); this.life.signal.removeEventListener('abort', abort); }
  }
  giftTicker() {
    const tiles = duplicate => gifts.map((g,i)=>`<span class="gift-tile gift-tone-${i%6}"><img src="${giftImage(g.file)}" width="58" height="58" alt="${duplicate?'':esc(g.name)}" decoding="async"></span>`).join('');
    return `<section class="gift-ticker" aria-label="Collectible gift showcase"><button class="ticker-control" data-action="ticker" aria-label="Pause gift carousel" aria-pressed="false"><i></i><small>GIFTS</small></button><div class="gift-viewport" tabindex="0" aria-label="Scroll to explore gifts"><div class="gift-track"><div class="gift-set">${tiles(false)}</div><div class="gift-set" aria-hidden="true">${tiles(true)}</div></div></div></section>`;
  }
  giftGallery() {
    return `<section class="crew-section" aria-label="Telegram gift collections"><div class="crew-heading"><span>THE COLLECTIBLE EDIT</span><h2>Icons for a reason.</h2><p>A few familiar faces from Telegram Gifts.</p></div><div class="real-gift-grid">${[['plush-pepe','Plush Pepe','PlushPepe-1','green'],['swiss-watch','Swiss Watch','SwissWatch-1','gold'],['heart-locket','Heart Locket','HeartLocket-1','pink']].map(([file,name,slug,tone])=>`<a class="real-gift gift-${tone}" href="https://t.me/nft/${slug}" target="_blank" rel="noopener noreferrer" aria-label="View ${name} on Telegram"><span class="gift-glint" aria-hidden="true">✦</span><img src="${giftImage(file)}" width="128" height="128" alt="${name}" loading="lazy"><strong>${name}</strong><small>TELEGRAM GIFT ${icon('arrow')}</small></a>`).join('')}</div><p class="gallery-caption">Collection showcase. Task rewards are shown separately.</p></section>`;
  }
  publicView(connectionError=false) {
    if(connectionError)return `<section class="state-panel">${icon('refresh')}<h2>Let’s try that again</h2><p>We couldn’t load your tasks. Your rewards have not changed.</p><button class="secondary-btn" data-action="refresh">${icon('refresh')}Try again</button></section>${this.giftGallery()}`;
    if(this.tab==='achievements')return `<div class="achievement-intro"><span><img src="${giftImage('heart-locket')}" width="105" height="118" alt=""></span><div><p class="overline">YOUR PERSONAL HALL OF FAME</p><h2>Every milestone.<br>All yours.</h2><p>Open CASE to see your achievements.</p></div></div><div class="public-achievements">${[['loot-bag','Collections'],['swiss-watch','Milestones'],['plush-pepe','Community']].map(([file,title])=>`<div><img src="${giftImage(file)}" width="78" height="78" alt=""><strong>${title}</strong><small>Discover inside CASE</small></div>`).join('')}</div><a class="primary-btn full-width open-case" href="https://t.me/case_official_ru_bot" target="_blank" rel="noopener noreferrer">Open my achievements ${icon('arrow')}</a>${this.giftGallery()}`;
    return `<section class="public-missions" aria-label="Your tasks"><div class="group-heading"><div><h2><span class="heading-mark mark-art">${boltArt()}</span>Your next challenge</h2><p>Your progress. Your rewards. All in CASE.</p></div><span class="account-pill">${icon('user')}Sign in</span></div><div class="public-task-list">${[['loot-bag','Daily challenges','Find your daily goals and keep your progress going.','violet'],['plush-pepe','Community missions','Stay connected. Discover what’s new in CASE.','green'],['heart-locket','Special collections','Explore limited missions and collectible moments.','pink']].map(([file,title,copy,tone])=>`<a class="public-task public-${tone}" href="https://t.me/case_official_ru_bot" target="_blank" rel="noopener noreferrer"><span class="public-task-art"><img src="${giftImage(file)}" width="86" height="86" alt=""></span><span class="public-task-copy"><strong>${title}</strong><span>${copy}</span><small>OPEN IN CASE ${icon('arrow')}</small></span></a>`).join('')}</div><p class="connection-note">Open CASE to load your personal tasks, progress and available rewards.</p></section>${this.giftGallery()}<button class="discovery-banner" data-action="achievements"><span class="discovery-art"><img src="${giftImage('swiss-watch')}" width="90" height="95" alt="" loading="lazy"></span><span><small>YOUR NEXT MILESTONE</small><strong>Make it one to remember.</strong><span>Explore achievements ${icon('arrow')}</span></span></button>`;
  }
  start() {
    this.root.innerHTML = `<div class="case-app ${this.embedded?'is-embedded':''}" data-palette="${this.palette}">
      <header class="app-header"><a class="brand" href="#tasks-content" aria-label="CASE Rewards"><span class="brand-mark">${icon3d('gem')}</span><span>CASE<span class="brand-dot">.</span><small>PLAY. COLLECT. REPEAT.</small></span></a><span class="header-actions"><button class="icon-btn" data-action="palette" aria-label="Colour theme">${icon('palette')}</button><button class="icon-btn" data-action="help" aria-label="How rewards work">${icon('info')}</button></span></header>
      <div class="balance-bar"><button class="balance-control" data-action="balance"><span class="token-token">${icon3d('ton')}</span><span><small>Your balance</small><strong id="balance-value">— <span>TON</span></strong></span></button><button class="topup-btn" data-route="wallet">${icon('wallet')}<span>Connect wallet</span></button></div>
      ${this.giftTicker()}
      <main id="tasks-content">
        <h1 class="sr-only">Your rewards</h1>
        <div class="main-tabs" role="tablist" aria-label="Rewards sections"><button id="tab-tasks" role="tab" aria-selected="true" aria-controls="rewards-panel" data-tab="tasks">${icon3d('check')}Tasks<span class="tab-count" id="task-count">—</span></button><button id="tab-achievements" role="tab" aria-selected="false" tabindex="-1" aria-controls="rewards-panel" data-tab="achievements">${icon3d('trophy')}Achievements</button></div>
        <div id="rewards-panel" role="tabpanel" aria-labelledby="tab-tasks">
          <section class="hero" id="hero"><div class="hero-copy"><span class="hero-badge"><i></i>YOUR NEXT GOOD THING</span><h2>Little tasks.<br><span>BIG FINDS.</span></h2><p>Your next challenge.<br>Your next little obsession.</p><button class="hero-cta" data-action="explore">Explore tasks ${icon('arrow')}</button></div><div class="hero-orbit" aria-hidden="true"></div><img class="hero-art" src="${GOLD}" width="1254" height="1254" alt="" fetchpriority="high"><span class="hero-spark spark-one" aria-hidden="true">✦</span><span class="hero-spark spark-two" aria-hidden="true">✧</span><span class="hero-edition">COLLECTIBLE-INSPIRED ART</span></section>
          <div id="live-content" aria-busy="true"><div class="loading-card"></div><div class="loading-card"></div></div>
        </div>
        <footer class="content-footer">${icon('shield')}<p>Every reward has a story.<br><strong>Yours starts with a task.</strong></p></footer>
      </main>
      <nav class="app-nav case-original-nav" aria-label="Main navigation"><button data-route="home">${icon('grid')}<span>Main</span></button><button data-route="upgrade">${icon('rocket')}<span>Upgrade</span></button><button class="nav-wheel" data-route="wheel">${icon('wheel')}<span>Wheel</span></button><button data-route="craft">${icon('craft')}<span>Craft</span></button><button data-action="menu" aria-label="Open CASE menu">${icon('menu')}<span>Menu</span><i></i></button></nav>
      <dialog class="sheet" aria-labelledby="sheet-title"><div class="sheet-grip"></div><button class="icon-btn close-sheet" data-action="close" aria-label="Close">${icon('close')}</button><div class="sheet-content"></div></dialog><div class="toast" role="status" aria-live="polite"></div>
    </div>`;
    this.shell = this.root.querySelector('.case-app'); this.dialog = this.root.querySelector('dialog');
    this.content = this.root.querySelector('#live-content');
    this.root.addEventListener('click', event => this.click(event), {signal:this.life.signal});
    this.root.addEventListener('keydown', event => this.keydown(event), {signal:this.life.signal});
    this.dialog.addEventListener('close', () => {this.activeTask=null; if(this.focusBefore?.isConnected)this.focusBefore.focus({preventScroll:true});}, {signal:this.life.signal});
    this.dialog.addEventListener('click', event => {if(event.target===this.dialog){const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.dialog.close();}}, {signal:this.life.signal});
    document.addEventListener('visibilitychange', () => {if(!document.hidden&&this.data&&Date.now()-this.lastLoad>15000)this.load();}, {signal:this.life.signal});
    window.addEventListener('online', () => this.load(), {signal:this.life.signal});
    this.root.querySelector('.gift-viewport')?.addEventListener('pointerdown',()=>{this.root.querySelector('.gift-ticker').classList.add('is-paused');const b=this.root.querySelector('[data-action=ticker]');b.setAttribute('aria-pressed','true');b.setAttribute('aria-label','Resume gift carousel');b.querySelector('small').textContent='PLAY';},{signal:this.life.signal});
    this.timer = setInterval(() => this.updateClocks(), 1000);
    this.sizer = new ResizeObserver(() => this.drawRoad()); this.sizer.observe(this.root);
    this.attachSubscription(); this.load();
  }
  attachSubscription() {
    this.unsubscribe?.();
    if(typeof this.host?.subscribe==='function') {
      this.unsubscribe=this.host.subscribe(() => {clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>this.load(),300);});
    }
  }
  setHost(host) {
    this.generation++;
    for(const request of this.requests)request.abort();
    this.pendingLoad=null;this.host=host;this.attachSubscription();this.data=null;
    this.busy.clear();this.overrides.clear();this.activeTask=null;this.dialog.close();
    this.root.querySelector('#balance-value').textContent='—';
    this.root.querySelector('#task-count').textContent='—';
    this.content.innerHTML='<div class="loading-card"></div><div class="loading-card"></div>';
    return this.load();
  }
  commit(raw) {
    const value=validateSnapshot(raw);
    if(this.data&&value.revision<this.data.revision)return false;
    this.data=value;this.serverNow=Date.parse(value.serverNow);this.anchor=performance.now();
    for(const item of this.items())if(COMPLETE.has(item.state))this.keys.settled(item.id);
    return true;
  }
  async load() {
    if(this.destroyed)return;
    if(this.pendingLoad)return this.pendingLoad;
    const generation=this.generation;
    this.loading=true;this.content.setAttribute('aria-busy','true');
    this.pendingLoad=(async()=>{
      try {
        const value=await this.call('getSnapshot');if(this.destroyed||generation!==this.generation)return;
        this.commit(value);this.lastLoad=Date.now();this.connectionError=false;this.render();
      } catch(error) {
        if(this.destroyed||generation!==this.generation)return;
        this.connectionError=true;
        if(this.data){this.render();this.toast('Couldn’t refresh. Your last confirmed progress is shown.');}
        else this.content.innerHTML=this.publicView(!!this.host);
      } finally {if(generation===this.generation){this.loading=false;this.pendingLoad=null;this.content.setAttribute('aria-busy','false');}}
    })();
    return this.pendingLoad;
  }
  render() {
    if(!this.data||this.destroyed)return;
    const focused=this.root.contains(document.activeElement)?document.activeElement:null;
    const focusId=focused?.dataset.taskAction;const focusAction=focused?.dataset.action;
    this.root.querySelector('#balance-value').innerHTML=`${rewardText(this.data.balance)} <span>${esc(this.data.balance?.unit||'TON')}</span>`;
    this.root.querySelector('#task-count').textContent=this.data.tasks.filter(t=>!COMPLETE.has(t.state)&&t.state!=='expired').length;
    this.content.innerHTML=this.tab==='tasks'?this.tasksView():this.achievementsView();
    this.content.setAttribute('aria-busy','false');this.updateClocks();this.drawRoad();
    if(focusId)this.root.querySelector(`[data-task-action="${CSS.escape(focusId)}"]`)?.focus({preventScroll:true});
    else if(focusAction==='filter')this.root.querySelector(`[data-filter="${this.filter}"]`)?.focus({preventScroll:true});
    if(this.activeTask&&this.dialog.open)this.taskSheet(this.activeTask,true);
  }
  tasksView() {
    const ready=this.data.tasks.filter(t=>t.state==='verified'&&t.canClaim).length;
    const daily=this.data.tasks.filter(t=>t.category==='daily');
    const completed=daily.filter(t=>COMPLETE.has(t.state)).length;
    const switcher=`<div class="view-switch" role="group" aria-label="Task view"><button data-action="view" data-view="list" aria-pressed="${this.view==='list'}">${icon('grid')}<span>List</span></button><button data-action="view" data-view="map" aria-pressed="${this.view==='map'}">${icon('compass')}<span>Map</span></button></div>`;
    if(this.view==='map')return `${this.connectionError?'<div class="sync-warning" role="status">Showing your last confirmed progress. <button data-action="refresh">Refresh</button></div>':''}${switcher}${this.roadView()}`;
    return `${this.connectionError?'<div class="sync-warning" role="status">Showing your last confirmed progress. <button data-action="refresh">Refresh</button></div>':''}${switcher}
      <div class="journey${completed&&completed===daily.length?' journey-full':''}"><span class="journey-icon">${boltArt()}</span><div class="journey-copy"><strong>Your daily journey</strong><small>${completed} of ${daily.length} rewards collected</small></div><div class="journey-meter"><div class="journey-dots" aria-label="${completed} of ${daily.length} daily tasks claimed">${daily.slice(0,12).map(t=>`<span class="${COMPLETE.has(t.state)?'done':''}">${COMPLETE.has(t.state)?icon('check'):''}</span>`).join('')}</div><span class="journey-pct">${daily.length?Math.round(completed/daily.length*100):0}%</span></div></div>
      <div class="filter-bar" role="group" aria-label="Filter tasks">${[['all','All','grid'],['daily','Daily','sun'],['limited','Limited','crown'],['social','Social','users']].map(([id,label,art])=>{const open=this.data.tasks.filter(t=>(id==='all'||t.category===id)&&!COMPLETE.has(t.state)&&t.state!=='expired').length;return `<button data-action="filter" data-filter="${id}" aria-pressed="${this.filter===id}"><i class="chip-art">${icon3d(art,'',this.tones[id])}</i><span class="chip-label">${label}</span>${open?`<span class="chip-count">${open}</span>`:''}</button>`;}).join('')}</div>
      <div id="task-groups">${['daily','limited','social'].filter(c=>this.filter==='all'||this.filter===c).map(c=>this.group(c)).join('')||this.empty('No tasks here yet','New things to do will appear here.')}</div>
      <button class="discovery-banner" data-action="achievements"><span class="discovery-art">${nftArt('crown')}</span><span><small>GO A LITTLE FURTHER</small><strong>Some things are worth unlocking.</strong><span>Discover your achievements ${icon('arrow')}</span></span></button>`;
  }
  roadView() {
    const order=['daily','social','limited'];
    const tasks=order.flatMap(c=>this.data.tasks.filter(t=>t.category===c).map(t=>this.item(t.id)));
    if(!tasks.length)return this.empty('No tasks here yet','New things to do will appear here.');
    const milestones=this.data.achievements.map(a=>this.item(a.id)).filter(Boolean);
    const prize=milestones.length?milestones[milestones.length-1]:null;
    const checkpoints=milestones.slice(0,-1);
    const first=tasks.findIndex(t=>!COMPLETE.has(t.state)&&t.state!=='expired');
    const doneCount=tasks.filter(t=>COMPLETE.has(t.state)).length;
    const zone={daily:['Daily','sun'],social:['Social','users'],limited:['Limited','crown']};
    const rows=[];
    tasks.forEach((t,i)=>{
      if(i===0||tasks[i-1].category!==t.category)rows.push({kind:'zone',category:t.category,label:zone[t.category][0],art:zone[t.category][1]});
      const state=COMPLETE.has(t.state)?'done':i===first?'current':first<0||i<first?'done':'ahead';
      rows.push({kind:'task',task:t,state});
      checkpoints.forEach((m,k)=>{if(i===Math.round((k+1)*tasks.length/(checkpoints.length+1))-1)rows.push({kind:'checkpoint',milestone:m});});
    });
    const xs=[30,72,26,75,32,68];
    let n=0;
    const stepHTML=rows.map(r=>{
      if(r.kind==='zone')return `<div class="road-zone road-zone-${esc(r.category)}"><span class="road-sign">${icon3d(r.art,'',this.tones[r.category])}<span><small>MISSION ZONE</small><b>${r.label}</b></span></span></div>`;
      if(r.kind==='checkpoint'){const m=r.milestone,done=COMPLETE.has(m.state);return `<div class="road-check ${done?'is-done':''}"><button class="road-island" data-details="${esc(m.id)}" aria-label="Checkpoint: ${esc(m.title)}"><span class="island-top"></span><span class="island-glow"></span><span class="island-art island-box">${icon3d('gift','road-box-icon','gold')}</span></button><span class="road-node road-node-check" data-road>${done?icon('check'):icon('gift')}</span><button class="road-card road-card-check" data-details="${esc(m.id)}"><span class="road-card-body"><small>CHECKPOINT · ${m.progress}/${m.target}</small><strong>${esc(m.title)}</strong><span>Reach this milestone to unlock the bonus box.</span></span><span class="road-card-end">${done?icon('check'):icon('arrow')}</span></button></div>`;}
      const t=r.task,x=xs[n%xs.length],side=n%2?'right':'left';n++;
      const action=taskAction(t,this.now()),ready=t.state==='verified'&&t.canClaim;
      const status=r.state==='done'?'Completed':ready?'Ready to claim':r.state==='current'?(['available','in_progress'].includes(t.state)?`${t.progress}/${t.target} · up next`:LABELS[t.state]):'Coming up';
      return `<div class="road-step road-${r.state} side-${side} road-tone-${(n-1)%6}" style="--x:${x}%"><span class="road-node ${ready?'is-ready':''}" data-road>${r.state==='done'?icon('check'):r.state==='ahead'?icon('lock'):`<b>${n}</b>`}</span><button class="road-card" data-details="${esc(t.id)}"><span class="road-card-art">${taskMark(t,n-1)}</span><span class="road-card-body"><strong>${esc(t.title)}</strong><small>${icon3d('ton')}+${rewardText(t.reward)} ${esc(t.reward.unit)}</small><em class="road-status">${status}</em></span><span class="road-card-end">${r.state==='done'?icon('check'):r.state==='ahead'?icon('lock'):icon('arrow')}</span></button>${(r.state==='current'||ready)&&!action.disabled?`<button class="${ready?'claim-btn':'task-btn'} road-cta" data-task-action="${esc(t.id)}">${icon(ready?'gift':action.kind==='navigate'?'arrow':'check-circle')}<span>${action.label}</span></button>`:''}</div>`;
    }).join('');
    return `<section class="road" aria-label="Your task map" style="--done:${tasks.length?doneCount/tasks.length:0}">
      <svg class="road-svg" aria-hidden="true"><path class="road-shadow" transform="translate(0 7)"></path><path class="road-base"></path><path class="road-inner"></path><path class="road-halo"></path><path class="road-line"></path><path class="road-dash"></path></svg>
      <div class="road-start"><span class="road-node road-node-start" data-road></span><span class="road-pad"><b>START</b><small>${doneCount} of ${tasks.length} done</small></span></div>
      ${stepHTML}
      <div class="road-summit">${prize?`<button class="road-island road-island-prize" data-details="${esc(prize.id)}" aria-label="Main prize: ${esc(prize.title)}"><span class="island-top"></span><span class="island-glow"></span><span class="island-art">${taskGift(prize.icon)}</span></button><span class="road-node road-node-prize" data-road>${icon3d('crown','','gold')}</span><button class="road-card road-card-prize" data-details="${esc(prize.id)}"><span class="road-card-body"><small>MAIN PRIZE · ${doneCount}/${tasks.length}</small><strong>${esc(prize.title)}</strong><span>Complete the route and unlock the featured collectible.</span></span><span class="road-card-end">${icon('arrow')}</span></button>`:''}</div>
    </section>`;
  }
  drawRoad() {
    const road=this.root?.querySelector('.road');if(!road)return;
    const svg=road.querySelector('.road-svg'),box=road.getBoundingClientRect();
    const nodes=[...road.querySelectorAll('[data-road]')];
    if(nodes.length<2||!box.width)return;
    const pts=nodes.map(el=>{const r=el.getBoundingClientRect();return [r.left-box.left+r.width/2,r.top-box.top+r.height/2];});
    let d=`M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i],dy=(y1-y0)*.55;d+=` C${x0.toFixed(1)} ${(y0+dy).toFixed(1)} ${x1.toFixed(1)} ${(y1-dy).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;}
    svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);svg.setAttribute('width',box.width);svg.setAttribute('height',box.height);
    const done=Math.max(0,Math.min(100,parseFloat(getComputedStyle(road).getPropertyValue('--done'))*100||0));
    svg.querySelectorAll('path').forEach(p=>{p.setAttribute('d',d);p.setAttribute('pathLength','100');if(p.classList.contains('road-line')||p.classList.contains('road-halo'))p.style.strokeDasharray=`${done} 100`;});
  }
  group(category) {
    const tasks=this.data.tasks.filter(t=>t.category===category);
    if(!tasks.length)return this.filter===category?this.empty('Nothing here just yet','Check back for new tasks.'):'';
    const meta={daily:['Daily tasks','sun','Fresh goals, every day.'],limited:['Limited editions','crown','A little something out of the ordinary.'],social:['Stay connected','users','Good company comes with good things.']}[category];
    const deadlines=tasks.filter(t=>t.expiresAt&&!COMPLETE.has(t.state)&&t.state!=='expired').map(t=>t.expiresAt).sort();
    return `<section class="task-group group-${category}" aria-label="${meta[0]}"><div class="group-heading"><div><h2><span class="heading-mark">${icon3d(meta[1],'',this.tones[category])}</span>${meta[0]}</h2><p>${meta[2]}</p></div>${deadlines.length?`<span class="time-pill">${icon('clock')}<span data-deadline="${esc(deadlines[0])}">${remaining(deadlines[0],this.now())}</span></span>`:''}</div><div class="task-list${tasks.length===1?' solo':''}">${tasks.map(t=>this.taskCard(this.item(t.id))).join('')}</div></section>`;
  }
  taskCard(t) {
    const action=taskAction(t,this.now()),percent=Math.min(100,t.progress/t.target*100);
    const ready=t.state==='verified'&&t.canClaim;
    return `<article class="task-card cat-${esc(t.category)} color-${esc(t.icon)} ${ready?'ready':''} ${COMPLETE.has(t.state)?'is-complete':''} ${t.category==='limited'?'limited-card':''}" data-card="${esc(t.id)}">
      <button class="task-art" data-details="${esc(t.id)}" aria-label="Details: ${esc(t.title)}"><span class="art-shelf" aria-hidden="true"></span>${taskGift(t.icon)}<span class="reward-pill">${icon3d('ton')}+${rewardText(t.reward)}<small>${esc(t.reward.unit)}</small></span>${t.featured?'<span class="featured-tag">SPECIAL DROP</span>':''}</button>
      <div class="task-info"><h3><button data-details="${esc(t.id)}">${esc(t.title)}</button></h3><p>${esc(t.description)}</p></div>
      <div class="task-progress"><span class="status-label ${ready?'status-ready':''} ${t.state==='server_error'||t.state==='rejected'?'status-error':''}">${['available','in_progress'].includes(t.state)?`Progress <strong>${t.progress}/${t.target}</strong>`:LABELS[t.state]}</span><div class="progress-track" role="progressbar" aria-label="${esc(t.title)}" aria-valuemin="0" aria-valuemax="${t.target}" aria-valuenow="${Math.min(t.progress,t.target)}"><span style="width:${percent}%"></span></div></div>
      <div class="task-action"><button class="${ready?'claim-btn':'task-btn'}" data-task-action="${esc(t.id)}" ${action.disabled?'disabled':''}>${icon(ready?'gift':action.kind==='navigate'?'arrow':action.disabled?'check':action.kind==='refresh'?'refresh':'check-circle')}<span>${action.label}</span></button></div>
    </article>`;
  }
  achievementsView() {
    const list=this.data.achievements,earned=list.filter(t=>COMPLETE.has(t.state)||t.state==='verified').length;
    return `${this.connectionError?'<div class="sync-warning">Showing last confirmed progress. <button data-action="refresh">Refresh</button></div>':''}<div class="achievement-intro"><span>${nftArt('crown')}</span><div><p class="overline">YOUR PERSONAL HALL OF FAME</p><h2>More than a reward.<br>A milestone.</h2><p>${earned} of ${list.length} achievements unlocked</p></div></div><div class="achievement-grid">${list.map(raw=>{const t=this.item(raw.id),a=taskAction(t,this.now()),done=COMPLETE.has(t.state);return `<article class="achievement-card color-${esc(t.icon)} ${done?'unlocked':''}"><span class="achievement-status">${done?icon('check')+'Unlocked':'IN PROGRESS'}</span><button class="achievement-art" data-details="${esc(t.id)}" aria-label="Details: ${esc(t.title)}">${taskGift(t.icon)}</button><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p><div class="achievement-progress"><span>${t.progress} / ${t.target}</span><div class="progress-track"><span style="width:${Math.min(100,t.progress/t.target*100)}%"></span></div></div><span class="reward-pill">${icon3d('ton')}+${rewardText(t.reward)}<small>${esc(t.reward.unit)}</small></span><button class="achievement-button" ${a.disabled?'disabled':''} data-task-action="${esc(t.id)}">${a.kind==='none'?a.label:a.kind==='claim'?'Claim reward':'View achievement'}${icon(a.kind==='none'?'check':'arrow')}</button></article>`;}).join('')||this.empty('Your story starts here','New achievements will appear as they become available.')}</div>`;
  }
  empty(title,description) {return `<div class="state-panel">${icon3d('ton')}<h2>${title}</h2><p>${description}</p></div>`;}
  updateClocks() {
    if(this.destroyed||!this.data)return;
    this.root.querySelectorAll('[data-deadline]').forEach(el=>el.textContent=remaining(el.dataset.deadline,this.now()));
    this.root.querySelectorAll('[data-task-action]').forEach(btn=>{
      const t=this.item(btn.dataset.taskAction);if(!t)return;
      const a=taskAction(t,this.now());btn.disabled=!!a.disabled||this.busy.has(t.id);btn.title=a.label;
      const label=btn.querySelector('span');if(label)label.textContent=a.label;
    });
    if(this.activeTask&&this.dialog.open) {
      const t=this.item(this.activeTask),btn=this.dialog.querySelector('[data-sheet-action]');
      if(t&&btn)btn.disabled=!!taskAction(t,this.now()).disabled||this.review||this.busy.has(t.id);
    }
  }
  showSheet(html) {
    const wasOpen=this.dialog.open;
    this.dialog.classList.toggle('mission-sheet', !!this.activeTask);
    this.dialog.querySelector('.sheet-content').innerHTML=html;
    if(!wasOpen){this.focusBefore=document.activeElement;this.dialog.showModal();}
  }
  paletteSheet() {
    this.showSheet(`<span class="detail-eyebrow">YOUR STYLE</span><h2 id="sheet-title">Choose your atmosphere.</h2><div class="palette-grid">${PALETTES.map(p=>`<button class="palette-option${p.id===this.palette?' is-active':''}" data-palette-id="${esc(p.id)}" aria-pressed="${p.id===this.palette}"><span class="palette-swatch" aria-hidden="true">${p.swatch.map(c=>`<i data-swatch="${esc(c)}"></i>`).join('')}</span><span class="palette-copy"><strong>${esc(p.name)}</strong><small>${esc(p.note)}</small></span>${p.id===this.palette?icon('check'):''}</button>`).join('')}</div><p class="quiet-note">Your choice is remembered on this device only.</p>`);
    this.paintSwatches();
  }
  paintSwatches() {
    this.dialog.querySelectorAll('[data-swatch]').forEach(el=>{el.style.background=el.dataset.swatch;});
  }
  setPalette(id) {
    this.palette=savePalette(id);this.tones=tonesFor(this.palette);
    this.shell.dataset.palette=this.palette;
    if(this.data)this.render();else this.content.innerHTML=this.publicView(!!this.host);
    this.paletteSheet();
    this.dialog.querySelector(`[data-palette-id="${CSS.escape(this.palette)}"]`)?.focus({preventScroll:true});
  }
  taskSheet(id,update=false) {
    const t=this.item(id);if(!t)return;
    const a=taskAction(t,this.now());this.activeTask=id;
    const focused=update&&this.dialog.contains(document.activeElement);
    const rarity=COMPLETE.has(t.state)?'done':t.category==='limited'?'limited':t.category==='social'?'social':'daily';
    this.showSheet(`<div class="sheet-hero hero-${rarity}"><span class="sheet-halo" aria-hidden="true"></span><span class="sheet-beam" aria-hidden="true"></span><div class="detail-art">${taskGift(t.icon)}</div><span class="sheet-plinth" aria-hidden="true"></span></div><span class="detail-eyebrow">${COMPLETE.has(t.state)?'MILESTONE COMPLETE':t.category==='limited'?'LIMITED EDITION':t.category==='social'?'COMMUNITY':'YOUR NEXT STEP'}</span><h2 id="sheet-title">${esc(t.title)}</h2><p>${esc(t.description)}</p>${this.missionSteps(t)}<div class="detail-reward"><span>Reward</span><strong>${icon3d('ton')}+${rewardText(t.reward)} <small>${esc(t.reward.unit)}</small></strong></div><div class="detail-progress"><span>${esc(LABELS[t.state])}</span><strong>${t.progress} / ${t.target}</strong></div><div class="progress-track"><span style="width:${Math.min(100,t.progress/t.target*100)}%"></span></div>${t.expiresAt?`<p class="detail-expiry">${icon('clock')}Time left: <span data-deadline="${esc(t.expiresAt)}">${remaining(t.expiresAt,this.now())}</span></p>`:''}${t.state==='server_error'?'<p class="inline-message" role="status">The result is not confirmed. Check the status before trying again. Your balance will update only after confirmation.</p>':''}${t.state==='rejected'?'<p class="inline-message">The requirements haven’t been confirmed yet. Complete the task before checking again.</p>':''}${t.retryAt?`<p class="inline-message">Next check: <span data-deadline="${esc(t.retryAt)}">${remaining(t.retryAt,this.now())}</span></p>`:''}<button class="primary-btn full-width" data-sheet-action="${esc(t.id)}" ${a.disabled||this.review?'disabled':''}>${this.review&&!a.disabled?'Available inside CASE':a.label}${icon(a.kind==='navigate'?'arrow':a.kind==='claim'?'gift':'check-circle')}</button>${this.review?'<p class="quiet-note">Preview mission</p>':'<p class="quiet-note"></p>'}`);
    if(focused)this.dialog.querySelector('[data-sheet-action]:not(:disabled)')?.focus({preventScroll:true});
  }
  missionSteps(t) {
    const steps=t.steps||[{title:'Start your mission',description:t.description},{title:'Confirm completion',description:'Your progress updates once the requirements are confirmed.'},{title:'Collect your reward',description:'Your reward is ready when all requirements are complete.'}];
    const visual='path';
    const size=Math.min(visual==='reactor'?7:visual==='passport'?4:2,t.target);
    const labels=visual==='reactor'?['D1','D2','D3','D4','D5','D6','D7']:visual==='passport'?['DISCOVER','EXPLORE','DECODE','CONNECT']:['YOU','YOUR FRIEND'];
    const board=['reactor','passport','crew'].includes(visual)?`<div class="mission-board board-${visual}" aria-label="${t.progress} of ${t.target} complete">${Array.from({length:size},(_,i)=>`<div class="board-cell ${i<t.progress?'charged':''}">${icon3d(visual==='passport'?'check':visual==='reactor'?'bolt':'users')}<span>${labels[i]}</span></div>`).join('')}</div>`:'';
    return `${board}<section class="mission-path" aria-label="Mission stages"><div class="mission-path-heading"><span>HOW TO COMPLETE</span><small>${steps.length} stages</small></div>${steps.map((step,i)=>`<details class="mission-step" ${i===0?'open':''}><summary><span class="step-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(step.title)}</strong><span class="step-expand">+</span></summary><p>${esc(step.description)}</p></details>`).join('')}</section>`;
  }
  async perform(id, fromSheet=false) {
    const t=this.item(id);if(!t||this.busy.has(id))return;
    if(this.review){this.taskSheet(id);return;}
    const a=taskAction(t,this.now());if(a.disabled)return;
    if(a.kind==='details'){this.taskSheet(id);return;}
    if(a.kind==='navigate'){if(!fromSheet){this.taskSheet(id);return;} await this.navigate(t.route,t.id);return;}
    this.busy.add(id);
    const generation=this.generation;
    const isClaim=a.kind==='claim',isRefresh=a.kind==='refresh',pending=this.keys.pending(id);
    this.overrides.set(id,isClaim?'claiming':'verifying');this.render();
    try {
      let raw;
      if(isClaim){const idempotencyKey=this.keys.get(id);this.keys.begin(id);raw=await this.call('claimReward',{taskId:id,idempotencyKey});}
      else if(isRefresh&&pending)raw=await this.call('getOperation',{taskId:id,idempotencyKey:this.keys.get(id)});
      else if(isRefresh)raw=await this.call('getSnapshot');
      else raw=await this.call('verifyTask',{taskId:id});
      if(this.destroyed||generation!==this.generation)return;
      if(isClaim||(isRefresh&&pending)) {
        const result=validateOperation(raw,id);
        this.commit(result.snapshot);
        if(result.status==='pending') {
          this.overrides.set(id,'server_error');this.render();
          this.toast('Your claim is still processing. Check its status in a moment.');return;
        }
        this.keys.settled(id);
        if(result.status==='failed')this.keys.rotate(id);
      } else this.commit(raw);
      this.overrides.delete(id);this.render();
      const result=this.item(id);
      if(result&&COMPLETE.has(result.state)){this.toast('Reward confirmed. Your balance is up to date.');}
      else if(result?.state==='verified')this.toast('Task verified. Your reward is ready.');
      else this.toast('Task status updated.');
    } catch(error) {
      if(this.destroyed||generation!==this.generation)return;
      this.overrides.set(id,'server_error');this.render();this.toast('Couldn’t confirm the result. Please check its status.');
    } finally {if(generation===this.generation){this.busy.delete(id);this.updateClocks();}}
  }
  async navigate(route, taskId) {
    if(route==='rewards'){this.dialog.close();this.selectTab('tasks');this.root.querySelector('main').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});return;}
    if(!this.host){this.activeTask=null;this.showSheet(`<div class="detail-art"><img src="${giftImage('plush-pepe')}" alt="" width="80" height="80"></div><h2 id="sheet-title">Continue in CASE</h2><p>Your account, wallet and game progress live in the CASE Mini App.</p><a class="primary-btn full-width" href="https://t.me/case_official_ru_bot" target="_blank" rel="noopener noreferrer">Open CASE ${icon('arrow')}</a>`);return;}
    if(this.review){this.activeTask=null;this.showSheet(`<div class="detail-art">${collectible(route==='collection'?'gem':'rocket')}</div><h2 id="sheet-title">${esc(ROUTES[route]||'Explore CASE')}</h2><p>This opens the ${esc(ROUTES[route]||'selected')} section inside CASE. The design review stays on this page.</p><button class="primary-btn full-width" data-action="close">Back to rewards ${icon('arrow')}</button>`);return;}
    try { await this.call('navigate',{route,taskId}); } catch {this.toast('This section is unavailable. Please open it inside CASE.');}
  }
  selectTab(tab) {
    this.tab=tab==='achievements'?'achievements':'tasks';
    this.root.querySelectorAll('[data-tab]').forEach(b=>{const selected=b.dataset.tab===this.tab;b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1;});
    this.root.querySelector('#rewards-panel').setAttribute('aria-labelledby',`tab-${this.tab}`);
    this.root.querySelector('#hero').hidden=this.tab!=='tasks';
    if(this.data)this.render();else this.content.innerHTML=this.publicView(!!this.host);
  }
  keydown(event) {
    if(!event.target.matches('[role="tab"]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const next=event.key==='Home'?'tasks':event.key==='End'?'achievements':this.tab==='tasks'?'achievements':'tasks';
    this.selectTab(next);this.root.querySelector(`[data-tab="${next}"]`).focus();
  }
  click(event) {
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.dataset.tab){this.selectTab(button.dataset.tab);return;}
    if(button.dataset.route){this.navigate(button.dataset.route);return;}
    if(button.dataset.paletteId){this.setPalette(button.dataset.paletteId);return;}
    if(button.dataset.details){this.taskSheet(button.dataset.details);return;}
    if(button.dataset.taskAction){this.perform(button.dataset.taskAction);return;}
    if(button.dataset.sheetAction){this.perform(button.dataset.sheetAction,true);return;}
    switch(button.dataset.action){
      case 'ticker':{const ticker=this.root.querySelector('.gift-ticker');const paused=ticker.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Resume gift carousel':'Pause gift carousel');button.querySelector('small').textContent=paused?'PLAY':'GIFTS';break;}
      case 'menu':this.activeTask=null;this.showSheet(`<span class="detail-eyebrow">EXPLORE CASE</span><h2 id="sheet-title">Your next move.</h2><div class="menu-grid">${[['rewards','check','Tasks'],['weekly','bolt','Weekly'],['points','ton','Points'],['channel','send','News'],['invite','users','Invite'],['profile','gem','Profile']].map(([route,i,label])=>`<button data-route="${route}">${icon3d(i)}<span>${label}</span></button>`).join('')}</div>`);break;
      case 'close':this.dialog.close();break;
      case 'refresh':this.load();break;
      case 'filter':this.filter=button.dataset.filter;this.render();break;
      case 'view':this.view=saveView(button.dataset.view);this.render();break;
      case 'explore':this.root.querySelector('.filter-bar, .public-missions, .state-panel')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});break;
      case 'achievements':this.selectTab('achievements');this.root.querySelector('.main-tabs').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});this.root.querySelector('#tab-achievements').focus({preventScroll:true});break;
      case 'balance':this.activeTask=null;this.showSheet(`<div class="detail-art">${taskGift('gem')}</div><span class="detail-eyebrow">YOUR REWARDS</span><h2 id="sheet-title">${rewardText(this.data?.balance)} <small>${esc(this.data?.balance?.unit||'TON')}</small></h2><p>${this.data?'Your latest balance from CASE. Rewards appear here after a successful claim.':'Connect through CASE to see your current balance.'}</p>${this.review?'<p class="inline-message">Sample balance for design review. No real account is connected.</p>':''}<button class="primary-btn full-width" data-action="close">Keep exploring ${icon('arrow')}</button>`);break;
      case 'palette':this.activeTask=null;this.paletteSheet();break;
      case 'help':this.activeTask=null;this.showSheet(`<div class="detail-art">${taskGift('gift')}</div><h2 id="sheet-title">A few steps.<br>Something extra.</h2><ol class="help-steps"><li><span>01</span><div><strong>Find your next task</strong><p>Explore daily challenges, special editions and community tasks.</p></div></li><li><span>02</span><div><strong>Make progress</strong><p>Follow the task’s requirements. CASE confirms your progress.</p></div></li><li><span>03</span><div><strong>Claim your reward</strong><p>Once verified, collect your reward and watch your balance update.</p></div></li></ol><button class="primary-btn full-width" data-action="close">Let’s go ${icon('arrow')}</button>`);break;
    }
  }
  toast(message) {if(this.destroyed)return;const el=this.root.querySelector('.toast');el.textContent=message;el.classList.add('visible');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>el.classList.remove('visible'),4000);}
  destroy() {this.destroyed=true;this.life.abort();clearInterval(this.timer);clearTimeout(this.toastTimer);clearTimeout(this.refreshTimer);this.sizer?.disconnect();this.unsubscribe?.();this.dialog?.close();this.root.replaceChildren();}
}
