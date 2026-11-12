// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* PanelBuddyApp, part: Saving, opening and exporting: the block meta, Save, IFC load, CSV/DXF/IFC export, Open in CAD and Open.
   Mixed into PanelBuddyApp.prototype by js/panelBuddyApp.js (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

import { downloadPanelDxf, downloadPanelIfc, openInCadLikeAudio } from '../cadLikeAudioBridge.js';
import { panelToIfc, panelFromIfc, schemaOf } from '../panelIfc.js';
import { S } from './common.js';

export class PanelBuddyFiles {
  blockMeta() {
    return { title: this.panel.name, filename: `panel_${String(this.panel.name || 'panel').toLowerCase().replace(/[^a-z0-9]/g, '_')}` };
  }

  /** Save: into the drawing inside the CAD. Standalone: the block and its .ifc twin, both or neither (Save Model). */
  async saveBlock() {
    const block = this.toBlock();
    const meta = this.blockMeta();
    const A = S();
    if (this.host.embedded || typeof A.saveModel !== 'function') return this.host.save(block, meta);
    const r = await A.saveModel(block, { name: meta.filename, toIfc: (b) => panelToIfc(b, { name: meta.filename }) });
    if (!r.ok && !r.cancelled) A.showProblem(r.problem || 'save_failed', { onRetry: () => this.saveBlock() });
    return r.ok ? r.via : '';
  }

  /** An IFC model's patch panel (panelIfc.js); false (and a problem card) when it holds none. */
  loadIfc(text, name) {
    let block;
    try {
      block = panelFromIfc(text);
    } catch (err) {
      S().showProblem('bad_input', { subject: name, detail: err.message, fix: ['Open an .ifc saved by this editor, or one with an IfcDistributionBoard (DISTRIBUTIONFRAME) or IfcOutlet and its ports.'] });
      return false;
    }
    this.handleBlockLoaded(block, { title: `${name} · ${schemaOf(text)}` });
    this.changed();
    return true;
  }

  exportCsv() {
    if (this.tableMode === 'paired') {
      const headers = ['Channel', 'Top Label (Output/Source)', 'Top Wire Endpoint', 'Bottom Label (Input/Destination)', 'Bottom Wire Endpoint', 'Normalling'];
      const pairCount = Math.max(1, this.panel.portsPerRow || Math.ceil(this.panel.ports.length / 2));
      const rows = [];
      for (let ch = 1; ch <= pairCount; ch++) {
        const top = this.panel.ports[ch - 1] || {};
        const bot = this.panel.ports[ch - 1 + pairCount] || {};
        rows.push([
          ch,
          `"${top.label || ''}"`,
          `"${top.endpoint || ''}"`,
          `"${bot.label || ''}"`,
          `"${bot.endpoint || ''}"`,
          `"${top.normalling || bot.normalling || 'half'}"`
        ]);
      }
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.panel.name || 'patchbay'}_schedule.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const headers = ['Port Number', 'Connector', 'Port Label', 'Destination', 'Signal Format'];
    const rows = this.panel.ports.map(p => [
      p.portNumber,
      `"${p.connector || 'XLR'}"`,
      `"${p.label || ''}"`,
      `"${p.endpoint || ''}"`,
      `"${p.signal || ''}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.panel.name || 'patch_panel'}_schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** The panel's .ifc twin (the file Save Model writes), which the DXF also carries on its hidden APK_IFC layer. */
  panelIfc() {
    return panelToIfc(this.toBlock(), { name: this.blockMeta().filename });
  }

  exportCadDxf() {
    downloadPanelDxf(this.panel, null, window, this.panelIfc());
  }

  /** Export IFC: beside Export DXF, the same panel as IFC4X3_ADD2 (ROAD-3598). */
  exportCadIfc() {
    downloadPanelIfc(this.panel, this.panelIfc());
  }

  openInCad() {
    openInCadLikeAudio(this.panel, { onStatus: (text, state) => this.sayStatus(text, state), ifc: this.panelIfc() });
  }

  /** Open a panel .json or an IFC model (.ifc; an ISO 10303-21 header decides for any other name). */
  async promptOpen() {
    const A = S();
    if (typeof A.openModel === 'function') {
      const r = await A.openModel({});
      if (!r.ok) { if (!r.cancelled) A.showProblem(r.problem, { onRetry: () => this.promptOpen() }); return; }
      if (r.kind === 'ifc') this.loadIfc(r.text, r.name);
      else { this.handleBlockLoaded(r.model, { title: r.name }); this.changed(); }
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target.result);
          this.handleBlockLoaded(parsed, { title: file.name });
        } catch (err) {
          S().showProblem(err.name === 'SyntaxError' ? 'bad_json' : 'bad_input', {
            subject: file.name, detail: err.message,
            fix: ['Open a panel block saved by this editor (.json, blockType panel).'],
          });
        }
      };
      reader.onerror = () => S().showProblem('file_unreadable', { subject: file.name, detail: reader.error && reader.error.message });
      reader.readAsText(file);
    };
    input.click();
  }
}
