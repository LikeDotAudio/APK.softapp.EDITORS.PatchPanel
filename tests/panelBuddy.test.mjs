// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  derivePanelLabelStock, pitchInFor, rowsFor, scaleSummary, buildScaleRulerHtml,
} from '../js/panelLabelStock.js';
import { buildPanelLabelStripSvg } from '../js/panelLabels.js';
import { CAD_CONNECTOR_CATALOG, getConnectorMeta } from '../js/cadConnectorSymbols.js';
import { renderCadPanelSvg } from '../js/cadPanelVisualizer.js';
import {
  LABEL_MECHANICAL_PRESETS,
  computePortGeometry,
  calculateFitFontSize,
  renderMechanicalLabelStripSvg,
  generatePrintableSheetHtml,
} from '../js/patchLabelGeometryEngine.js';
import {
  VENDORS,
  loadMasterCatalog,
  loadVendorModels,
  searchModels,
  findModel,
  modelToMechanicalPreset
} from '../js/patchPanelVendorCatalog.js';
import { generateCadPanelDxf } from '../js/cadDxfGenerator.js';
import { CAD_HOST_PROTOCOL } from '../js/cadLikeAudioBridge.js';

test('Panel Label Stock Derivation', () => {
  const stock24 = derivePanelLabelStock({ portsPerRow: 24, rackUnits: 1, isBay: false });
  assert.equal(stock24.type.portsPerRow, 24);
  assert.equal(stock24.type.rackUnits, 1);
  assert.equal(stock24.cell.widthIn, 0.73);
  assert.equal(stock24.cell.heightIn, 0.39);

  const stock48Bay = derivePanelLabelStock({ portsPerRow: 48, rackUnits: 2, isBay: true });
  assert.equal(stock48Bay.cell.widthIn, 0.335);
  assert.ok(stock48Bay.name.includes('bay'));
});

test('Rows for Port Count', () => {
  assert.equal(rowsFor(24, 24), 1);
  assert.equal(rowsFor(48, 24), 2);
  assert.equal(rowsFor(30, 24), 2);
});

test('Scale Summary and Ruler', () => {
  const stock = derivePanelLabelStock({ portsPerRow: 24, rackUnits: 1, isBay: false });
  const summary = scaleSummary(stock);
  assert.ok(summary.includes('24-port'));
  assert.ok(summary.includes('1:1'));

  const ruler = buildScaleRulerHtml();
  assert.ok(ruler.includes('ruler'));
  assert.ok(ruler.includes('1 inch'));
});

test('SVG Strip Preview Generation', () => {
  const panel = {
    name: 'TEST-PANEL-01',
    ports: [
      { portNumber: 1, label: 'MIC-1', endpoint: 'DSP-01' },
      { portNumber: 2, label: 'MIC-2', endpoint: 'DSP-02' },
    ],
  };
  const stock = derivePanelLabelStock({ portsPerRow: 24, rackUnits: 1, isBay: false });
  const svg = buildPanelLabelStripSvg(panel, stock, { theme: 'dark' });

  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('TEST-PANEL-01'));
  assert.ok(svg.includes('MIC-1'));
  assert.ok(svg.includes('DSP-01'));
  assert.ok(svg.endsWith('</svg>'));
});

test('CAD Vector Connector Catalog & Resolution', () => {
  assert.ok(CAD_CONNECTOR_CATALOG.length >= 12);
  const xlrF = getConnectorMeta('XLR-F');
  assert.equal(xlrF.id, 'xlr-f');
  assert.equal(xlrF.label, 'XLR Female');

  const bnc = getConnectorMeta('BNC');
  assert.equal(bnc.id, 'bnc');

  const ethercon = getConnectorMeta('EtherCON');
  assert.equal(ethercon.id, 'ethercon');
});

