# Validation — 17 September 2026

12 automated browser checks passed using local in-memory hosts:

- Invalid snapshot/claim states rejected; decimal formatting preserves precision.
- Production without host has no invented task data or balance.
- Shared gift rail persists across Tasks/Achievements and supports pause.
- Review entry never calls claim/verify.
- Double click submits one claim; displayed balance comes from server snapshot.
- Uncertain claim survives remount and retains operation identity until confirmed.
- Rejected verification grants nothing.
- Stale revisions cannot overwrite latest data.
- Host/account switching discards old in-flight responses.
- Untrusted title/description display as text.
- Retry is gated by server-based time.
- Destroy cleans up mounted UI.

Responsive browser check: Tasks and Achievements at 320, 360, 390, 430, 768 and 1440 px: no document horizontal overflow. Menu opens, Escape closes, focus returns. Reduced-motion disables the carousel animation. All page images loaded; no uncaught JavaScript errors in the final local run.

Run local suite after mounting: window.caseTasks.destroy(); import('/tests/browser-tests.js').then(m => m.runTests()).then(console.table).

Not tested: real CASE API, Telegram initData validation, account authorization, real wallet, reward ledger, withdrawals, or native Telegram iOS/Android WebViews. These are integration responsibilities, not implied passes. No production account/financial/reward operations were attempted.


## Final visual polish (v5)

All seven task cards and six achievements use original Telegram Gift thumbnails instead of large vector illustrations. Main card corners are 10px; buttons 6px. Task definitions, reward values and progress are unchanged. Filters checked: Daily 4, Limited 1, Social 2, All 7. Both tabs retain the shared gift rail. Responsive overflow rechecked at 320, 390, 430, 1440px.
