// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* PanelBuddyApp, part: The ports: the default panel, generating, pairing, selecting, the table and the swap/shuffle/reverse/shift moves.
   Mixed into PanelBuddyApp.prototype by js/panelBuddyApp.js (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

export class PanelBuddyPorts {
  loadInitialData() {
    this.generateDefaultPanel();
  }

  generateDefaultPanel() {
    this.panel.ports = [];
    const pairCount = 24;
    this.panel.portsPerRow = pairCount;
    this.panel.rackUnits = 2;
    // Row A (Top - Outputs)
    for (let i = 1; i <= pairCount; i++) {
      this.panel.ports.push({
        portNumber: i,
        label: `PREAMP ${i}`,
        endpoint: `MIC-PRE-01 / OUT-${i}`,
        signal: 'Analog Audio',
        connector: 'TT-Bantam',
        normalling: i <= 16 ? 'half' : 'full',
      });
    }
    // Row B (Bottom - Inputs)
    for (let i = 1; i <= pairCount; i++) {
      this.panel.ports.push({
        portNumber: pairCount + i,
        label: `DAW IN ${i}`,
        endpoint: `INTERFACE / IN-${i}`,
        signal: 'Analog Audio',
        connector: 'TT-Bantam',
        normalling: i <= 16 ? 'half' : 'full',
      });
    }
    this.selectedPortIndex = 0;
    this.render();
  }

  generatePorts(count) {
    this.panel.ports = [];
    for (let i = 1; i <= count; i++) {
      this.panel.ports.push({
        portNumber: i,
        label: `PORT ${i}`,
        endpoint: '',
        signal: 'Analog Audio',
        connector: 'XLR-F',
      });
    }
    this.selectedPortIndex = 0;
    this.render();
    this.changed();
  }

  batchSplitInOut() {
    const half = Math.floor(this.panel.ports.length / 2);
    this.panel.ports.forEach((p, idx) => {
      if (idx < half) {
        p.connector = 'XLR-F';
        p.signal = 'Audio In';
      } else {
        p.connector = 'XLR-M';
        p.signal = 'Audio Out';
      }
    });
    this.render();
    this.changed();
  }

  render() {
    this.renderPreview();
    this.renderTable();
    this.updateGeometrySummary();
    if (this.modalLabelMaker && this.modalLabelMaker.style.display === 'flex') {
      this.renderLabelMakerPreview();
    }
  }

  selectPort(idx) {
    if (idx < 0 || idx >= this.panel.ports.length) return;
    this.selectedPortIndex = idx;
    this.renderPreview();

    // Highlight the row in whichever table is up, and scroll it into view
    this.portTables?.select(idx);

    const p = this.panel.ports[idx];
    if (this.tableStatusLabel && p) {
      this.tableStatusLabel.textContent = `Selected Port #${p.portNumber ?? (idx + 1)}: ${p.label} (${p.connector})`;
    }
  }

  getPairs() {
    const pairCount = Math.max(1, this.panel.portsPerRow || Math.ceil(this.panel.ports.length / 2));
    const pairs = [];
    for (let ch = 1; ch <= pairCount; ch++) {
      const topIdx = ch - 1;
      const botIdx = topIdx + pairCount;
      const top = this.panel.ports[topIdx];
      const bot = this.panel.ports[botIdx];
      pairs.push({
        ch,
        channel: ch,
        topLabel: top?.label || `OUT ${ch}`,
        topEndpoint: top?.endpoint || '',
        topSignal: top?.signal || 'Analog Audio',
        bottomLabel: bot?.label || `IN ${ch}`,
        bottomEndpoint: bot?.endpoint || '',
        bottomSignal: bot?.signal || 'Analog Audio',
        normalling: top?.normalling || bot?.normalling || 'half',
      });
    }
    return pairs;
  }

  renderTable() {
    this.portTables.render(this.tableMode);
  }

  updateGeometrySummary() {
    const isWp = this.panel.formFactor === 'wallplate';
    const w = isWp ? 'Wall Plate' : '19.0″ (482.6mm)';
    const h = isWp ? 'Standard Gang' : `${this.panel.rackUnits}U (${(this.panel.rackUnits * 44.45).toFixed(1)}mm)`;
    const count = this.panel.ports.length;
    this.geometrySummary.textContent = `${w} · ${h} · ${count} CAD Connectors`;
  }

  swapOrMovePorts(fromIdx, targetIdx) {
    if (fromIdx === targetIdx || fromIdx < 0 || targetIdx < 0 || fromIdx >= this.panel.ports.length || targetIdx >= this.panel.ports.length) return;
    const moved = this.panel.ports.splice(fromIdx, 1)[0];
    this.panel.ports.splice(targetIdx, 0, moved);
    this.panel.ports.forEach((p, i) => { p.portNumber = i + 1; });
    this.selectPort(targetIdx);
    this.render();
    this.changed();
  }

  shufflePorts() {
    if (this.panel.ports.length <= 1) return;
    for (let i = this.panel.ports.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.panel.ports[i], this.panel.ports[j]] = [this.panel.ports[j], this.panel.ports[i]];
    }
    this.panel.ports.forEach((p, i) => { p.portNumber = i + 1; });
    this.render();
    this.changed();
  }

  reversePorts() {
    if (this.panel.ports.length <= 1) return;
    this.panel.ports.reverse();
    this.panel.ports.forEach((p, i) => { p.portNumber = i + 1; });
    this.render();
    this.changed();
  }

  shiftPorts(direction) {
    if (this.panel.ports.length <= 1) return;
    if (direction === 'left') {
      const first = this.panel.ports.shift();
      this.panel.ports.push(first);
    } else {
      const last = this.panel.ports.pop();
      this.panel.ports.unshift(last);
    }
    this.panel.ports.forEach((p, i) => { p.portNumber = i + 1; });
    this.render();
    this.changed();
  }
}
