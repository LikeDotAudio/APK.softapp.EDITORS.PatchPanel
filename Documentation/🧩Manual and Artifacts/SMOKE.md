# Smoke test — EDITORS.PatchPanel

Is `EDITORS.PatchPanel` deployed? Written by `.apk.scripts/smoke.py` from the module's own shape; what each check means is in that script's header.

← [Wiki home](../README.md)

**✅ PASS** — 3/3 checks, since 2026-11-04 21:31 EST

| Check | Target | Result | Detail |
|---|---|---|---|
| pushed | [APK.softapp.EDITORS.PatchPanel](https://github.com/LikeDotAudio/APK.softapp.EDITORS.PatchPanel.git) | ✅ | HEAD is on origin |
| web | [index.html](https://apk.audio/APK%3ASoftapps/EDITORS/EDITORS.PatchPanel/index.html) | ✅ | HTTP 200 |
| app | `OS/Patch Panel` → `PODS/POD.THIN/Softapps/EDITORS/EDITORS.PatchPanel/index.html` | ✅ | present |

Re-run: `python3 .apk.scripts/smoke.py PODS/POD.THIN/Softapps/EDITORS/EDITORS.PatchPanel`

<!-- smoke:sig a92f91a8bf89 since 2026-11-04 21:31 EST -->
