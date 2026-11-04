// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/**
 * Patch Panel & Patchbay Label Maker Geometry Engine
 * Computes exact physical millimeter dimensions, port pitch (P), datum left offset (X0),
 * vertical registration baseline (Y0), modular bezels, text clipping bounds,
 * and 1:1 printer calibration check blocks.
 */

export const MM_PER_INCH = 25.4;
export const POINTS_PER_MM = 72 / 25.4; // 2.83464567 postscript points per mm

export const LABEL_MECHANICAL_PRESETS = [
  {
    id: 'data_24p_slidein',
    name: '24-Port 1U Slide-in Data Panel (Standard EIA-310)',
    retaining: 'slide_in', // 'slide_in' | 'snap_in' | 'direct_adhesive'
    description: 'Continuous cardstock strip sliding behind clear plastic window',
    portsPerRow: 24,
    widthMm: 430.0,
    heightMm: 9.5,
    pitchMm: 17.5,
    datumMm: 13.75,
    baselineMm: 0.5,
    modularBlocks: 1,
    portsPerBlock: 24,
    dualRow: false
  },
  {
    id: 'keystone_modular_4x6',
    name: '24-Port Modular Keystone (4x 6-Port Snap-in Bezels)',
    retaining: 'snap_in',
    description: 'Individual modular plastic windows snapped onto 6-port bezels (4 blocks)',
    portsPerRow: 24,
    widthMm: 104.0,
    heightMm: 10.0,
    pitchMm: 16.5,
    datumMm: 10.75,
    baselineMm: 0.5,
    modularBlocks: 4,
    portsPerBlock: 6,
    blockGapMm: 4.8,
    dualRow: false
  },
  {
    id: 'd_series_16p_xlr',
    name: '16-Port 1U D-Series XLR / Neutrik D Panel',
    retaining: 'slide_in',
    description: '1U designation strip channel above or below 16 Neutrik D-type flanges',
    portsPerRow: 16,
    widthMm: 432.0,
    heightMm: 11.0,
    pitchMm: 26.5,
    datumMm: 17.25,
    baselineMm: 0.6,
    modularBlocks: 1,
    portsPerBlock: 16,
    dualRow: false
  },
  {
    id: 'tt_bantam_48p',
    name: '48-Point 1U TT Bantam Audio Jackfield (Single Row)',
    retaining: 'direct_adhesive',
    description: 'High-density polyester / vinyl strip applied to recessed aluminum channel',
    portsPerRow: 48,
    widthMm: 430.0,
    heightMm: 7.5,
    pitchMm: 8.5,
    datumMm: 11.25,
    baselineMm: 0.4,
    modularBlocks: 1,
    portsPerBlock: 48,
    dualRow: false
  },
  {
    id: 'tt_bantam_96p_dual',
    name: '96-Point 1U/2U Broadcast Audio Jackfield (Dual Row 2x48)',
    retaining: 'direct_adhesive',
    description: 'Upper row (Inputs 1-48) & Lower row (Outputs 49-96) with center ground gap',
    portsPerRow: 48,
    widthMm: 430.0,
    heightMm: 7.5,
    pitchMm: 8.5,
    datumMm: 11.25,
    baselineMm: 0.4,
    rowSpacingMm: 14.0, // center ground lug / chassis gap
    modularBlocks: 1,
    portsPerBlock: 48,
    dualRow: true
  },
  {
    id: 'bnc_24p_sdi',
    name: '24-Port 1U 75Ω BNC / 12G-SDI Video Jackfield',
    retaining: 'slide_in',
    description: 'Video patchbay with isolated BNC bulkheads and continuous slide-in pocket',
    portsPerRow: 24,
    widthMm: 432.0,
    heightMm: 9.0,
    pitchMm: 17.5,
    datumMm: 15.0,
    baselineMm: 0.5,
    modularBlocks: 1,
    portsPerBlock: 24,
    dualRow: false
  },
  {
    id: 'custom',
    name: 'Custom Mechanical Profile',
    retaining: 'slide_in',
    description: 'User-defined width, height, port pitch, and datum margin offsets',
    portsPerRow: 24,
    widthMm: 430.0,
    heightMm: 10.0,
    pitchMm: 17.5,
    datumMm: 14.0,
    baselineMm: 0.5,
    modularBlocks: 1,
    portsPerBlock: 24,
    dualRow: false
  }
];

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Computes exact physical millimeter coordinates for every port on a strip
 */
