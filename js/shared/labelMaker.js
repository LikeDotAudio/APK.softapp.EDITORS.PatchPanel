// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* PanelBuddyApp, part: The label maker: its profile inputs, preview, 1:1 print and SVG export.
   Mixed into PanelBuddyApp.prototype by js/panelBuddyApp.js (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

import { LABEL_MECHANICAL_PRESETS, renderMechanicalLabelStripSvg, generatePrintableSheetHtml } from '../patchLabelGeometryEngine.js';
import { S } from './common.js';

export class PanelBuddyLabelMaker {
  setupLabelMaker() {
    if (!this.selectLabelPreset) return;

    this.selectLabelPreset.innerHTML = '';
    LABEL_MECHANICAL_PRESETS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      this.selectLabelPreset.appendChild(opt);
    });

    this.selectLabelPreset.value = this.activeLabelProfile.id;

    this.selectLabelPreset.addEventListener('change', (e) => {
      const selected = LABEL_MECHANICAL_PRESETS.find(p => p.id === e.target.value);
      if (selected) {
        this.activeLabelProfile = { ...selected };
        this.syncInputsFromLabelProfile();
        this.renderLabelMakerPreview();
      }
    });

    const bindInput = (el, prop, isNum = true) => {
      el?.addEventListener('input', (e) => {
        this.activeLabelProfile[prop] = isNum ? parseFloat(e.target.value) || 0 : e.target.value;
        this.activeLabelProfile.id = 'custom';
        this.selectLabelPreset.value = 'custom';
        this.renderLabelMakerPreview();
      });
    };

    bindInput(this.inputGeomWidth, 'widthMm');
    bindInput(this.inputGeomHeight, 'heightMm');
    bindInput(this.inputGeomPitch, 'pitchMm');
    bindInput(this.inputGeomDatum, 'datumMm');
    bindInput(this.inputGeomBlocks, 'modularBlocks');
    bindInput(this.inputGeomBlockgap, 'blockGapMm');
    bindInput(this.selectRetainingType, 'retaining', false);

    [this.chkHighContrast, this.chkShowDimensions, this.chkShowColorBar, this.chkShowCalibRuler].forEach(chk => {
      chk?.addEventListener('change', () => this.renderLabelMakerPreview());
    });

    this.btnLabelPrint1to1?.addEventListener('click', () => this.printLabel1to1());
    this.btnLabelExportSvg?.addEventListener('click', () => this.exportLabelSvg());
    this.btnLabelExportCsv?.addEventListener('click', () => this.exportCsv());
  }

  syncInputsFromLabelProfile() {
    const p = this.activeLabelProfile;
    const pitch = p.pitchMm ?? p.portPitchMm ?? 17.5;
    const height = p.heightMm ?? p.labelWindowHeightMm ?? 9.5;
    const datum = p.datumMm ?? p.datumOffsetMm ?? 13.75;
    const width = p.widthMm ?? p.stripWidthMm ?? 430.0;
    const retaining = p.retaining ?? p.retainingType ?? 'slide_in';

    // Main editing page sidebar controls
    if (this.mainInputPitch) this.mainInputPitch.value = pitch;
    if (this.mainInputWindowH) this.mainInputWindowH.value = height;
    if (this.mainInputDatum) this.mainInputDatum.value = datum;
    if (this.mainInputStripW) this.mainInputStripW.value = width;
    if (this.mainSelectRetaining) this.mainSelectRetaining.value = retaining;
    if (this.badgeHardwareType) this.badgeHardwareType.textContent = p.name ? p.name.split(' ')[0] : 'Standard';

    // Modal controls
    if (this.inputGeomWidth) this.inputGeomWidth.value = width;
    if (this.inputGeomHeight) this.inputGeomHeight.value = height;
    if (this.inputGeomPitch) this.inputGeomPitch.value = pitch;
    if (this.inputGeomDatum) this.inputGeomDatum.value = datum;
    if (this.inputGeomBlocks) this.inputGeomBlocks.value = p.modularBlocks || 1;
    if (this.inputGeomBlockgap) this.inputGeomBlockgap.value = p.blockGapMm || 0;
    if (this.selectRetainingType) this.selectRetainingType.value = retaining;

    // Sync to panel
    this.panel.portPitchMm = pitch;
    this.panel.labelWindowHeightMm = height;
    this.panel.datumMm = datum;
    this.panel.datumOffsetMm = datum;
    this.panel.stripWidthMm = width;
    this.panel.retainingType = retaining;
  }

  openLabelMaker() {
    if (this.modalLabelMaker) {
      this.modalLabelMaker.style.display = 'flex';
      this.syncInputsFromLabelProfile();
      this.renderLabelMakerPreview();
    }
  }

  closeLabelMaker() {
    if (this.modalLabelMaker) {
      this.modalLabelMaker.style.display = 'none';
    }
  }

  renderLabelMakerPreview() {
    if (!this.labelmakerPreviewStage) return;

    const options = {
      highContrast: this.chkHighContrast ? this.chkHighContrast.checked : true,
      showDimensions: this.chkShowDimensions ? this.chkShowDimensions.checked : true,
      showSignalColorBar: this.chkShowColorBar ? this.chkShowColorBar.checked : true,
      showCropMarks: true,
      showRuler: this.chkShowCalibRuler ? this.chkShowCalibRuler.checked : true
    };

    const svg = renderMechanicalLabelStripSvg(this.panel, this.activeLabelProfile, options);
    this.labelmakerPreviewStage.innerHTML = svg;

    if (this.labelmakerSpecsBadge) {
      const p = this.activeLabelProfile;
      this.labelmakerSpecsBadge.textContent = `${this.panel.ports.length}P · W=${p.widthMm}mm · P=${p.pitchMm}mm · X₀=${p.datumMm}mm · ${p.retaining.toUpperCase()}`;
    }
  }

  printLabel1to1() {
    const pageSize = this.selectPrintSize?.value || 'letter';
    const copies = parseInt(this.inputPrintCopies?.value, 10) || 3;
    const html = generatePrintableSheetHtml(this.panel, this.activeLabelProfile, { pageSize, copies });

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
    } else {
      S().showProblem('permission_denied', {
        subject: '1:1 print sheet',
        detail: 'The browser blocked the pop-up window the print sheet opens in.',
        fix: ['Allow pop-ups for this page (the blocked-pop-up icon in the address bar), then press Print 1:1 again.',
          'Or use Export SVG: the label strip downloads at 1:1 scale.'],
        onRetry: () => this.printLabel1to1(),
      });
    }
  }

  exportLabelSvg() {
    const options = {
      highContrast: true,
      showDimensions: false,
      showSignalColorBar: true,
      showCropMarks: true,
      showRuler: true
    };
    const svg = renderMechanicalLabelStripSvg(this.panel, this.activeLabelProfile, options);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.panel.name || 'patch_panel'}_label_strip_1to1.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
