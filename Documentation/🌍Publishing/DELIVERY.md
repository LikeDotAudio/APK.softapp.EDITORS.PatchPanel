# Delivery — EDITORS.PatchPanel

## Delivered 2026-11-11 – 2026-11-12

From this repository's own commits (the commit message is the record):

- vendor: apk-contracts web bundle refreshed from contracts/generated/web (report.ts: LogLine + ProblemRecord, System/Problems family) (`17b5d05`)
- vendor/apk-softapp: re-vendored — every problem card is reported through the SDK (ROAD-3695 step 2) (`7f7930c`)
- vendor: apk-contracts web bundle refreshed from contracts/generated/web (five report codes, ROAD-3695; unit-gate, ROAD-3684) (`6c1184c`)
- re-vendor apk-contracts web bundle: contracts 2.4.0 retires APK.audio/Tests/{suite} (ROAD-3729) (`efe5c4c`)
- wiki: lanes, README and smoke result refreshed (wiki.py + smoke.py) (`c66ccb5`)
- docs(smoke): pass — results in the wiki (`e2c6b19`)
- vendor: apk-contracts re-vendored (contracts gained the youtube_audio problem codes, root f013ba68a) (`d9f6d6f`)
- vendor/apk-contracts: refresh to contracts/generated/web after ROAD-3759 (contracts split; CHAT_TOPIC origin note) (`b43d15b`)
- ROAD-3766: panelBuddyApp.js split; the methods it shares with PanelBuddy are a tested byte copy in js/shared/ (1,216 -> 451 lines) (`7f39a6e`)
- vendor: apk-softapp / apk-table re-joined from their parts (one GENERATED banner line; ROAD-3762) (`9fa7b24`)
- ROAD-3783: the preview drop saves the connector's label, as PanelBuddy does (`90e9d3d`)

## Releases
- **Released `2.0.0`, tag `v2.0.0`** (2026-11-05, ROAD-3452, the owner's V2) — no SDK pin; every manifest says 2.0.0; GitHub release `v2.0.0`.
