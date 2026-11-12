// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Authentic 19-Inch EIA Rack Panel CAD Builder with True Vector Connectors

import { CAD_CONNECTOR_CATALOG, getConnectorMeta } from './cadConnectorSymbols.js';
import { renderCadPanelSvg } from './cadPanelVisualizer.js';
import { LABEL_MECHANICAL_PRESETS } from './patchLabelGeometryEngine.js';
import { modelToMechanicalPreset } from './patchPanelVendorCatalog.js';
import { createPortTables } from './portTables.js';
import { mixInto, S } from './shared/common.js';
import { PanelBuddyEvents } from './shared/panelEvents.js';
import { PanelBuddyLabelMaker } from './shared/labelMaker.js';
import { PanelBuddyHardware } from './shared/hardware.js';
import { PanelBuddyPorts } from './shared/ports.js';
import { PanelBuddyFiles } from './shared/files.js';

/* The editor. Its methods are grouped in js/shared/*.js (one source with the other
   panel editor) and in this app's own modules, mixed into this prototype below. */
export class PanelBuddyApp {
  constructor() {
    this.panel = {
      id: 'pnl_main_01',
      name: 'PP-AUDIO-01',
      room: 'MDF / RACK-01 · U14',
      formFactor: 'rack', // 'rack' | 'wallplate'
      portsPerRow: 24,
      rackUnits: 2,
      ports: [],
    };

    this.selectedPortIndex = 0;
    this.viewMode = 'faceplate'; // 'faceplate' | 'drill' | 'scribble' | 'labelmaker'
    this.tableMode = 'paired'; // 'paired' | 'linear'
    this.zoom = 1;

    this.activeLabelProfile = { ...LABEL_MECHANICAL_PRESETS[0] };

    this.discovery = null; // APKSoftapp.discovered() handle, once the bus answers

    this.initElements();
    this.attachEvents();
    this.setupChips();
    this.setupConnectorPalette();
    this.setupLabelMaker();
    this.setupHardwareCatalog();
    this.loadInitialData();

    // The CAD (cad.like.audio/host@1): load replaces the panel; request asks for the block.
    S().inheritTheme();
    S().describe({
      name: 'Patch Panel',
      does: 'Builds a 19-inch rack or wall-plate panel: ports, connectors, labels and wire endpoints, drawn in mm and exported for fabrication and label printing.',
      inputs: [
        { name: 'Panel block', from: 'the CAD block this editor was opened on (host@1 load)', kind: 'cad' },
        { name: 'Panel file', from: '.json picked with Open', kind: 'file' },
        { name: 'Panel / label models', from: 'the BIM library, class Patch Panel (/api/bim/parts)', kind: 'http' },
        { name: 'Discovered devices', from: 'APKSoftapp.discovered() on the bus, kinds from config/discovery.json', kind: 'bus' },
      ],
      outputs: [
        { name: 'Panel block', to: 'the CAD drawing on Save; standalone, panel_<name>.json beside its .ifc twin (Save Model)', kind: 'cad' },
        { name: 'IFC twin', to: 'panel_<name>.ifc (IFC4X3_ADD2) with the .json when standalone: the panel an IfcDistributionBoard DISTRIBUTIONFRAME (a wall plate an IfcOutlet), each port an IfcDistributionPort, each endpoint joined by IfcRelConnectsPorts', kind: 'file' },
        { name: 'Live edits', to: 'the CAD after every change (blockChanged)', kind: 'cad' },
        { name: 'Schedule', to: '<name>_schedule.csv (paired or linear, as the table shows)', kind: 'file' },
        { name: 'Drawing', to: '<name>_cad_<view>.svg, <name>_fabrication.dxf (every object of the .ifc twin on its hidden APK_IFC layer, apk-ifc-dxf/1) and <name>_fabrication.ifc (Export IFC)', kind: 'file' },
        { name: 'Open in CAD', to: 'a new CAD window handed the DXF over host@1 (downloads the DXF if pop-ups are blocked)', kind: 'cad' },
        { name: 'Label strip', to: '1:1 print sheet (pop-up), label strip .svg, labels .csv', kind: 'file' },
      ],
      controls: [
        { name: 'Name / room', how: 'the panel name (used in every file name) and its room' },
        { name: 'Form, RU, ports per row', how: 'chips: rack or wall plate, rack units, density' },
        { name: 'View', how: 'chips: Faceplate, Drill, Scribble, Label maker' },
        { name: 'Connector palette', how: 'click to set the selected port, or drag onto a port; drag a port onto another to swap' },
        { name: '+ Add Port / Pair, Fill Grid to Density', how: 'add one port (pair), or fill the grid' },
        { name: 'Fill All / Split 50/50', how: 'set every port to XLR-F, EtherCON or BNC, or half XLR-F / half XLR-M' },
        { name: 'Shuffle / Reverse / Shift ◀ ▶', how: 'reorder the ports' },
        { name: 'Port table', how: 'paired or linear: edit label, connector, endpoint, signal, normalling' },
        { name: 'Hardware / label model', how: 'pick a vendor and model from the BIM library to set pitch, window height, datum, strip width' },
        { name: 'Fill endpoints from discovered', how: 'give each empty endpoint the next device on the bus (by MAC / serial)' },
        { name: 'Open / Save / ✕', how: 'open a panel .json or .ifc, save into the CAD (standalone: the .json and its .ifc twin), close the editor' },
      ],
      problems: ['bad_json', 'bad_input', 'file_unreadable', 'http_not_found', 'fetch_failed', 'bus_missing', 'permission_denied', 'not_in_cad', 'save_failed'],
    });
    this.host = S().connectHost({
      editor: 'Panel Buddy',
      blockType: 'panel',
      onLoad: (block, meta) => {
        this.handleBlockLoaded(block, meta);
        const tag = document.getElementById('block-tag');
        if (tag) tag.textContent = meta.title || meta.blockName || meta.name || 'PANEL BLOCK';
      },
      onRequest: () => ({ block: this.toBlock(), meta: this.blockMeta() }),
    });
    this.startDiscovery();
  }

