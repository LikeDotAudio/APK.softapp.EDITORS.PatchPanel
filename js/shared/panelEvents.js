// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* PanelBuddyApp, part: The bus and discovery status, the view/table chips and every event the editor listens to (attachEvents).
   Mixed into PanelBuddyApp.prototype by js/panelBuddyApp.js (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

import { fillEndpointsFromThings } from '../portTables.js';
import { S } from './common.js';

export class PanelBuddyEvents {
  /** The host is told of every edit; standalone there is nobody to tell. */
  changed() {
    this.host?.changed(this.toBlock(), this.blockMeta());
  }

  sayStatus(text, state) {
    if (!this.panelStatus) return;
    this.panelStatus.textContent = text;
    this.panelStatus.setAttribute('data-apk-state', state);
  }

  /** What the bus knows, through APKSoftapp; the kinds offered are config/discovery.json's. */
  async startDiscovery() {
    let kinds = [];
    const cfg = await S().fetchJson('./config/discovery.json', { cache: 'no-store', timeoutMs: 8000, subject: 'config/discovery.json' });
    if (cfg.ok) kinds = (cfg.data && cfg.data.kinds) || [];
    else S().showProblem(cfg.problem, { fix: ['Until config/discovery.json reads, every kind on the bus is offered.'] });
    const d = await S().discovered({ kinds, onChange: (things) => this.sayDiscovered(things) });
    this.discovery = d.ok ? d : null;
    if (!d.ok) {
      this.sayStatus(d.reason, 'dead');
      if (d.problem) {
        S().showProblem(d.problem, {
          subject: 'Discovered devices',
          fix: ['The panel can still be drawn, saved and exported without the bus; only “fill endpoints from discovered” needs it.'],
          onRetry: () => this.startDiscovery(),
        });
      }
    } else this.sayDiscovered(d.things());
  }

  sayDiscovered(things) {
    const good = things.filter((t) => t.live && t.live.state === 'good').length;
    this.sayStatus(`${things.length} discovered on the bus (${good} verified in the last ${S().TRUST_MINUTES} min)`,
      good ? 'good' : 'kinda');
  }

  /** Ports with no wire endpoint take the next discovered device (by MAC / serial). */
  fillEndpointsFromDiscovered() {
    if (!this.discovery) {
      S().showProblem('bus_missing', {
        subject: 'Fill endpoints from discovered',
        detail: this.panelStatus ? this.panelStatus.textContent : '',
        fix: ['Nothing has been discovered yet: wait for the status line to count devices on the bus, then press this again.'],
        onRetry: () => this.startDiscovery(),
      });
      return;
    }
    const n = fillEndpointsFromThings(this.panel.ports, this.discovery.things());
    this.sayStatus(n ? `Wired ${n} empty endpoint(s) to discovered devices.` : 'No empty endpoint, or nothing new on the bus.', 'kinda');
    if (!n) return;
    this.render();
    this.changed();
  }

  setupChips() {
    // Form Factor
    this.chipsForm.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        this.panel.formFactor = c.dataset.form;
        this.updateChipsState();
        this.render();
        this.changed();
      });
    });

    // Rack units
    const ruOptions = [1, 2, 3, 4];
    this.chipsRu.innerHTML = '';
    ruOptions.forEach(ru => {
      const chip = document.createElement('div');
      chip.className = `chip ${this.panel.rackUnits === ru ? 'active' : ''}`;
      chip.dataset.ru = ru;
      chip.textContent = `${ru}U (${(ru * 1.75).toFixed(2)}″)`;
      chip.addEventListener('click', () => {
        this.panel.rackUnits = ru;
        this.updateChipsState();
        this.render();
        this.changed();
      });
      this.chipsRu.appendChild(chip);
    });

    // Ports per row
    const pprOptions = [8, 12, 16, 24, 32, 48];
    this.chipsPpr.innerHTML = '';
    pprOptions.forEach(ppr => {
      const chip = document.createElement('div');
      chip.className = `chip ${this.panel.portsPerRow === ppr ? 'active' : ''}`;
      chip.dataset.ppr = ppr;
      chip.textContent = `${ppr} Ports`;
      chip.addEventListener('click', () => {
        this.panel.portsPerRow = ppr;
        this.updateChipsState();
        this.render();
        this.changed();
      });
      this.chipsPpr.appendChild(chip);
    });

    // View Modes
    this.chipsView.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        if (c.dataset.view === 'labelmaker') {
          this.openLabelMaker();
          return;
        }
        this.viewMode = c.dataset.view;
        this.chipsView.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.renderPreview();
      });
    });
  }

  updateChipsState() {
    this.chipsForm.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.form === this.panel.formFactor);
    });
    this.chipsRu.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.ru, 10) === this.panel.rackUnits);
    });
    this.chipsPpr.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.ppr, 10) === this.panel.portsPerRow);
    });
  }

  attachEvents() {
    this.btnOpen?.addEventListener('click', () => this.promptOpen());
    this.btnSave?.addEventListener('click', () => this.saveBlock());
    this.btnClose?.addEventListener('click', () => this.host.close());
    this.btnSyncDiscovered?.addEventListener('click', () => this.fillEndpointsFromDiscovered());

    this.inputPanelName.addEventListener('input', (e) => {
      this.panel.name = e.target.value;
      this.renderPreview();
      this.changed();
    });

    this.inputPanelRoom.addEventListener('input', (e) => {
      this.panel.room = e.target.value;
      this.renderPreview();
      this.changed();
    });

    // Table Mode Chips (Paired Patchbay Schedule vs Linear Ports)
    this.chipsTableMode?.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        this.tableMode = c.dataset.tableMode || 'paired';
        this.chipsTableMode.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.renderTable();
      });
    });

    // Main Page Hardware & Label Specs reactive inputs
    const onMainSpecChange = () => {
      const pitch = parseFloat(this.mainInputPitch?.value) || 17.5;
      const windowH = parseFloat(this.mainInputWindowH?.value) || 9.5;
      const datum = parseFloat(this.mainInputDatum?.value) || 13.75;
      const stripW = parseFloat(this.mainInputStripW?.value) || 430.0;
      const retaining = this.mainSelectRetaining?.value || 'slide_in';

      this.activeLabelProfile.pitchMm = pitch;
      this.activeLabelProfile.heightMm = windowH;
      this.activeLabelProfile.datumMm = datum;
      this.activeLabelProfile.widthMm = stripW;
      this.activeLabelProfile.retaining = retaining;

      this.panel.portPitchMm = pitch;
      this.panel.labelWindowHeightMm = windowH;
      this.panel.datumMm = datum;
      this.panel.datumOffsetMm = datum;
      this.panel.stripWidthMm = stripW;
      this.panel.retainingType = retaining;

      if (this.badgeHardwareType) this.badgeHardwareType.textContent = 'Custom Spec';

      if (this.inputGeomPitch) this.inputGeomPitch.value = pitch;
      if (this.inputGeomHeight) this.inputGeomHeight.value = windowH;
      if (this.inputGeomDatum) this.inputGeomDatum.value = datum;
      if (this.inputGeomWidth) this.inputGeomWidth.value = stripW;
      if (this.selectRetainingType) this.selectRetainingType.value = retaining;

      this.renderPreview();
      this.changed();
    };

    [this.mainInputPitch, this.mainInputWindowH, this.mainInputDatum, this.mainInputStripW, this.mainSelectRetaining].forEach(el => {
      el?.addEventListener('input', onMainSpecChange);
      el?.addEventListener('change', onMainSpecChange);
    });

    this.btnAddPort?.addEventListener('click', () => {
      if (this.tableMode === 'paired') {
        const pairCount = Math.max(1, this.panel.portsPerRow || Math.ceil(this.panel.ports.length / 2));
        const newCh = pairCount + 1;
        this.panel.portsPerRow = newCh;
        const topIdx = newCh - 1;
        
        // Insert new top port
        this.panel.ports.splice(topIdx, 0, {
          portNumber: topIdx + 1,
          label: `PREAMP ${newCh}`,
          endpoint: `MIC-PRE-01 / OUT-${newCh}`,
          signal: 'Analog Audio',
          connector: 'TT-Bantam',
          normalling: 'half',
        });
        // Append bottom port
        this.panel.ports.push({
          portNumber: this.panel.ports.length + 1,
          label: `DAW IN ${newCh}`,
          endpoint: `INTERFACE / IN-${newCh}`,
          signal: 'Analog Audio',
          connector: 'TT-Bantam',
          normalling: 'half',
        });
        this.panel.ports.forEach((p, idx) => { p.portNumber = idx + 1; });
      } else {
        const nextNum = this.panel.ports.length + 1;
        this.panel.ports.push({
          portNumber: nextNum,
          label: `PORT ${nextNum}`,
          endpoint: 'STAGE / BOX-01',
          signal: 'Analog Audio',
          connector: 'XLR-F',
        });
        this.selectedPortIndex = this.panel.ports.length - 1;
      }
      this.render();
      this.changed();
    });

    this.btnGeneratePorts?.addEventListener('click', () => {
      const targetCount = this.panel.portsPerRow * (this.panel.rackUnits || 1);
      this.generatePorts(targetCount);
    });

    this.btnBatchXlrF?.addEventListener('click', () => this.batchSetConnector('XLR-F'));
    this.btnBatchEthercon?.addEventListener('click', () => this.batchSetConnector('EtherCON'));
    this.btnBatchBnc?.addEventListener('click', () => this.batchSetConnector('BNC'));
    this.btnBatchSplit?.addEventListener('click', () => this.batchSplitInOut());

    this.btnExportCsv?.addEventListener('click', () => this.exportCsv());
    this.btnExportSvg?.addEventListener('click', () => this.exportCadSvg());
    this.btnExportDxf?.addEventListener('click', () => this.exportCadDxf());
    this.btnExportIfc?.addEventListener('click', () => this.exportCadIfc());
    this.btnOpenCad?.addEventListener('click', () => this.openInCad());
    this.btnPrint?.addEventListener('click', () => window.print());

    this.btnShuffle?.addEventListener('click', () => this.shufflePorts());
    this.btnReverse?.addEventListener('click', () => this.reversePorts());
    this.btnShiftLeft?.addEventListener('click', () => this.shiftPorts('left'));
    this.btnShiftRight?.addEventListener('click', () => this.shiftPorts('right'));

    // Label Maker Open / Close
    this.btnOpenLabelmaker?.addEventListener('click', () => this.openLabelMaker());
    this.btnCloseLabelmaker?.addEventListener('click', () => this.closeLabelMaker());
  }
}
