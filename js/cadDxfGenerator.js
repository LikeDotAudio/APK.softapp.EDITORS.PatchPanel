// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Authentic AutoCAD R2000 (AC1015) DXF Emitter for 19-Inch EIA Rack Panels & Patchbays
// Fully compatible with EDITORS.CAD.Like.audio, LibreCAD, Fusion 360, and CNC fabrication tools

const pair = (code, val) => `${code}\n${val}\n`;

export class DxfWriter {
  constructor() {
    this.nextHandle = 0x100;
    this.layers = new Map();
    this.entities = '';
  }

  handle() {
    this.nextHandle += 1;
    return this.nextHandle.toString(16).toUpperCase();
  }

  addLayer(name, color = 7, linetype = 'CONTINUOUS', lineweight = -3) {
    this.layers.set(name, {
      name,
      color: Math.max(1, Math.min(255, color)),
      linetype: linetype.toUpperCase(),
      lineweight, // -3 = standard, 25 = 0.25mm, 50 = 0.5mm
      handle: this.handle()
    });
  }

  line(x1, y1, x2, y2, layer = '0', color) {
    let out =
      pair('  0', 'LINE') +
      pair('  5', this.handle()) +
      pair('100', 'AcDbEntity') +
      pair('  8', layer);
    if (color !== undefined) out += pair(' 62', color);
    out +=
      pair('100', 'AcDbLine') +
      pair(' 10', Number(x1).toFixed(4)) +
      pair(' 20', Number(y1).toFixed(4)) +
      pair(' 30', '0.0000') +
      pair(' 11', Number(x2).toFixed(4)) +
      pair(' 21', Number(y2).toFixed(4)) +
      pair(' 31', '0.0000');
    this.entities += out;
  }

  circle(cx, cy, r, layer = '0', color) {
    let out =
      pair('  0', 'CIRCLE') +
      pair('  5', this.handle()) +
      pair('100', 'AcDbEntity') +
      pair('  8', layer);
    if (color !== undefined) out += pair(' 62', color);
    out +=
      pair('100', 'AcDbCircle') +
      pair(' 10', Number(cx).toFixed(4)) +
      pair(' 20', Number(cy).toFixed(4)) +
      pair(' 30', '0.0000') +
      pair(' 40', Number(r).toFixed(4));
    this.entities += out;
  }

  arc(cx, cy, r, startAngleDeg, endAngleDeg, layer = '0', color) {
    let out =
      pair('  0', 'ARC') +
      pair('  5', this.handle()) +
      pair('100', 'AcDbEntity') +
      pair('  8', layer);
    if (color !== undefined) out += pair(' 62', color);
    out +=
      pair('100', 'AcDbCircle') +
      pair(' 10', Number(cx).toFixed(4)) +
      pair(' 20', Number(cy).toFixed(4)) +
      pair(' 30', '0.0000') +
      pair(' 40', Number(r).toFixed(4)) +
      pair('100', 'AcDbArc') +
      pair(' 50', Number(startAngleDeg).toFixed(2)) +
      pair(' 51', Number(endAngleDeg).toFixed(2));
    this.entities += out;
  }

  text(textStr, x, y, height = 2.5, layer = '0', color, rotationDeg = 0) {
    let out =
      pair('  0', 'TEXT') +
      pair('  5', this.handle()) +
      pair('100', 'AcDbEntity') +
      pair('  8', layer);
    if (color !== undefined) out += pair(' 62', color);
    out +=
      pair('100', 'AcDbText') +
      pair(' 10', Number(x).toFixed(4)) +
      pair(' 20', Number(y).toFixed(4)) +
      pair(' 30', '0.0000') +
      pair(' 40', Number(height).toFixed(4)) +
      pair('  1', String(textStr)) +
      pair(' 50', Number(rotationDeg).toFixed(2)) +
      pair('100', 'AcDbText');
    this.entities += out;
  }

  rect(x1, y1, width, height, layer = '0', color) {
    const x2 = x1 + width;
    const y2 = y1 + height;
    this.line(x1, y1, x2, y1, layer, color);
    this.line(x2, y1, x2, y2, layer, color);
    this.line(x2, y2, x1, y2, layer, color);
    this.line(x1, y2, x1, y1, layer, color);
  }