  initElements() {
    this.btnOpen = document.getElementById('btn-open');
    this.btnSave = document.getElementById('btn-save');
    this.btnClose = document.getElementById('btn-close');
    this.btnSyncDiscovered = document.getElementById('btn-sync-discovered');

    this.inputPanelName = document.getElementById('input-panel-name');
    this.inputPanelRoom = document.getElementById('input-panel-room');
    this.chipsForm = document.getElementById('chips-form');
    this.chipsRu = document.getElementById('chips-ru');
    this.chipsPpr = document.getElementById('chips-ppr');
    this.chipsView = document.getElementById('chips-view');

    this.connectorPalette = document.getElementById('connector-palette');
    this.geometrySummary = document.getElementById('geometry-summary');
    this.previewStage = document.getElementById('preview-stage');
    this.tableStatusLabel = document.getElementById('table-status-label');

    // Main Page Hardware & Label Specs
    this.mainInputPitch = document.getElementById('main-input-pitch');
    this.mainInputWindowH = document.getElementById('main-input-window-h');
    this.mainInputDatum = document.getElementById('main-input-datum');
    this.mainInputStripW = document.getElementById('main-input-strip-w');
    this.mainSelectRetaining = document.getElementById('main-select-retaining');
    this.badgeHardwareType = document.getElementById('badge-hardware-type');

    // Table Mode & Paired Table Elements
    this.chipsTableMode = document.getElementById('chips-table-mode');
    this.tablePaired = document.getElementById('table-paired');
    this.tableLinear = document.getElementById('table-linear');
    this.panelStatus = document.getElementById('panel-status');
    this.portTables = createPortTables(this, {
      pairedHost: this.tablePaired,
      linearHost: this.tableLinear,
      connectorOptions: () => CAD_CONNECTOR_CATALOG.map(c => c.label),
    });

    this.btnAddPort = document.getElementById('btn-add-port');
    this.btnGeneratePorts = document.getElementById('btn-generate-ports');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.btnExportSvg = document.getElementById('btn-export-svg');
    this.btnExportDxf = document.getElementById('btn-export-dxf');
    this.btnExportIfc = document.getElementById('btn-export-ifc');
    this.btnOpenCad = document.getElementById('btn-open-cad');
    this.btnPrint = document.getElementById('btn-print');

    this.btnBatchXlrF = document.getElementById('btn-batch-xlrf');
    this.btnBatchEthercon = document.getElementById('btn-batch-ethercon');
    this.btnBatchBnc = document.getElementById('btn-batch-bnc');
    this.btnBatchSplit = document.getElementById('btn-batch-split');

    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnReverse = document.getElementById('btn-reverse');
    this.btnShiftLeft = document.getElementById('btn-shift-left');
    this.btnShiftRight = document.getElementById('btn-shift-right');

    // Hardware Catalog Elements

    // Label Maker Studio Elements
    this.btnOpenLabelmaker = document.getElementById('btn-open-labelmaker');
    this.modalLabelMaker = document.getElementById('modal-label-maker');
    this.btnCloseLabelmaker = document.getElementById('btn-close-labelmaker');

    this.selectLabelPreset = document.getElementById('select-label-preset');
    this.selectRetainingType = document.getElementById('select-retaining-type');

    this.inputGeomWidth = document.getElementById('input-geom-width');
    this.inputGeomHeight = document.getElementById('input-geom-height');
    this.inputGeomPitch = document.getElementById('input-geom-pitch');
    this.inputGeomDatum = document.getElementById('input-geom-datum');
    this.inputGeomBlocks = document.getElementById('input-geom-blocks');
    this.inputGeomBlockgap = document.getElementById('input-geom-blockgap');

    this.chkHighContrast = document.getElementById('chk-high-contrast');
    this.chkShowDimensions = document.getElementById('chk-show-dimensions');
    this.chkShowColorBar = document.getElementById('chk-show-color-bar');
    this.chkShowCalibRuler = document.getElementById('chk-show-calib-ruler');

    this.labelmakerSpecsBadge = document.getElementById('labelmaker-specs-badge');
    this.labelmakerPreviewStage = document.getElementById('labelmaker-preview-stage');

    this.selectPrintSize = document.getElementById('select-print-size');
    this.inputPrintCopies = document.getElementById('input-print-copies');

    this.btnLabelPrint1to1 = document.getElementById('btn-label-print-1to1');
    this.btnLabelExportSvg = document.getElementById('btn-label-export-svg');
    this.btnLabelExportCsv = document.getElementById('btn-label-export-csv');
  }

