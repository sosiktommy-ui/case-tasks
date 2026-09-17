# CASE — Tasks & Rewards

English frontend for CASE Tasks and Achievements. Charcoal CASE shell, shared animated gift rail, blue Wheel navigation, yellow promotional banner and real Telegram Gift imagery.

## Entries

- index.html: production entry. No sample account, balance, task progress or rewards. Without a CASE host, shows a public discovery view and working links to the official Mini App and gift pages.
- embed.html: production entry for integration into CASE. Same behavior; pass CASE_TASKS_EMBEDDED=true when the host already renders its shell and gift rail.
- preview.html: isolated, explicitly labelled design review with sample tasks. Never imported by the production entry.

The full task interface switches on when the developer provides window.CASE_TASKS_HOST. API integration, identity, wallet operations and real reward issuing belong to CASE. No server credentials are needed in this page.

## Local run

Serve this directory over HTTP (for example: python -m http.server 4173). Open http://127.0.0.1:4173/. No install or build step.

## Files

- scripts/app.js: UI, tabs, shared carousel, dialogs and host lifecycle.
- scripts/model.js: state validation, exact decimal display, operation identity.
- scripts/gifts.js: public collectible assets.
- scripts/main.js: production bootstrap.
- styles.css: responsive surfaces, depth and motion with reduced-motion support.
- docs/INTEGRATION.md: complete adapter contract and server responsibilities.
- docs/ASSETS.md: public sources and illustration provenance.
- docs/QA.md: checks and limits.

The carousel displays collectible designs, not fabricated live wins. Collection cards are illustrative and do not promise that a pictured gift is a task reward.