test('CAD 19-Inch Panel Visualizer Faceplate & Blueprint Rendering', () => {
  const panel = {
    name: 'PP-STUDIO-A',
    room: 'CR-01 RACK 02',
    portsPerRow: 24,
    rackUnits: 1,
    ports: [
      { portNumber: 1, label: 'KICK IN', endpoint: 'STAGEBOX-A', connector: 'XLR-F' },
      { portNumber: 2, label: 'SNARE TOP', endpoint: 'STAGEBOX-A', connector: 'XLR-F' },
      { portNumber: 24, label: 'DANTE PRI', endpoint: 'CISCO SG350', connector: 'EtherCON' },
    ],
  };

  const svgFaceplate = renderCadPanelSvg(panel, { viewMode: 'faceplate', selectedPortIndex: 0 });
  assert.ok(svgFaceplate.includes('PP-STUDIO-A'));
  assert.ok(svgFaceplate.includes('482.6')); // 19 inch width
  assert.ok(svgFaceplate.includes('cad-icon-xlr-f'));
  assert.ok(svgFaceplate.includes('cad-icon-ethercon'));
  assert.ok(svgFaceplate.includes('KICK IN'));

  const svgDrill = renderCadPanelSvg(panel, { viewMode: 'drill' });
  assert.ok(svgDrill.includes('FABRICATION BLUEPRINT'));
  assert.ok(svgDrill.includes('BORE: Ø24.0mm'));
});

test('Panel Port Shuffling, Reversing and Drag Re-ordering Logic', () => {
  const ports = [
    { portNumber: 1, label: 'CH_1', connector: 'XLR-F' },
    { portNumber: 2, label: 'CH_2', connector: 'XLR-F' },
    { portNumber: 3, label: 'CH_3', connector: 'BNC' },
    { portNumber: 4, label: 'CH_4', connector: 'EtherCON' },
  ];

  // Test drag & drop move (move index 0 to index 2)
  const moved = [...ports];
  const item = moved.splice(0, 1)[0];
  moved.splice(2, 0, item);
  assert.equal(moved[0].label, 'CH_2');
  assert.equal(moved[1].label, 'CH_3');
  assert.equal(moved[2].label, 'CH_1');
  assert.equal(moved[3].label, 'CH_4');

  // Test reversing
  const reversed = [...ports].reverse();
  assert.equal(reversed[0].label, 'CH_4');
  assert.equal(reversed[3].label, 'CH_1');

  // Test shift left
  const shiftedLeft = [...ports];
  const first = shiftedLeft.shift();
  shiftedLeft.push(first);
  assert.equal(shiftedLeft[0].label, 'CH_2');
  assert.equal(shiftedLeft[3].label, 'CH_1');
});

test('Mechanical Label Geometry Engine: Port Pitch, Datum Offset, Auto-fit & Calibration', () => {
  // Test 1: Preset catalogs
  assert.ok(LABEL_MECHANICAL_PRESETS.length >= 6);
  const data24 = LABEL_MECHANICAL_PRESETS.find(p => p.id === 'data_24p_slidein');
  assert.ok(data24, '24P Slide-in preset must exist');
  assert.equal(data24.pitchMm, 17.5);
  assert.equal(data24.datumMm, 13.75);

  // Test 2: Mathematical port pitch & datum coordinate formula X_n = X_0 + n*P
  const port0 = computePortGeometry(data24, 0);
  assert.equal(port0.centerX, 13.75);
  assert.equal(port0.cellWidth, 16.5); // 17.5 - 1.0mm micro-margin

  const port1 = computePortGeometry(data24, 1);
  assert.equal(port1.centerX, 13.75 + 17.5); // 31.25mm

  const port23 = computePortGeometry(data24, 23);
  assert.equal(port23.centerX, 13.75 + 23 * 17.5); // 416.25mm

  // Test 3: Modular Keystone Blocks (4 blocks of 6 ports with gap)
  const keystone = LABEL_MECHANICAL_PRESETS.find(p => p.id === 'keystone_modular_4x6');
  assert.ok(keystone);
  const kPort0 = computePortGeometry(keystone, 0);
  assert.equal(kPort0.blockIndex, 0);
  assert.equal(kPort0.posInBlock, 0);
  assert.equal(kPort0.centerX, 10.75);

  const kPort6 = computePortGeometry(keystone, 6);
  assert.equal(kPort6.blockIndex, 1);
  assert.equal(kPort6.posInBlock, 0);
  // block 1 starts after block 0 span (6 * 16.5 + 4.8 gap)
  assert.ok(kPort6.centerX > kPort0.centerX + 100);

  // Test 4: Dynamic font auto-scaling to prevent bleed
  const shortTextFit = calculateFitFontSize('MIC 1', 16.5, 7.5, 4.5);
  assert.equal(shortTextFit, 7.5);

  const veryLongTextFit = calculateFitFontSize('LONG-CIRCUIT-NAME-FROM-MDF-RACK-01', 16.5, 7.5, 4.5);
  assert.ok(veryLongTextFit < 7.5);
  assert.ok(veryLongTextFit >= 4.5);

  // Test 5: Mechanical SVG Strip Rendering
  const panel = {
    name: 'PP-MDF-DATA-01',
    ports: Array.from({ length: 24 }, (_, i) => ({
      portNumber: i + 1,
      label: `DATA-${i + 1}`,
      endpoint: `OFFICE-W${i + 1}`,
      signal: 'Gigabit PoE+'
    }))
  };

  const svg = renderMechanicalLabelStripSvg(panel, data24, {
    highContrast: true,
    showDimensions: true,
    showRuler: true
  });

  assert.ok(svg.includes('454mm'));
  assert.ok(svg.includes('width="430"'));
  assert.ok(svg.includes('50.0mm')); // Calibration check ruler
  assert.ok(svg.includes('CALIBRATION CHECK'));
  assert.ok(svg.includes('DATA-1'));
  assert.ok(svg.includes('OFFICE-W1'));
  assert.ok(svg.includes('X₀=13.75mm'));
  assert.ok(svg.includes('P=17.5mm'));

  // Test 6: Multi-strip Printable Sheet Layout
  const html = generatePrintableSheetHtml(panel, data24, { pageSize: 'letter', copies: 3 });
  assert.ok(html.includes('Physical Printer Scale Verification Guide'));
  assert.ok(html.includes('STRIP COPY #1'));
  assert.ok(html.includes('STRIP COPY #2'));
  assert.ok(html.includes('STRIP COPY #3'));
  assert.ok(html.includes('11in 8.5in'));
});