  toDxfString() {
    let out = '';

    // HEADER SECTION
    out += pair('  0', 'SECTION');
    out += pair('  2', 'HEADER');
    out += pair('  9', '$ACADVER');
    out += pair('  1', 'AC1015'); // AutoCAD 2000
    out += pair('  9', '$HANDSEED');
    out += pair('  5', (this.nextHandle + 32).toString(16).toUpperCase());
    out += pair('  9', '$INSUNITS');
    out += pair(' 70', 4); // 4 = Millimeters
    out += pair('  9', '$MEASUREMENT');
    out += pair(' 70', 1); // 1 = Metric
    out += pair('  0', 'ENDSEC');

    // TABLES SECTION
    out += pair('  0', 'SECTION');
    out += pair('  2', 'TABLES');

    // LTYPE TABLE
    out += pair('  0', 'TABLE');
    out += pair('  2', 'LTYPE');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbSymbolTable');
    out += pair(' 70', 2);

    out += pair('  0', 'LTYPE');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbSymbolTableRecord');
    out += pair('100', 'AcDbLinetypeTableRecord');
    out += pair('  2', 'CONTINUOUS');
    out += pair(' 70', 0);
    out += pair('  3', 'Solid line');
    out += pair(' 72', 65);
    out += pair(' 73', 0);
    out += pair(' 40', '0.000000');

    out += pair('  0', 'LTYPE');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbSymbolTableRecord');
    out += pair('100', 'AcDbLinetypeTableRecord');
    out += pair('  2', 'CENTER');
    out += pair(' 70', 0);
    out += pair('  3', 'Centerline ____ _ ____ _');
    out += pair(' 72', 65);
    out += pair(' 73', 4);
    out += pair(' 40', '20.000000');
    out += pair(' 49', '12.000000') + pair(' 74', 0);
    out += pair(' 49', '-2.000000') + pair(' 74', 0);
    out += pair(' 49', '4.000000') + pair(' 74', 0);
    out += pair(' 49', '-2.000000') + pair(' 74', 0);

    out += pair('  0', 'ENDTAB');

    // LAYER TABLE
    out += pair('  0', 'TABLE');
    out += pair('  2', 'LAYER');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbSymbolTable');
    out += pair(' 70', this.layers.size);

    for (const l of this.layers.values()) {
      out += pair('  0', 'LAYER');
      out += pair('  5', l.handle);
      out += pair('100', 'AcDbSymbolTableRecord');
      out += pair('100', 'AcDbLayerTableRecord');
      out += pair('  2', l.name);
      out += pair(' 70', 0);
      out += pair(' 62', l.color);
      out += pair('  6', l.linetype);
      out += pair('370', l.lineweight);
    }
    out += pair('  0', 'ENDTAB');

    // BLOCK_RECORD TABLE
    out += pair('  0', 'TABLE');
    out += pair('  2', 'BLOCK_RECORD');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbSymbolTable');
    out += pair(' 70', 2);

    const modelRecord = this.handle();
    out += pair('  0', 'BLOCK_RECORD');
    out += pair('  5', modelRecord);
    out += pair('100', 'AcDbSymbolTableRecord');
    out += pair('100', 'AcDbBlockTableRecord');
    out += pair('  2', '*Model_Space');

    const paperRecord = this.handle();
    out += pair('  0', 'BLOCK_RECORD');
    out += pair('  5', paperRecord);
    out += pair('100', 'AcDbSymbolTableRecord');
    out += pair('100', 'AcDbBlockTableRecord');
    out += pair('  2', '*Paper_Space');

    out += pair('  0', 'ENDTAB');
    out += pair('  0', 'ENDSEC'); // TABLES

    // BLOCKS SECTION
    out += pair('  0', 'SECTION');
    out += pair('  2', 'BLOCKS');

    out += pair('  0', 'BLOCK');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbEntity');
    out += pair('  8', '0');
    out += pair('100', 'AcDbBlockBegin');
    out += pair('  2', '*Model_Space');
    out += pair(' 70', 0);
    out += pair(' 10', '0.0000');
    out += pair(' 20', '0.0000');
    out += pair(' 30', '0.0000');
    out += pair('  3', '*Model_Space');
    out += pair('  1', '');
    out += pair('  0', 'ENDBLK');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbEntity');
    out += pair('  8', '0');
    out += pair('100', 'AcDbBlockEnd');

    out += pair('  0', 'BLOCK');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbEntity');
    out += pair('  8', '0');
    out += pair('100', 'AcDbBlockBegin');
    out += pair('  2', '*Paper_Space');
    out += pair(' 70', 0);
    out += pair(' 10', '0.0000');
    out += pair(' 20', '0.0000');
    out += pair(' 30', '0.0000');
    out += pair('  3', '*Paper_Space');
    out += pair('  1', '');
    out += pair('  0', 'ENDBLK');
    out += pair('  5', this.handle());
    out += pair('100', 'AcDbEntity');
    out += pair('  8', '0');
    out += pair('100', 'AcDbBlockEnd');

    out += pair('  0', 'ENDSEC'); // BLOCKS

    // ENTITIES SECTION
    out += pair('  0', 'SECTION');
    out += pair('  2', 'ENTITIES');
    out += this.entities;
    out += pair('  0', 'ENDSEC'); // ENTITIES

    out += pair('  0', 'EOF');
    return out;
  }
}