  setupConnectorPalette() {
    this.connectorPalette.innerHTML = '<span style="font-size:10px; font-weight:700; color:var(--osc-accent-primary); margin-right:4px;">🎯 DRAG & DROP ONTO PANEL:</span>';

    CAD_CONNECTOR_CATALOG.forEach(conn => {
      const btn = document.createElement('button');
      btn.className = 'conn-palette-btn';
      btn.dataset.connId = conn.id;
      btn.setAttribute('draggable', 'true');
      btn.title = `Drag and drop onto panel, or click to apply: ${conn.desc} (${conn.category})`;
      btn.innerHTML = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${S().esc(conn.color)};"></span><span>${S().esc(conn.label)}</span>`;
      
      btn.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'CONNECTOR_PALETTE_ITEM',
          connectorId: conn.id
        }));
        e.dataTransfer.effectAllowed = 'copy';
      });

      btn.addEventListener('click', () => {
        this.applyConnectorToSelected(conn.id);
      });
      this.connectorPalette.appendChild(btn);
    });
  }

  applyHardwareModel(model) {
    if (!model) return;
    const preset = modelToMechanicalPreset(model);
    this.activeLabelProfile = preset;

    // Determine RU and ports
    const ruNum = parseInt(model.rackUnits) || 1;
    this.panel.rackUnits = Math.min(4, Math.max(1, ruNum));

    const totalPorts = Number(model.portCount) || 24;
    if (ruNum > 1 && totalPorts % ruNum === 0) {
      this.panel.portsPerRow = Math.round(totalPorts / ruNum);
    } else {
      this.panel.portsPerRow = Math.min(48, totalPorts);
    }

    // Determine default connector for this hardware type
    let defaultConn = 'XLR-F';
    const t = String(model.type).toLowerCase();
    if (t.includes('data') || t.includes('keystone')) defaultConn = 'EtherCON';
    else if (t.includes('jack') || t.includes('audio') || t.includes('bantam')) defaultConn = 'TT-Bantam';
    else if (t.includes('video') || t.includes('bnc')) defaultConn = 'BNC';

    // Adjust port array length
    const current = this.panel.ports || [];
    if (current.length < totalPorts) {
      for (let i = current.length + 1; i <= totalPorts; i++) {
        current.push({
          portNumber: i,
          label: `PORT ${i}`,
          endpoint: '',
          signal: t.includes('data') ? 'Cat6A' : t.includes('video') ? '12G-SDI' : 'Analog Audio',
          connector: defaultConn
        });
      }
    } else if (current.length > totalPorts) {
      this.panel.ports = current.slice(0, totalPorts);
    }

    // Set panel name to reflect hardware model if default name
    if (this.panel.name.startsWith('PP-AUDIO') || this.panel.name.startsWith('PP-')) {
      this.panel.name = `PP-${model.make.toUpperCase().replace(/\s+/g, '')}-${model.model}`;
      if (this.inputPanelName) this.inputPanelName.value = this.panel.name;
    }

    this.updateChipsState();
    this.syncInputsFromLabelProfile();
    this.render();

    if (this.modalLabelMaker && this.modalLabelMaker.style.display !== 'none') {
      this.renderLabelMakerPreview();
    }
    this.changed();
  }

  applyConnectorToSelected(connectorId) {
    if (this.selectedPortIndex === null || !this.panel.ports[this.selectedPortIndex]) {
      this.selectedPortIndex = 0;
    }
    const meta = getConnectorMeta(connectorId);
    if (!meta) return;

    this.panel.ports[this.selectedPortIndex].connector = meta.label;
    this.render();
    this.changed();
  }

  batchSetConnector(connType) {
    this.panel.ports.forEach(p => { p.connector = connType; });
    this.render();
    this.changed();
  }

  handleBlockLoaded(block, meta = {}) {
    if (!block) return;
    this.panel.id = block.id || this.panel.id;
    this.panel.name = block.name || block.panelLabel || this.panel.name;
    this.panel.room = block.room || (Array.isArray(block.roomPath) ? block.roomPath.join(' > ') : this.panel.room);
    this.panel.portsPerRow = block.portsPerRow || (block.pairCount ? block.pairCount : this.panel.portsPerRow);
    this.panel.rackUnits = block.rackUnits || (block.pairCount ? 2 : this.panel.rackUnits);
    this.panel.formFactor = block.formFactor || this.panel.formFactor;
    this.panel.bimId = block.bimId || '';
    this.panel.bimRef = block.bimRef && block.bimRef.part ? block.bimRef : null;
    this.panel.hardwareName = block.hardwareName || '';
    this.showHardwarePart?.();

    if (Array.isArray(block.pairs) && block.pairs.length > 0) {
      this.tableMode = 'paired';
      const pairCount = block.pairs.length;
      this.panel.portsPerRow = pairCount;
      this.panel.rackUnits = Math.max(1, block.rackUnits || 2);
      this.panel.ports = [];
      // Row 1 (Outputs)
      block.pairs.forEach((p, idx) => {
        this.panel.ports.push({
          portNumber: idx + 1,
          label: p.topLabel || `CH ${p.ch || idx + 1}`,
          endpoint: p.topEndpoint || '',
          signal: p.topSignal || 'Analog Audio',
          connector: p.connector || 'TT-Bantam',
          normalling: p.normalling || p.normalMode || 'half'
        });
      });
      // Row 2 (Inputs)
      block.pairs.forEach((p, idx) => {
        this.panel.ports.push({
          portNumber: pairCount + idx + 1,
          label: p.bottomLabel || `CH ${p.ch || idx + 1} (IN)`,
          endpoint: p.bottomEndpoint || '',
          signal: p.bottomSignal || 'Analog Audio',
          connector: p.connector || 'TT-Bantam',
          normalling: p.normalling || p.normalMode || 'half'
        });
      });
    } else if (Array.isArray(block.ports)) {
      this.panel.ports = block.ports.map((p, idx) => ({
        portNumber: p.portNumber ?? (idx + 1),
        label: p.label || p.portLabel || `P${idx + 1}`,
        endpoint: p.endpoint || p.destination || p.outputTo || '',
        signal: p.signal || 'Analog Audio',
        connector: p.connector || 'XLR-F',
        normalling: p.normalling || p.normalMode || 'half',
      }));
    }

    if (this.inputPanelName) this.inputPanelName.value = this.panel.name;
    if (this.inputPanelRoom) this.inputPanelRoom.value = this.panel.room;
    this.updateChipsState();
    this.render();
  }

  renderPreview() {
    const svgContent = renderCadPanelSvg(this.panel, {
      viewMode: this.viewMode,
      selectedPortIndex: this.selectedPortIndex,
      zoom: this.zoom,
    });

    this.previewStage.innerHTML = svgContent;

    // Attach interactive click and drag-and-drop listeners to all CAD ports
    this.previewStage.querySelectorAll('.cad-panel-port').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.portIndex, 10);
        if (!isNaN(idx)) {
          this.selectPort(idx);
        }
      });

      // Drag port to shuffle / swap positions
      el.addEventListener('dragstart', (e) => {
        const idx = parseInt(el.dataset.portIndex, 10);
        e.dataTransfer.setData('application/json', JSON.stringify({
          type: 'PANEL_PORT_DRAG',
          fromIndex: idx
        }));
        e.dataTransfer.effectAllowed = 'move';
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('drag-over');
      });

      el.addEventListener('dragleave', () => {
        el.classList.remove('drag-over');
      });

      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('drag-over');
        const targetIdx = parseInt(el.dataset.portIndex, 10);
        if (isNaN(targetIdx)) return;

        try {
          const payload = JSON.parse(e.dataTransfer.getData('application/json'));
          if (payload.type === 'CONNECTOR_PALETTE_ITEM') {
            // Drop connector from palette onto port
            this.panel.ports[targetIdx].connector = payload.connectorId;
            this.selectPort(targetIdx);
            this.render();
            this.changed();
          } else if (payload.type === 'PANEL_PORT_DRAG') {
            // Drag port onto another port to shuffle/swap positions
            const fromIdx = payload.fromIndex;
            if (fromIdx !== undefined && fromIdx !== targetIdx) {
              this.swapOrMovePorts(fromIdx, targetIdx);
            }
          }
        } catch (_) {}
      });
    });
  }

  /** The block this panel saves as (toCad.blockSave / blockChanged). */
  toBlock() {
    const isPaired = this.tableMode === 'paired';
    return JSON.parse(JSON.stringify({
      type: isPaired ? 'patch_panel' : 'panel',
      id: this.panel.id,
      name: this.panel.name,
      room: this.panel.room,
      formFactor: this.panel.formFactor,
      portsPerRow: this.panel.portsPerRow,
      rackUnits: this.panel.rackUnits,
      pairCount: this.panel.portsPerRow,
      pairs: this.getPairs(),
      ports: this.panel.ports,
      // the hardware's BIM part and reference (ROAD-3572), when one was picked
      ...(this.panel.bimId ? { bimId: this.panel.bimId, hardwareName: this.panel.hardwareName || '' } : {}),
      ...(this.panel.bimRef ? { bimRef: this.panel.bimRef } : {}),
      timestamp: new Date().toISOString(),
    }));
  }

  exportCadSvg() {
    const svgStr = renderCadPanelSvg(this.panel, {
      viewMode: this.viewMode,
      selectedPortIndex: null,
      zoom: 1,
    });
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.panel.name || 'patch_panel'}_cad_${this.viewMode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

mixInto(PanelBuddyApp, PanelBuddyEvents, PanelBuddyLabelMaker, PanelBuddyHardware, PanelBuddyPorts, PanelBuddyFiles);

if (typeof window !== 'undefined') {
  /* vocabulary.js awaits its config at the top level, so this module can finish after
     DOMContentLoaded has fired: start now when the document is already parsed. */
  const start = () => { window.panelBuddyApp ||= new PanelBuddyApp(); };
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start);
  else start();
}