test('Patch Panel Hardware Vendor Catalog & Geometry Index', async () => {
  // Test 1: 15 Manufacturers
  assert.equal(VENDORS.length, 15);
  assert.ok(VENDORS.includes('Bittree'));
  assert.ok(VENDORS.includes('Switchcraft'));
  assert.ok(VENDORS.includes('Neutrik'));
  assert.ok(VENDORS.includes('ADC'));
  assert.ok(VENDORS.includes('Canare'));

  // Test 2: Ingest Master Index (2,174 models)
  const allModels = await loadMasterCatalog();
  assert.equal(allModels.length, 2174);

  // Test 3: Load Individual Vendor Models
  const bittreeModels = await loadVendorModels('Bittree');
  assert.equal(bittreeModels.length, 145);
  const bit0005 = findModel(bittreeModels, 'BIT-0005');
  assert.ok(bit0005);
  assert.equal(bit0005.make, 'Bittree');
  assert.equal(bit0005.model, 'BIT-0005');
  assert.equal(bit0005.portCount, 24);
  assert.equal(bit0005.rackUnits, '1U');
  assert.equal(bit0005.portPitchInches, 0.4);
  assert.equal(bit0005.portPitchMm, 10.16);

  // Test 4: Convert Vendor Hardware Model to Mechanical Geometry Preset
  const preset = modelToMechanicalPreset(bit0005);
  assert.ok(preset.id.includes('bittree_bit_0005'));
  assert.equal(preset.portCount, 24);
  assert.equal(preset.portPitchMm, 10.16);
  assert.equal(preset.windowHeightMm, 9.14);
  assert.equal(preset.stripWidthMm, 430.0);
  assert.ok(preset.datumMm > 0);

  // Verify Geometry Engine computes exact millimeter centers for this hardware
  const port0Geom = computePortGeometry(preset, 0);
  const port1Geom = computePortGeometry(preset, 1);
  assert.equal(port0Geom.centerX, preset.datumMm);
  assert.equal(Math.round((port1Geom.centerX - port0Geom.centerX) * 100) / 100, 10.16);

  // Test 5: Search Catalog with Filter Matrix
  const search2U = searchModels(allModels, { rackUnits: '2U', limit: 20 });
  assert.equal(search2U.length, 20);
  search2U.forEach(m => assert.equal(m.rackUnits, '2U'));

  const searchNeutrik = searchModels(allModels, { vendor: 'Neutrik', limit: 50 });
  assert.equal(searchNeutrik.length, 50);
  searchNeutrik.forEach(m => assert.equal(m.make, 'Neutrik'));
});