/**
 * Generates an AutoCAD R2000 DXF for standard 19-inch rack panel fabrication
 */
export function generateCadPanelDxf(panel, options = {}) {
  const ru = Math.max(1, parseInt(panel.rackUnits || 1, 10));
  const isWallPlate = panel.isWallPlate || panel.formFactor === 'wallplate';

  const rackWidthMm = isWallPlate ? (panel.gangs === 2 ? 116 : panel.gangs === 4 ? 208 : 70) : 482.6;
  const rackHeightMm = isWallPlate ? 114.3 : ru * 44.45;
  const earWidthMm = isWallPlate ? 0 : 15.9;
  const usableWidthMm = rackWidthMm - earWidthMm * 2;

  const portsPerRow = Math.max(1, parseInt(panel.portsPerRow || 24, 10));
  const ports = Array.isArray(panel.ports) ? panel.ports : [];
  const numRows = Math.max(1, Math.ceil(ports.length / portsPerRow) || 1);

  const hwType = String(panel.hardwareType || panel.type || '').trim().toLowerCase();
  const isBantam = hwType.includes('bantam');
  const isJack = hwType.includes('jack') && !isBantam;
  const isData = hwType.includes('data') || hwType.includes('keystone');
  const isVideo = hwType.includes('video');

  const pitchMm = Number(panel.portPitchMm) || (usableWidthMm / portsPerRow);
  const datumMm = Number(panel.datumMm) || Math.max(6, (usableWidthMm - (portsPerRow - 1) * pitchMm) / 2);

  const dxf = new DxfWriter();

  // Layers specification conforming to industry CNC and CAD standard conventions
  dxf.addLayer('0_PANEL_CHASSIS', 7, 'CONTINUOUS', 50);       // White: Perimeter outline
  dxf.addLayer('1_MOUNTING_SLOTS', 4, 'CONTINUOUS', 35);      // Cyan: 19" Rack Ear Slots
  dxf.addLayer('2_BORES_FABRICATION', 1, 'CONTINUOUS', 35);   // Red: Main connector punch bores
  dxf.addLayer('3_SCREW_HOLES', 3, 'CONTINUOUS', 25);         // Green: M3 / Tap holes
  dxf.addLayer('4_CROSSHAIRS', 2, 'CENTER', 15);              // Yellow: Alignment crosshairs
  dxf.addLayer('5_DIMENSIONS_SILKSCREEN', 5, 'CONTINUOUS', 18);// Blue: Text & Silkscreen

  // 1. Panel Chassis Outline
  dxf.rect(0, 0, rackWidthMm, rackHeightMm, '0_PANEL_CHASSIS');

  // Rack ear inner boundary lines (fold/ear marks)
  if (!isWallPlate) {
    dxf.line(earWidthMm, 0, earWidthMm, rackHeightMm, '0_PANEL_CHASSIS');
    dxf.line(rackWidthMm - earWidthMm, 0, rackWidthMm - earWidthMm, rackHeightMm, '0_PANEL_CHASSIS');

    // 2. EIA-310-D Standard Rack Mounting Slots (9.5mm x 7mm oval slots with semi-circular caps)
    [-1, 1].forEach(side => {
      const earX = side === -1 ? 7.95 : rackWidthMm - 7.95;
      for (let u = 0; u < ru; u++) {
        const uCenterY = u * 44.45 + 22.225;
        [uCenterY - 15.875, uCenterY + 15.875].forEach(slotY => {
          // Slot perimeter: a HORIZONTAL 9.5 x 7 mm slot — two horizontal lines and two
          // semicircular end caps of radius 3.5 mm, the slack running sideways to meet the rail.
          const r = 3.5, half = (9.5 - 2 * r) / 2;
          dxf.line(earX - half, slotY - r, earX + half, slotY - r, '1_MOUNTING_SLOTS');
          dxf.line(earX - half, slotY + r, earX + half, slotY + r, '1_MOUNTING_SLOTS');
          dxf.arc(earX + half, slotY, r, 270, 90, '1_MOUNTING_SLOTS');
          dxf.arc(earX - half, slotY, r, 90, 270, '1_MOUNTING_SLOTS');
          // Center mark
          dxf.circle(earX, slotY, 0.75, '4_CROSSHAIRS');
        });
      }
    });
  }

  // 3. Title Block & Engineering Metadata
  const panelName = panel.name || 'PATCH_PANEL';
  const mfg = panel.hardwareMake ? `${panel.hardwareMake} ${panel.hardwareModel || ''}` : 'EIA-310-D';
  dxf.text(`FABRICATION DRAWING: ${panelName} · ${ru}U 19" EIA-310`, earWidthMm + 10, rackHeightMm - 5, 3.2, '5_DIMENSIONS_SILKSCREEN');
  dxf.text(`MODEL: ${mfg} · PITCH: ${pitchMm.toFixed(2)}mm · DATUM X0: ${datumMm.toFixed(2)}mm · CAD.LIKE.AUDIO`, earWidthMm + 10, rackHeightMm - 9, 2.2, '5_DIMENSIONS_SILKSCREEN');

  // 4. Port Bores, Screw Holes, and Registration Crosshairs
  const rowSpacing = (rackHeightMm - 14) / numRows;

  ports.forEach((port, idx) => {
    const r = Math.floor(idx / portsPerRow);
    const c = idx % portsPerRow;
    const cx = earWidthMm + datumMm + c * pitchMm;
    const cy = rackHeightMm - (10 + rowSpacing * (r + 0.5)); // DXF Cartesian Y is positive upward

    const portNum = port.portNumber ?? (idx + 1);

    if (isBantam) {
      // Bantam TT: Ø6.5mm precision bore
      const boreR = 3.25;
      dxf.circle(cx, cy, boreR, '2_BORES_FABRICATION');
      // Crosshair
      dxf.line(cx - boreR - 2.5, cy, cx + boreR + 2.5, cy, '4_CROSSHAIRS');
      dxf.line(cx, cy - boreR - 2.5, cx, cy + boreR + 2.5, '4_CROSSHAIRS');
      // Port number
      dxf.text(String(portNum), cx - 1.2, cy + boreR + 1.2, 1.8, '5_DIMENSIONS_SILKSCREEN');

    } else if (isData) {
      // Keystone RJ45: 14.5mm width x 16.0mm height rectangular cutout
      const kw = 14.5;
      const kh = 16.0;
      dxf.rect(cx - kw / 2, cy - kh / 2, kw, kh, '2_BORES_FABRICATION');
      // Center crosshair
      dxf.line(cx - kw / 2 - 2, cy, cx + kw / 2 + 2, cy, '4_CROSSHAIRS');
      dxf.line(cx, cy - kh / 2 - 2, cx, cy + kh / 2 + 2, '4_CROSSHAIRS');
      dxf.text(String(portNum), cx - 1.5, cy + kh / 2 + 1.2, 1.8, '5_DIMENSIONS_SILKSCREEN');

    } else if (isVideo) {
      // BNC: Ø12.8mm bulkhead bore
      const boreR = 6.4;
      dxf.circle(cx, cy, boreR, '2_BORES_FABRICATION');
      dxf.line(cx - boreR - 2.5, cy, cx + boreR + 2.5, cy, '4_CROSSHAIRS');
      dxf.line(cx, cy - boreR - 2.5, cx, cy + boreR + 2.5, '4_CROSSHAIRS');
      dxf.text(String(portNum), cx - 1.5, cy + boreR + 1.2, 2.0, '5_DIMENSIONS_SILKSCREEN');

    } else if (isJack) {
      // 1/4" Phone Jack: Ø11.5mm bore
      const boreR = 5.75;
      dxf.circle(cx, cy, boreR, '2_BORES_FABRICATION');
      dxf.line(cx - boreR - 2.5, cy, cx + boreR + 2.5, cy, '4_CROSSHAIRS');
      dxf.line(cx, cy - boreR - 2.5, cx, cy + boreR + 2.5, '4_CROSSHAIRS');
      dxf.text(String(portNum), cx - 1.5, cy + boreR + 1.2, 2.0, '5_DIMENSIONS_SILKSCREEN');

    } else {
      // Standard EIA-310 Neutrik D-Series: Ø24.0mm bore + 2x M3 holes (19.05mm x 24.0mm diagonal)
      const boreR = 12.0;
      dxf.circle(cx, cy, boreR, '2_BORES_FABRICATION');

      // M3 mounting screw holes (Ø3.2mm, radius 1.6mm)
      dxf.circle(cx - 9.525, cy - 12.0, 1.6, '3_SCREW_HOLES');
      dxf.circle(cx + 9.525, cy + 12.0, 1.6, '3_SCREW_HOLES');

      // Registration crosshairs
      dxf.line(cx - 15.0, cy, cx + 15.0, cy, '4_CROSSHAIRS');
      dxf.line(cx, cy - 15.0, cx, cy + 15.0, '4_CROSSHAIRS');

      // Port number & label
      dxf.text(String(portNum), cx - 2.0, cy + 13.5, 2.2, '5_DIMENSIONS_SILKSCREEN');
      if (port.label) {
        dxf.text(String(port.label), cx - 4.0, cy - 15.5, 1.8, '5_DIMENSIONS_SILKSCREEN');
      }
    }
  });

  return dxf.toDxfString();
}
