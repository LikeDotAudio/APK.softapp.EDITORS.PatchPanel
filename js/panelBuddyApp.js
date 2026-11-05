// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Authentic 19-Inch EIA Rack Panel CAD Builder with True Vector Connectors

import { CAD_CONNECTOR_CATALOG, getConnectorMeta } from './cadConnectorSymbols.js';
import { renderCadPanelSvg } from './cadPanelVisualizer.js';
import {
  LABEL_MECHANICAL_PRESETS,
  computePortGeometry,
  renderMechanicalLabelStripSvg,
  generatePrintableSheetHtml,
} from './patchLabelGeometryEngine.js';
import {
  VENDORS,
  loadMasterCatalog,
  loadVendorModels,
  searchModels,
  findModel,
  modelToMechanicalPreset,
} from './patchPanelVendorCatalog.js';
import { generateCadPanelDxf } from './cadDxfGenerator.js';
import { downloadPanelDxf, openInCadLikeAudio } from './cadLikeAudioBridge.js';
import { createPortTables, fillEndpointsFromThings } from './portTables.js';

const S = () => window.APKSoftapp;

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
    try {
      const res = await fetch('./config/discovery.json', { cache: 'no-store' });
      if (res.ok) kinds = (await res.json()).kinds || [];
    } catch (_) { /* no config: every kind */ }
    const d = await S().discovered({ kinds, onChange: (things) => this.sayDiscovered(things) });
    this.discovery = d.ok ? d : null;
    if (!d.ok) this.sayStatus(d.reason, 'dead');
    else this.sayDiscovered(d.things());
  }

  sayDiscovered(things) {
    const good = things.filter((t) => t.live && t.live.state === 'good').length;
    this.sayStatus(`${things.length} discovered on the bus (${good} verified in the last ${S().TRUST_MINUTES} min)`,
      good ? 'good' : 'kinda');
  }

  /** Ports with no wire endpoint take the next discovered device (by MAC / serial). */
  fillEndpointsFromDiscovered() {
    if (!this.discovery) return;
    const n = fillEndpointsFromThings(this.panel.ports, this.discovery.things());
    this.sayStatus(n ? `Wired ${n} empty endpoint(s) to discovered devices.` : 'No empty endpoint, or nothing new on the bus.', 'kinda');
    if (!n) return;
    this.render();
    this.changed();
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
    this.selectHardwareVendor = document.getElementById('select-hardware-vendor');
    this.selectHardwareModel = document.getElementById('select-hardware-model');
    this.selectLabelVendor = document.getElementById('select-label-vendor');
    this.selectLabelModel = document.getElementById('select-label-model');

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

  async setupHardwareCatalog() {
    if (!this.selectHardwareVendor && !this.selectLabelVendor) return;

    const populateVendors = (sel, placeholder) => {
      if (!sel) return;
      sel.replaceChildren(new Option(placeholder, ''));
      VENDORS.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
      });
    };

    populateVendors(this.selectHardwareVendor, '-- Choose Manufacturer (15) --');
    populateVendors(this.selectLabelVendor, '-- Choose Manufacturer (15) --');

    // Asynchronously preload master catalog in background
    loadMasterCatalog().then(models => {
      this.masterCatalog = models;
    }).catch(err => {
      console.warn('Catalog index preload notice:', err);
    });

    const handleVendorChange = async (vendor, targetModelSelect, mirrorVendorSelect, mirrorModelSelect) => {
      if (mirrorVendorSelect && mirrorVendorSelect.value !== vendor) {
        mirrorVendorSelect.value = vendor;
      }

      if (!vendor) {
        if (targetModelSelect) {
          targetModelSelect.innerHTML = '<option value="">-- Select Vendor First --</option>';
          targetModelSelect.disabled = true;
        }
        if (mirrorModelSelect) {
          mirrorModelSelect.innerHTML = '<option value="">-- Select Vendor First --</option>';
          mirrorModelSelect.disabled = true;
        }
        return;
      }

      const models = await loadVendorModels(vendor);
      const renderOptions = (sel) => {
        if (!sel) return;
        sel.replaceChildren(new Option(`-- Choose ${vendor} Model (${models.length}) --`, ''));
        models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.model;
          opt.textContent = `${m.model} · ${m.portCount}P ${m.rackUnits} · ${m.type} (P: ${m.portPitchMm}mm / ${m.portPitchInches}″)`;
          sel.appendChild(opt);
        });
        sel.disabled = false;
      };

      renderOptions(targetModelSelect);
      renderOptions(mirrorModelSelect);
    };

    const handleModelChange = async (vendor, modelCode, mirrorModelSelect) => {
      if (mirrorModelSelect && mirrorModelSelect.value !== modelCode) {
        mirrorModelSelect.value = modelCode;
      }
      if (!modelCode) return;

      const models = await loadVendorModels(vendor);
      const model = findModel(models, modelCode);
      if (model) {
        this.applyHardwareModel(model);
      }
    };

    this.selectHardwareVendor?.addEventListener('change', (e) => {
      handleVendorChange(e.target.value, this.selectHardwareModel, this.selectLabelVendor, this.selectLabelModel);
    });

    this.selectHardwareModel?.addEventListener('change', (e) => {
      handleModelChange(this.selectHardwareVendor.value, e.target.value, this.selectLabelModel);
    });

    this.selectLabelVendor?.addEventListener('change', (e) => {
      handleVendorChange(e.target.value, this.selectLabelModel, this.selectHardwareVendor, this.selectHardwareModel);
    });

    this.selectLabelModel?.addEventListener('change', (e) => {
      handleModelChange(this.selectLabelVendor.value, e.target.value, this.selectHardwareModel);
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
      alert('Pop-up blocked. Please allow pop-ups to open the 1:1 print sheet.');
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

  handleBlockLoaded(block, meta = {}) {
    if (!block) return;
    this.panel.id = block.id || this.panel.id;
    this.panel.name = block.name || block.panelLabel || this.panel.name;
    this.panel.room = block.room || (Array.isArray(block.roomPath) ? block.roomPath.join(' > ') : this.panel.room);
    this.panel.portsPerRow = block.portsPerRow || (block.pairCount ? block.pairCount : this.panel.portsPerRow);
    this.panel.rackUnits = block.rackUnits || (block.pairCount ? 2 : this.panel.rackUnits);
    this.panel.formFactor = block.formFactor || this.panel.formFactor;

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

  render() {
    this.renderPreview();
    this.renderTable();
    this.updateGeometrySummary();
    if (this.modalLabelMaker && this.modalLabelMaker.style.display === 'flex') {
      this.renderLabelMakerPreview();
    }
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
      timestamp: new Date().toISOString(),
    }));
  }

  blockMeta() {
    return { title: this.panel.name, filename: `panel_${String(this.panel.name || 'panel').toLowerCase().replace(/[^a-z0-9]/g, '_')}` };
  }

  /** Save: into the drawing inside the CAD, a .json download standalone. */
  saveBlock() {
    this.host.save(this.toBlock(), this.blockMeta());
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

  exportCadDxf() {
    downloadPanelDxf(this.panel);
  }

  openInCad() {
    openInCadLikeAudio(this.panel, { onStatus: (text, state) => this.sayStatus(text, state) });
  }

  promptOpen() {
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
        } catch (_) {
          alert('Invalid panel JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.panelBuddyApp = new PanelBuddyApp();
  });
}