test('CAD Multi-Archetype Faceplate Rendering for All Equipment Models', () => {
  // 1. Bantam TT Jackfield (e.g. Bittree / Audio Accessories 96-pt)
  const bantamPanel = {
    name: 'PP-BANTAM-01',
    hardwareMake: 'Bittree',
    hardwareModel: 'BIT-0005',
    hardwareType: 'Bantam',
    portsPerRow: 24,
    rackUnits: 2,
    portPitchMm: 10.16,
    datumMm: 98.16,
    labelWindowHeightMm: 9.14,
    ports: Array.from({ length: 48 }, (_, i) => ({
      portNumber: i + 1,
      label: `TT-${i + 1}`,
      connector: 'TT Bantam'
    }))
  };
  const bantamSvg = renderCadPanelSvg(bantamPanel, { viewMode: 'faceplate' });
  assert.ok(bantamSvg.includes('cad-icon-bantam-tt'));
  assert.ok(bantamSvg.includes('ROW A · OUTPUTS'));
  assert.ok(bantamSvg.includes('ROW B · INPUTS'));
  assert.ok(bantamSvg.includes('Bittree BIT-0005'));

  // 2. RJ45 / Keystone Data Panel (e.g. Panduit / CommScope / Leviton)
  const dataPanel = {
    name: 'PP-DATA-01',
    hardwareMake: 'Panduit',
    hardwareModel: 'PAN-0012',
    hardwareType: 'Data',
    portsPerRow: 24,
    rackUnits: 1,
    portPitchMm: 19.05,
    datumMm: 14.5,
    labelWindowHeightMm: 9.5,
    ports: Array.from({ length: 24 }, (_, i) => ({
      portNumber: i + 1,
      label: `LAN-${i + 1}`,
      connector: 'EtherCON'
    }))
  };
  const dataSvg = renderCadPanelSvg(dataPanel, { viewMode: 'faceplate' });
  assert.ok(dataSvg.includes('MODULAR BLOCK 1'));
  assert.ok(dataSvg.includes('cad-icon-rj45') || dataSvg.includes('cad-icon-ethercon'));
  assert.ok(dataSvg.includes('Panduit PAN-0012'));

  // 3. 75Ω BNC Video Patch Panel (e.g. Canare / Argosy)
  const videoPanel = {
    name: 'PP-VIDEO-01',
    hardwareMake: 'Canare',
    hardwareModel: 'CAN-0033',
    hardwareType: 'Video',
    portsPerRow: 24,
    rackUnits: 1,
    portPitchMm: 17.5,
    datumMm: 13.75,
    labelWindowHeightMm: 8.0,
    ports: Array.from({ length: 24 }, (_, i) => ({
      portNumber: i + 1,
      label: `SDI-${i + 1}`,
      connector: 'BNC'
    }))
  };
  const videoSvg = renderCadPanelSvg(videoPanel, { viewMode: 'faceplate' });
  assert.ok(videoSvg.includes('cad-icon-bnc'));
  assert.ok(videoSvg.includes('75Ω SDI VIDEO CHANNELS'));
  assert.ok(videoSvg.includes('Canare CAN-0033'));

  // 4. Standard XLR / Termination Panel (e.g. Neutrik / Pinanson)
  const xlrPanel = {
    name: 'PP-XLR-01',
    hardwareMake: 'Neutrik',
    hardwareModel: 'NEU-0019',
    hardwareType: 'Termination Panel',
    portsPerRow: 16,
    rackUnits: 1,
    ports: Array.from({ length: 16 }, (_, i) => ({
      portNumber: i + 1,
      label: `MIC-${i + 1}`,
      connector: 'XLR-F'
    }))
  };
  const xlrSvg = renderCadPanelSvg(xlrPanel, { viewMode: 'faceplate' });
  assert.ok(xlrSvg.includes('cad-icon-xlr-f'));
  assert.ok(xlrSvg.includes('Neutrik NEU-0019'));
});

