# 🔌 EDITORS.PatchPanel — Patch Panel CAD & Normalling Schedule

Patch panels and patchbays: label strips, CAD panel visualisation and the normalling schedule.

**The 2,174 vendor models are parts in the BIM library** (`DATABASE.server.BIM`, class "Patch Panel", panel
geometry in `ext.patch_panel`); `js/patchPanelVendorCatalog.js` rebuilds the rows this editor has always used
from them (`/api/bim/parts?class=Patch Panel&full=1` in the browser, the library repo on disk under node). The
`data/vendors` copy it and PanelBuddy each carried is gone; the rows are field-for-field identical.
Tests: `node --test tests/*.test.mjs`.
