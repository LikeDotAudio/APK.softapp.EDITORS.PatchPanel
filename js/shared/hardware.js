// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* PanelBuddyApp, part: The hardware is a BIM part: the library picker and the part named beside each Library button.
   Mixed into PanelBuddyApp.prototype by js/panelBuddyApp.js (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

import { loadMasterCatalog, catalogError, rowForLibraryItem } from '../patchPanelVendorCatalog.js';
import { libraryButton, bimFields } from '../bimLibrary.js';
import { S } from './common.js';

export class PanelBuddyHardware {
  /* 📚 THE HARDWARE IS A BIM PART (ROAD-3572). The panel's hardware comes from the BIM
     library's picker (bimLibrary.js, Ctrl+Shift+L) — no vendor/model lists of this editor's
     own. The pick's ref is kept on the panel (bimId, bimRef) and saved with the block. */
  async setupHardwareCatalog() {
    const slots = ['hardware-library-slot', 'label-library-slot'].map(id => document.getElementById(id)).filter(Boolean);
    slots.forEach((slot, n) => slot.append(libraryButton(items => this.applyLibraryPart(items[0]), {
      className: 'btn btn-secondary btn-sm', title: 'Choose this panel\'s hardware from the BIM library',
      filter: { class: ['Patch Panel'] }, shortcut: n === 0,
    })));
    this.showHardwarePart();

    // the catalogue read: the panel geometry of a part the snapshot pick does not carry
    const preload = () => loadMasterCatalog().then(models => {
      this.masterCatalog = models;
      const fault = catalogError();
      if (fault) {
        S().showProblem(fault, {
          subject: 'BIM library (patch panel models)',
          fix: ['The model lists stay empty until the BIM library answers at /api/bim (DATABASE.server.BIM); the panel itself still works.'],
          onRetry: preload,
        });
      }
    }).catch(err => {
      console.warn('Catalog index preload notice:', err);
    });
    preload();
  }

  /** A part picked from the library becomes this panel's hardware, with its BIM reference. */
  async applyLibraryPart(item) {
    if (!item) return;
    const row = await rowForLibraryItem(item, { catalog: this.masterCatalog });
    const { bimId, bimRef } = bimFields(item);
    this.panel.bimId = bimId;
    if (bimRef) this.panel.bimRef = bimRef;
    this.panel.hardwareName = item.bim.name || `${row?.make || ''} ${row?.model || ''}`.trim();
    if (row) this.applyHardwareModel(row);
    else { this.render(); this.changed(); }
    this.showHardwarePart();
  }

  /** Name the panel's BIM part beside each 📚 Library button. */
  showHardwarePart() {
    for (const id of ['hardware-library-part', 'label-library-part']) {
      const el = globalThis.document?.getElementById(id);
      if (el) el.textContent = this.panel.bimId ? `${this.panel.hardwareName || this.panel.bimId} · ${this.panel.bimId}` : 'No BIM part chosen yet.';
    }
  }
}