test('AutoCAD R2000 DXF Generator & CAD.Like.audio Host Bridge', () => {
  // Test 1: Verify Host Protocol matches ecosystem specification
  assert.equal(CAD_HOST_PROTOCOL, 'cad.like.audio/host@1');

  // Test 2: Standard 24P 1U D-Series Panel DXF Generation
  const panel = {
    name: 'PP-STUDIO-XLR',
    rackUnits: 1,
    portsPerRow: 24,
    hardwareType: 'Termination Panel',
    ports: Array.from({ length: 24 }, (_, i) => ({
      portNumber: i + 1,
      label: `CH ${i + 1}`,
      connector: 'XLR-F'
    }))
  };

  const dxf = generateCadPanelDxf(panel);
  assert.ok(typeof dxf === 'string');
  assert.ok(dxf.length > 5000);

  // AutoCAD 2000 Header verification
  assert.ok(dxf.includes('$ACADVER\n  1\nAC1015'));
  assert.ok(dxf.includes('$INSUNITS\n 70\n4')); // Millimeters
  assert.ok(dxf.includes('$MEASUREMENT\n 70\n1')); // Metric

  // Tables & Layers verification
  assert.ok(dxf.includes('0_PANEL_CHASSIS'));
  assert.ok(dxf.includes('1_MOUNTING_SLOTS'));
  assert.ok(dxf.includes('2_BORES_FABRICATION'));
  assert.ok(dxf.includes('3_SCREW_HOLES'));
  assert.ok(dxf.includes('4_CROSSHAIRS'));
  assert.ok(dxf.includes('5_DIMENSIONS_SILKSCREEN'));

  // Blocks section verification
  assert.ok(dxf.includes('*Model_Space'));
  assert.ok(dxf.includes('*Paper_Space'));

  // Entities section verification (True circles and lines)
  assert.ok(dxf.includes('AcDbCircle'));
  assert.ok(dxf.includes('AcDbLine'));
  assert.ok(dxf.includes('AcDbText'));
  assert.ok(dxf.includes('PP-STUDIO-XLR'));

  // EOF marker verification
  assert.ok(dxf.endsWith('  0\nEOF\n'));

  // Test 3: High Density 48P 2U Bantam Patchbay DXF
  const bantamPanel = {
    name: 'PP-MDF-BANTAM',
    rackUnits: 2,
    portsPerRow: 24,
    hardwareType: 'Bantam',
    ports: Array.from({ length: 48 }, (_, i) => ({
      portNumber: i + 1,
      label: `TT-${i + 1}`,
      connector: 'TT Bantam'
    }))
  };

  const bantamDxf = generateCadPanelDxf(bantamPanel);
  assert.ok(bantamDxf.includes('PP-MDF-BANTAM'));
  // Bantam Ø6.5mm bores (radius 3.25)
  assert.ok(bantamDxf.includes('3.2500'));
});

test('Paired Patchbay Schedule & Normalling Visualizer Synchronization', () => {
  // Test paired patchbay with 24 channels (48 jacks)
  const patchbayPanel = {
    name: 'AUDIO-PB01',
    rackUnits: 2,
    portsPerRow: 24,
    hardwareType: 'Bantam',
    ports: []
  };

  for (let i = 1; i <= 24; i++) {
    patchbayPanel.ports.push({
      portNumber: i,
      label: `PREAMP ${i}`,
      endpoint: `MIC-PRE-01 / OUT-${i}`,
      connector: 'TT-Bantam',
      normalling: i <= 16 ? 'half' : 'full'
    });
  }
  for (let i = 1; i <= 24; i++) {
    patchbayPanel.ports.push({
      portNumber: 24 + i,
      label: `DAW IN ${i}`,
      endpoint: `INTERFACE / IN-${i}`,
      connector: 'TT-Bantam',
      normalling: i <= 16 ? 'half' : 'full'
    });
  }

  const svg = renderCadPanelSvg(patchbayPanel, { viewMode: 'faceplate' });

  // Half-normal dashed line and arrow polygon
  assert.ok(svg.includes('stroke="#38bdf8"'));
  assert.ok(svg.includes('stroke-dasharray="1.5,1"'));
  assert.ok(svg.includes('<polygon points='));

  // Full-normal solid line and contact circle dot
  assert.ok(svg.includes('stroke="#10b981"'));
  assert.ok(svg.includes('<circle cx=') && svg.includes('fill="#10b981"'));

  // Row A and Row B headers
  assert.ok(svg.includes('ROW A · OUTPUTS'));
  assert.ok(svg.includes('ROW B · INPUTS'));
});