export function computePortGeometry(profile, portIndex) {
  const pitch = Number(profile.pitchMm) || 17.5;
  const datum = Number(profile.datumMm) || 14.0;
  const portsPerBlock = Number(profile.portsPerBlock) || profile.portsPerRow || 24;
  const blockGap = Number(profile.blockGapMm) || 0;

  const blockIndex = Math.floor(portIndex / portsPerBlock);
  const posInBlock = portIndex % portsPerBlock;

  // X_n = Datum + (n * Pitch) + block gap accumulation
  const centerX = datum + posInBlock * pitch + blockIndex * (portsPerBlock * pitch + blockGap);
  const cellWidth = Math.max(2, pitch - 1.0); // 1.0mm micro-margin ensures zero bleed between adjacent ports

  return {
    portIndex,
    blockIndex,
    posInBlock,
    centerX,
    cellWidth,
    leftX: centerX - cellWidth / 2,
    rightX: centerX + cellWidth / 2
  };
}

/**
 * Calculates dynamic font size to prevent text from bleeding across adjacent columns
 */
export function calculateFitFontSize(text, availableWidthMm, defaultPt = 7.5, minPt = 4.5) {
  if (!text) return defaultPt;
  const approxCharWidthMm = 0.55 * (defaultPt / 7.5);
  const textWidthMm = text.length * approxCharWidthMm;
  if (textWidthMm <= availableWidthMm) return defaultPt;
  const scaled = defaultPt * (availableWidthMm / textWidthMm);
  return Math.max(minPt, Math.round(scaled * 10) / 10);
}

/**
 * Renders a 1:1 true-scale vector SVG label strip with registration marks and calibration ruler
 */
