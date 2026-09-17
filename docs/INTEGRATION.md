# CASE host integration

## Bootstrap

Set window.CASE_TASKS_HOST before scripts/main.js starts. Or import mountCaseTasks from scripts/app.js and pass {host, embedded:true}. It returns destroy(), refresh() and setHost(host). Destroy on unmount. On account changes use setHost with a new authenticated host; this aborts old requests and clears previous account data.

index.html preserves the full approved Tasks structure. Without a host it loads the preview account, labelled Preview balance, and disables mutations. With a supplied host it uses authenticated data. embed.html is the production integration entry and never imports fixtures; use it for CASE. preview.html remains a separately labelled review entry.

## Host methods

All methods return promises and accept an AbortSignal. Never log signed Telegram data or credentials.

- getSnapshot({signal}) -> Snapshot
- verifyTask({taskId, signal}) -> Snapshot
- claimReward({taskId, idempotencyKey, signal}) -> OperationResult
- getOperation({taskId, idempotencyKey, signal}) -> OperationResult
- navigate({route, signal}) -> void
- subscribe(onChange) -> unsubscribe (optional; callback triggers a debounced snapshot refresh)

Routes: home, inventory, invite, leaderboard, rewards, deposit, cases, crash, channel, collection, upgrade, wheel, craft, wallet, weekly, profile, points. The host maps these semantic names to its own router or wallet UI. No arbitrary URLs from responses are executed.

## Snapshot

Object fields:

- revision: nonnegative safe integer, monotonically increasing per authenticated account snapshot. A response with an older revision cannot replace newer state.
- serverNow: ISO time from server.
- balance: null or {amount: decimal string, unit: string}; no binary floating point math for balances.
- tasks: array of Task, maximum 100.
- achievements: array of Task without required category, maximum 100.

Task fields: id, title, description, icon, progress, target, reward {amount, unit}, state, canClaim, canVerify. Optional: expiresAt, retryAt, route, featured. tasks require category daily, limited or social. id must be opaque and unique per account/task-period instance; never use only a reusable daily template ID. Progress is a finite nonnegative number; target is positive. Amount is a nonnegative decimal string, up to 24 characters and 9 fractional digits. Text and arrays are bounded in model.js.

States: available, in_progress, verifying, verified, rejected, already_claimed, claimed, expired, retry_available, server_error, claiming. Claim is offered only for verified + canClaim. Expiry/retry UI uses serverNow plus elapsed monotonic time. UI progress never establishes completion or reward eligibility.

## Claim operations

OperationResult = {status: pending | succeeded | failed | not_found, snapshot: Snapshot}.

succeeded requires the requested task to exist in the snapshot with state claimed or already_claimed. pending leaves the claim unresolved. On timeout, network failure or uncertain result, the same idempotencyKey is retained, and Check status calls getOperation. A definitive failed result permits a fresh operation key. not_found must mean authoritative absence; a later claim reuses the original key. Server must deduplicate irrespective of transport cancellation or client restarts.

Session storage keeps only opaque operation keys and pending markers. If storage is unavailable, there is an in-memory fallback; the server remains responsible for persistent deduplication across reloads/devices. No retry loop performs claims automatically. No optimistic balance increment is used.

## Required backend controls

Validate Telegram authentication and freshness on the server; initDataUnsafe and a Telegram user ID alone are not proof of identity. Bind the session, task ownership and claim eligibility to the authenticated user. Compute rewards, prices and balance changes on the server. Atomically record completion, unique claim and ledger entry. Repeated claims must return the same logical outcome. Spending/withdrawal is outside this tab and must use authoritative ledger constraints and its own authorization.

The frontend validation is for robustness, not a security boundary. The host must handle logout, expired sessions, authorization failures, subscriptions and wallet routing. Navigation must not fabricate successful payments or task completion.

## Shell and embedding

With embedded:true the host header, balance, gift rail and bottom navigation are hidden to avoid duplicating CASE chrome. If replacing the full tab, use embedded:false. Supply real live-gift activity in the host shell; this standalone rail is labelled GIFTS and shows collection artwork, never invented live wins. Styles currently include document-level defaults: scope them when integrating into an existing global stylesheet.

## Release boundary

This delivery implements the frontend. No production CASE API or signed session was supplied; backend integration and in-Telegram device testing remain required before enabling real claims. The public GitHub Pages site is a static frontend and cannot validate Telegram sessions or issue rewards itself.