export function renderMechanicalLabelStripSvg(panel, profile, options = {}) {
  const {
    highContrast = true, // true: paper white #ffffff, false: dark slate #121212
    showDimensions = true,
    showSignalColorBar = true,
    showCropMarks = true,
    showRuler = true,
    rowType = 'upper' // 'upper' | 'lower' for dualRow
  } = options;

  const widthMm = Number(profile.widthMm) || 430.0;
  const heightMm = Number(profile.heightMm) || 9.5;
  const portsCount = Number(profile.portsPerRow) || 24;

  const padLeftMm = 12.0;
  const padTopMm = showDimensions ? 16.0 : 8.0;
  const padBottomMm = showRuler ? 22.0 : 10.0;
  const totalSvgWidth = widthMm + padLeftMm * 2;
  const totalSvgHeight = heightMm + padTopMm + padBottomMm;

  const bgStrip = highContrast ? '#ffffff' : '#18181b';
  const borderStrip = highContrast ? '#000000' : '#3f3f46';
  const textPrimary = highContrast ? '#000000' : '#f4f4f5';
  const textMuted = highContrast ? '#4b5563' : '#888888';
  const textPortNum = highContrast ? '#b45309' : '#f4902c';
  const cellDivider = highContrast ? '#d1d5db' : '#2c2c2c';

  const parts = [];

  // SVG Defs
  parts.push(`
    <defs>
      <pattern id="calib_hatch" width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M 0 4 L 4 0" stroke="${highContrast ? '#e5e7eb' : '#27272a'}" stroke-width="0.5"/>
      </pattern>
    </defs>
  `);

  // Outer Canvas Background
  parts.push(`<rect x="0" y="0" width="${totalSvgWidth}" height="${totalSvgHeight}" fill="${highContrast ? '#fdfdfd' : '#0d0d0f'}"/>`);

  const stripX = padLeftMm;
  const stripY = padTopMm;

  // Title & Profile Spec
  parts.push(`
    <text x="${stripX}" y="${stripY - 4}" fill="${highContrast ? '#111827' : '#f4f4f5'}" font-size="3" font-weight="bold" font-family="sans-serif">
      ${esc(panel.name || 'PATCH PANEL')} · ${esc(profile.name)}
    </text>
    <text x="${stripX + widthMm}" y="${stripY - 4}" fill="${textMuted}" font-size="2.4" text-anchor="end" font-family="monospace">
      PITCH: ${profile.pitchMm}mm · DATUM X₀: ${profile.datumMm}mm · 1:1 ACTUAL SIZE
    </text>
  `);

  // Crop / Trim Marks at corners
  if (showCropMarks) {
    const cropLen = 4;
    // Top-Left
    parts.push(`<line x1="${stripX - cropLen}" y1="${stripY}" x2="${stripX}" y2="${stripY}" stroke="#ef4444" stroke-width="0.3"/>`);
    parts.push(`<line x1="${stripX}" y1="${stripY - cropLen}" x2="${stripX}" y2="${stripY}" stroke="#ef4444" stroke-width="0.3"/>`);
    // Top-Right
    parts.push(`<line x1="${stripX + widthMm}" y1="${stripY}" x2="${stripX + widthMm + cropLen}" y2="${stripY}" stroke="#ef4444" stroke-width="0.3"/>`);
    parts.push(`<line x1="${stripX + widthMm}" y1="${stripY - cropLen}" x2="${stripX + widthMm}" y2="${stripY}" stroke="#ef4444" stroke-width="0.3"/>`);
    // Bottom-Left
    parts.push(`<line x1="${stripX - cropLen}" y1="${stripY + heightMm}" x2="${stripX}" y2="${stripY + heightMm}" stroke="#ef4444" stroke-width="0.3"/>`);
    parts.push(`<line x1="${stripX}" y1="${stripY + heightMm}" x2="${stripX}" y2="${stripY + heightMm + cropLen}" stroke="#ef4444" stroke-width="0.3"/>`);
    // Bottom-Right
    parts.push(`<line x1="${stripX + widthMm}" y1="${stripY + heightMm}" x2="${stripX + widthMm + cropLen}" y2="${stripY + heightMm}" stroke="#ef4444" stroke-width="0.3"/>`);
    parts.push(`<line x1="${stripX + widthMm}" y1="${stripY + heightMm}" x2="${stripX + widthMm}" y2="${stripY + heightMm + cropLen}" stroke="#ef4444" stroke-width="0.3"/>`);
  }

  // Physical Printable Strip Body
  parts.push(`<rect x="${stripX}" y="${stripY}" width="${widthMm}" height="${heightMm}" fill="${bgStrip}" stroke="${borderStrip}" stroke-width="0.4"/>`);

  // Top and Bottom Fold Guidelines (Dashed line if slide-in)
  if (profile.retaining === 'slide_in') {
    parts.push(`<line x1="${stripX}" y1="${stripY + 0.6}" x2="${stripX + widthMm}" y2="${stripY + 0.6}" stroke="#9ca3af" stroke-width="0.15" stroke-dasharray="1,1"/>`);
    parts.push(`<line x1="${stripX}" y1="${stripY + heightMm - 0.6}" x2="${stripX + widthMm}" y2="${stripY + heightMm - 0.6}" stroke="#9ca3af" stroke-width="0.15" stroke-dasharray="1,1"/>`);
  }

  // Render Port Cells according to Mathematical Pitch & Datum Offset
  const rawPorts = Array.isArray(panel.ports) ? panel.ports : [];
  const offsetPortIdx = rowType === 'lower' && profile.dualRow ? portsCount : 0;

  for (let i = 0; i < portsCount; i++) {
    const geo = computePortGeometry(profile, i);
    const absX = stripX + geo.centerX;
    const portData = rawPorts[offsetPortIdx + i] || {};
    const pNum = portData.portNumber ?? (offsetPortIdx + i + 1);
    const label = portData.label || `P${pNum}`;
    const endpoint = portData.endpoint || '';
    const signal = portData.signal || 'Analog Audio';
    const sigColor = getSignalColor(signal);

    // Vertical Divider Line between cells
    if (i > 0) {
      const divX = stripX + (geo.centerX - profile.pitchMm / 2);
      parts.push(`<line x1="${divX}" y1="${stripY}" x2="${divX}" y2="${stripY + heightMm}" stroke="${cellDivider}" stroke-width="0.25"/>`);
    }

    // Optional 1mm Signal Color Indicator Band at top of cell
    if (showSignalColorBar) {
      parts.push(`<rect x="${stripX + geo.leftX}" y="${stripY + 0.8}" width="${geo.cellWidth}" height="0.9" fill="${sigColor}" rx="0.2"/>`);
    }

    // Port Number (Top of cell)
    const numY = stripY + (showSignalColorBar ? 3.3 : 2.8);
    parts.push(`<text x="${absX}" y="${numY}" fill="${textPortNum}" font-size="2" font-weight="bold" text-anchor="middle" font-family="monospace">${pNum}</text>`);

    // Port Label / Channel (Middle of cell, auto-scaled)
    const labelFontSize = calculateFitFontSize(label, geo.cellWidth, 2.7, 1.8);
    const labelY = numY + (heightMm > 9 ? 3.0 : 2.4);
    parts.push(`<text x="${absX}" y="${labelY}" fill="${textPrimary}" font-size="${labelFontSize}" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(label)}</text>`);

    // Destination / Wire Endpoint (Bottom of cell, if present and height allows)
    if (endpoint && heightMm >= 9.0) {
      const destFontSize = calculateFitFontSize(endpoint, geo.cellWidth, 2.0, 1.5);
      const destY = stripY + heightMm - 1.2;
      parts.push(`<text x="${absX}" y="${destY}" fill="${textMuted}" font-size="${destFontSize}" text-anchor="middle" font-family="sans-serif">${esc(endpoint)}</text>`);
    }
  }

  // Dimension Callouts (Arrows & Measurements)
  if (showDimensions) {
    const dimY = stripY + heightMm + 4.5;
    const p0 = computePortGeometry(profile, 0);
    const p1 = computePortGeometry(profile, 1);

    // Datum X0 Callout
    parts.push(`
      <line x1="${stripX}" y1="${dimY}" x2="${stripX + p0.centerX}" y2="${dimY}" stroke="#2563eb" stroke-width="0.3"/>
      <line x1="${stripX}" y1="${dimY - 1.5}" x2="${stripX}" y2="${dimY + 1.5}" stroke="#2563eb" stroke-width="0.3"/>
      <line x1="${stripX + p0.centerX}" y1="${dimY - 1.5}" x2="${stripX + p0.centerX}" y2="${dimY + 1.5}" stroke="#2563eb" stroke-width="0.3"/>
      <text x="${stripX + p0.centerX / 2}" y="${dimY - 1}" fill="#2563eb" font-size="1.8" text-anchor="middle" font-family="monospace">X₀=${profile.datumMm}mm</text>
    `);

    // Port Pitch P Callout
    parts.push(`
      <line x1="${stripX + p0.centerX}" y1="${dimY}" x2="${stripX + p1.centerX}" y2="${dimY}" stroke="#059669" stroke-width="0.3"/>
      <line x1="${stripX + p1.centerX}" y1="${dimY - 1.5}" x2="${stripX + p1.centerX}" y2="${dimY + 1.5}" stroke="#059669" stroke-width="0.3"/>
      <text x="${stripX + (p0.centerX + p1.centerX) / 2}" y="${dimY - 1}" fill="#059669" font-size="1.8" text-anchor="middle" font-family="monospace">P=${profile.pitchMm}mm</text>
    `);

    // Height H Callout on right side
    const hDimX = stripX + widthMm + 3.5;
    parts.push(`
      <line x1="${hDimX}" y1="${stripY}" x2="${hDimX}" y2="${stripY + heightMm}" stroke="#7c3aed" stroke-width="0.3"/>
      <line x1="${hDimX - 1.5}" y1="${stripY}" x2="${hDimX + 1.5}" y2="${stripY}" stroke="#7c3aed" stroke-width="0.3"/>
      <line x1="${hDimX - 1.5}" y1="${stripY + heightMm}" x2="${hDimX + 1.5}" y2="${stripY + heightMm}" stroke="#7c3aed" stroke-width="0.3"/>
      <text x="${hDimX + 2.5}" y="${stripY + heightMm / 2 + 0.6}" fill="#7c3aed" font-size="1.8" font-family="monospace">H=${heightMm}mm</text>
    `);
  }

  // 1:1 Printer Calibration Scale Ruler Check Block (50.0mm physical reference)
  if (showRuler) {
    const rulerY = stripY + heightMm + (showDimensions ? 10.5 : 4.5);
    const rulerW = 50.0; // exactly 50mm
    parts.push(`
      <g class="calib-check-ruler">
        <rect x="${stripX}" y="${rulerY}" width="${rulerW}" height="4.0" fill="none" stroke="${borderStrip}" stroke-width="0.3"/>
        <text x="${stripX + rulerW + 3}" y="${rulerY + 2.8}" fill="${textMuted}" font-size="2.0" font-family="monospace">
          50.0mm (1.9685″) PRINTER CALIBRATION CHECK · MEASURE WITH PHYSICAL RULER
        </text>
    `);

    // 1mm ticks along 50mm
    for (let t = 0; t <= 50; t++) {
      const tx = stripX + t;
      const isMajor = t % 10 === 0;
      const isMid = t % 5 === 0;
      const tickH = isMajor ? 3.5 : isMid ? 2.5 : 1.5;
      parts.push(`<line x1="${tx}" y1="${rulerY}" x2="${tx}" y2="${rulerY + tickH}" stroke="${borderStrip}" stroke-width="${isMajor ? 0.35 : 0.2}"/>`);
      if (isMajor && t > 0) {
        parts.push(`<text x="${tx}" y="${rulerY + 3.4}" fill="${textMuted}" font-size="1.4" text-anchor="middle" font-family="monospace">${t}</text>`);
      }
    }
    parts.push('</g>');
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" 
         viewBox="0 0 ${totalSvgWidth} ${totalSvgHeight}" 
         width="${totalSvgWidth}mm" 
         height="${totalSvgHeight}mm" 
         preserveAspectRatio="xMidYMid meet"
         data-scale="1:1"
         data-width-mm="${totalSvgWidth}"
         data-height-mm="${totalSvgHeight}">
      ${parts.join('')}
    </svg>
  `;
}

/**
 * Generates full multi-strip printable sheet HTML for standard Letter or A4 sheets
 */
export function generatePrintableSheetHtml(panel, profile, options = {}) {
  const pageSize = options.pageSize || 'letter'; // 'letter' | 'a4'
  const copies = Math.max(1, parseInt(options.copies || 3, 10));

  const stripSvg = renderMechanicalLabelStripSvg(panel, profile, {
    highContrast: true,
    showDimensions: false,
    showSignalColorBar: true,
    showCropMarks: true,
    showRuler: true
  });

  const copiesArr = Array.from({ length: copies }, () => stripSvg);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(panel.name || 'Patch_Panel')}_Labels_1to1</title>
  <style>
    @page {
      size: ${pageSize === 'a4' ? '297mm 210mm' : '11in 8.5in'} landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }
    .print-instructions {
      max-width: 900px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .print-instructions h3 {
      font-size: 14px;
      margin-bottom: 6px;
      color: #b45309;
    }
    .print-instructions p, .print-instructions li {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }
    .sheet-page {
      background: #ffffff;
      width: ${pageSize === 'a4' ? '297mm' : '11in'};
      min-height: ${pageSize === 'a4' ? '210mm' : '8.5in'};
      padding: 8mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 12mm;
    }
    .strip-wrapper {
      width: 100%;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 6mm;
    }
    .strip-wrapper:last-child {
      border-bottom: none;
    }
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .print-instructions, .btn-print-bar {
        display: none !important;
      }
      .sheet-page {
        box-shadow: none;
        padding: 0;
        width: 100%;
        min-height: auto;
      }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: #f4902c;
      color: #111;
      margin-top: 8px;
    }
    .btn:hover {
      background: #ffa552;
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <h3>📏 Physical Printer Scale Verification Guide</h3>
    <ol style="margin-left: 20px;">
      <li>In the Print Dialog, set <strong>Scale</strong> to <strong>100%</strong> or <strong>"Actual Size"</strong> (do NOT use "Fit to Page").</li>
      <li>Measure the printed <strong>50.0mm Calibration Ruler</strong> at the bottom of the strip with a physical ruler or dial caliper.</li>
      <li>If it measures exactly 50mm, the port pitch ($P=${profile.pitchMm}mm) and datum offset ($X_0=${profile.datumMm}mm) are geometrically locked to your hardware chassis.</li>
    </ol>
    <div class="btn-print-bar">
      <button class="btn" onclick="window.print()">🖨️ Print 1:1 Actual Size Now</button>
    </div>
  </div>

  <div class="sheet-page">
    ${copiesArr.map((svg, idx) => `
      <div class="strip-wrapper">
        <div style="font-size: 10px; font-weight: bold; color: #94a3b8; margin-bottom: 2mm;">
          STRIP COPY #${idx + 1} · ${esc(panel.name)} · CUT ALONG RED GUIDELINES
        </div>
        ${svg}
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}

function getSignalColor(signal) {
  const s = String(signal || '').toLowerCase();
  if (s.includes('audio') || s.includes('mic') || s.includes('line')) return '#10b981';
  if (s.includes('dante') || s.includes('aes67') || s.includes('net') || s.includes('eth')) return '#38bdf8';
  if (s.includes('sdi') || s.includes('hdmi') || s.includes('video')) return '#a855f7';
  if (s.includes('power') || s.includes('mains') || s.includes('pwr')) return '#ef4444';
  if (s.includes('clock') || s.includes('sync') || s.includes('word') || s.includes('rf')) return '#f59e0b';
  return '#94a3b8';
}
