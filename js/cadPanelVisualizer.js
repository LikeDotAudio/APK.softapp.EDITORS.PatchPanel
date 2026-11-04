// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Authentic 19-Inch EIA-310 CAD Panel Visualizer & Mechanical Blueprint Generator
// Visualizes all equipment archetypes: Bantam TT, 1/4" Jack, RJ45 Data, 75Ω Video, and EIA D-Series Termination

import { CAD_CONNECTOR_SYMBOLS_SVG, getConnectorMeta } from './cadConnectorSymbols.js';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function renderCadPanelSvg(panel, options = {}) {
  const {
    viewMode = 'faceplate', // 'faceplate' | 'drill' | 'scribble'
    selectedPortIndex = null,
    zoom = 1,
  } = options;

  const ru = Math.max(1, parseInt(panel.rackUnits || 1, 10));
  const isWallPlate = panel.isWallPlate || panel.formFactor === 'wallplate';

  // 19-inch standard rack dimensions in millimeters
  const rackWidthMm = isWallPlate ? (panel.gangs === 2 ? 116 : panel.gangs === 4 ? 208 : 70) : 482.6;
  const rackHeightMm = isWallPlate ? 114.3 : ru * 44.45;
  const earWidthMm = isWallPlate ? 0 : 15.9;
  const usableWidthMm = rackWidthMm - earWidthMm * 2;

  const portsPerRow = Math.max(1, parseInt(panel.portsPerRow || 24, 10));
  const ports = Array.isArray(panel.ports) ? panel.ports : [];
  const numRows = Math.max(1, Math.ceil(ports.length / portsPerRow) || 1);

  // Hardware model archetype detection
  const hwType = String(panel.hardwareType || panel.type || '').trim().toLowerCase();
  const hasBantamConn = ports.some(p => String(p.connector || '').toLowerCase().includes('bantam'));
  const hasTrsConn = ports.some(p => String(p.connector || '').toLowerCase().includes('trs') || String(p.connector || '').toLowerCase().includes('1/4'));
  const hasNormalling = ports.some(p => p.normalling || p.normalMode);
  const isBantam = hwType.includes('bantam') || hasBantamConn || (hasNormalling && !hasTrsConn);
  const isJack = (hwType.includes('jack') || hasTrsConn) && !isBantam;
  const isData = hwType.includes('data') || hwType.includes('keystone');
  const isVideo = hwType.includes('video');
  const isAudioPatchbay = isBantam || isJack || hasNormalling;

  // Exact hardware physical pitch and datum offset
  const datumVal = panel.datumMm ?? panel.datumOffsetMm;
  const hasPhysicalPitch = Boolean(panel.portPitchMm && datumVal);
  const pitchMm = Number(panel.portPitchMm) || (usableWidthMm / portsPerRow);
  const datumMm = Number(datumVal) || Math.max(6, (usableWidthMm - (portsPerRow - 1) * pitchMm) / 2);
  const windowHMm = Math.min(15, Number(panel.labelWindowHeightMm) || (isData ? 9.5 : isAudioPatchbay ? 8.0 : 7.5));

  const svgParts = [];

  // 1. Defs containing CAD connector symbols and photorealistic shaders
  svgParts.push('<defs>');
  svgParts.push(CAD_CONNECTOR_SYMBOLS_SVG);
  svgParts.push(`
    <linearGradient id="cad_chassis_finish" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#242428"/>
      <stop offset="3%" stop-color="#18181b"/>
      <stop offset="97%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#0a0a0c"/>
    </linearGradient>
    <linearGradient id="cad_bantam_chassis" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1f2024"/>
      <stop offset="4%" stop-color="#141518"/>
      <stop offset="96%" stop-color="#101114"/>
      <stop offset="100%" stop-color="#0a0a0c"/>
    </linearGradient>
    <linearGradient id="cad_ear_bevel" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3f3f46"/>
      <stop offset="10%" stop-color="#27272a"/>
      <stop offset="90%" stop-color="#1c1c1f"/>
      <stop offset="100%" stop-color="#111113"/>
    </linearGradient>
    <linearGradient id="cad_recess_channel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#050507"/>
      <stop offset="15%" stop-color="#0b0b0e"/>
      <stop offset="85%" stop-color="#0e0e12"/>
      <stop offset="100%" stop-color="#18181c"/>
    </linearGradient>
    <linearGradient id="cad_keystone_bezel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a2a30"/>
      <stop offset="5%" stop-color="#1c1c20"/>
      <stop offset="95%" stop-color="#141417"/>
      <stop offset="100%" stop-color="#0c0c0e"/>
    </linearGradient>
    <linearGradient id="cad_label_strip_bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <radialGradient id="cad_screw_head" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#e4e4e7"/>
      <stop offset="40%" stop-color="#a1a1aa"/>
      <stop offset="100%" stop-color="#3f3f46"/>
    </radialGradient>
    <radialGradient id="cad_bnc_ring" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="60%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </radialGradient>
    <filter id="cad_select_glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#F4902C" flood-opacity="0.8"/>
    </filter>
  `);
  svgParts.push('</defs>');

  if (viewMode === 'drill') {
    // ── MECHANICAL DRILL & FABRICATION BLUEPRINT ────────────────────────
    svgParts.push(`<rect x="0" y="0" width="${rackWidthMm}" height="${rackHeightMm}" fill="#0d0e12" stroke="#2563eb" stroke-width="0.8"/>`);
    svgParts.push(`<rect x="${earWidthMm}" y="0" width="${usableWidthMm}" height="${rackHeightMm}" fill="none" stroke="#3b82f6" stroke-width="0.4" stroke-dasharray="3,2"/>`);

    const typeDesc = isBantam ? 'TT BANTAM AUDIO JACKFIELD' : isJack ? '1/4" TRS JACKFIELD' : isData ? 'MODULAR RJ45 KEYSTONE' : isVideo ? '75Ω BNC VIDEO PATCH' : 'D-SERIES TERMINATION';
    svgParts.push(`<text x="24" y="6" fill="#38bdf8" font-size="3" font-family="monospace" font-weight="bold">FABRICATION BLUEPRINT: ${esc(panel.name || 'PATCH PANEL')} · ${ru}U EIA-310-D [${typeDesc}]</text>`);
    svgParts.push(`<text x="${rackWidthMm - 24}" y="6" fill="#64748b" font-size="2.4" text-anchor="end" font-family="monospace">PITCH: ${pitchMm.toFixed(2)}mm · DATUM X₀: ${datumMm.toFixed(2)}mm · BORE: Ø${isBantam ? '6.5' : isData ? '14.5x16' : '24.0'}mm</text>`);

    // Rack ear mounting slots
    if (!isWallPlate) {
      [-1, 1].forEach(side => {
        const earX = side === -1 ? 7.95 : rackWidthMm - 7.95;
        for (let u = 0; u < ru; u++) {
          const uCenterY = u * 44.45 + 22.225;
          svgParts.push(`<ellipse cx="${earX}" cy="${uCenterY - 15.875}" rx="4.75" ry="3.5" fill="none" stroke="#38bdf8" stroke-width="0.5"/>`);
          svgParts.push(`<ellipse cx="${earX}" cy="${uCenterY + 15.875}" rx="4.75" ry="3.5" fill="none" stroke="#38bdf8" stroke-width="0.5"/>`);
          svgParts.push(`<line x1="${earX - 6}" y1="${uCenterY}" x2="${earX + 6}" y2="${uCenterY}" stroke="#64748b" stroke-width="0.2" stroke-dasharray="1,1"/>`);
        }
      });
    }

    // Drill centers for each port
    const rowSpacing = (rackHeightMm - 14) / numRows;

    ports.forEach((port, idx) => {
      const r = Math.floor(idx / portsPerRow);
      const c = idx % portsPerRow;
      const cx = hasPhysicalPitch
        ? (earWidthMm + datumMm + c * pitchMm)
        : (earWidthMm + (usableWidthMm / portsPerRow) * (c + 0.5));
      const cy = 10 + rowSpacing * (r + 0.5);

      if (isBantam) {
        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="3.25" fill="none" stroke="#38bdf8" stroke-width="0.5"/>`);
        svgParts.push(`<line x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="#0ea5e9" stroke-width="0.2" stroke-dasharray="1,1"/>`);
        svgParts.push(`<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}" stroke="#0ea5e9" stroke-width="0.2" stroke-dasharray="1,1"/>`);
      } else if (isData) {
        svgParts.push(`<rect x="${cx - 7.5}" y="${cy - 8}" width="15" height="16" fill="none" stroke="#38bdf8" stroke-width="0.5"/>`);
      } else {
        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="#38bdf8" stroke-width="0.6"/>`);
        svgParts.push(`<line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}" stroke="#0ea5e9" stroke-width="0.3" stroke-dasharray="2,1"/>`);
        svgParts.push(`<line x1="${cx}" y1="${cy - 14}" x2="${cx}" y2="${cy + 14}" stroke="#0ea5e9" stroke-width="0.3" stroke-dasharray="2,1"/>`);
        svgParts.push(`<circle cx="${cx - 9.5}" cy="${cy - 12}" r="1.6" fill="none" stroke="#ef4444" stroke-width="0.4"/>`);
        svgParts.push(`<circle cx="${cx + 9.5}" cy="${cy + 12}" r="1.6" fill="none" stroke="#ef4444" stroke-width="0.4"/>`);
      }
      svgParts.push(`<text x="${cx}" y="${cy + 1.2}" fill="#64748b" font-size="2.6" text-anchor="middle" font-family="monospace">${port.portNumber ?? (idx + 1)}</text>`);
    });

  } else if (viewMode === 'scribble') {
    // ── SCRIBBLE STRIP PAPER / INSERT PRINT VIEW ────────────────────────
    const stripHeightMm = Math.min(12, (rackHeightMm - 12) / numRows);
    svgParts.push(`<rect x="0" y="0" width="${rackWidthMm}" height="${rackHeightMm}" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.5"/>`);
    svgParts.push(`<text x="12" y="6" fill="#0f172a" font-size="3.5" font-weight="bold" font-family="sans-serif">${esc(panel.name || 'SCRIBBLE INSERT STRIPS')} · ${panel.ports.length} PORTS</text>`);

    const colWidth = usableWidthMm / portsPerRow;
    for (let r = 0; r < numRows; r++) {
      const sy = 10 + r * (stripHeightMm + 6);
      svgParts.push(`<rect x="${earWidthMm}" y="${sy}" width="${usableWidthMm}" height="${stripHeightMm}" fill="#f8fafc" stroke="#0f172a" stroke-width="0.6"/>`);

      for (let c = 0; c < portsPerRow; c++) {
        const pIdx = r * portsPerRow + c;
        const port = ports[pIdx];
        const sx = earWidthMm + c * colWidth;

        svgParts.push(`<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${sy + stripHeightMm}" stroke="#94a3b8" stroke-width="0.4"/>`);

        if (port) {
          const num = port.portNumber ?? (pIdx + 1);
          const lbl = port.label || `P${num}`;
          const dest = port.endpoint || '';
          svgParts.push(`<text x="${sx + 1.5}" y="${sy + 3.2}" fill="#d97706" font-size="2.4" font-weight="bold" font-family="monospace">${num}</text>`);
          svgParts.push(`<text x="${sx + colWidth / 2}" y="${sy + 5.5}" fill="#0f172a" font-size="2.8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(lbl)}</text>`);
          if (dest) {
            svgParts.push(`<text x="${sx + colWidth / 2}" y="${sy + 9.5}" fill="#64748b" font-size="2.1" text-anchor="middle" font-family="sans-serif">${esc(dest)}</text>`);
          }
        }
      }
    }

  } else {
    // ── AUTHENTIC CAD HARDWARE FACEPLATE (MODEL-SPECIFIC ARCHETYPE) ─────

    // Main Chassis Plate
    const chassisFill = isBantam ? 'url(#cad_bantam_chassis)' : 'url(#cad_chassis_finish)';
    svgParts.push(`<rect x="0" y="0" width="${rackWidthMm}" height="${rackHeightMm}" rx="2" fill="${chassisFill}" stroke="#2c2c2c" stroke-width="0.8"/>`);
    svgParts.push(`<rect x="0.8" y="0.8" width="${rackWidthMm - 1.6}" height="${rackHeightMm - 1.6}" rx="1.5" fill="none" stroke="#3f3f46" stroke-width="0.3"/>`);

    // Left and Right Rack Mounting Ears with Brushed Bevel & Oval Screws
    if (!isWallPlate) {
      svgParts.push(`<rect x="0" y="0" width="${earWidthMm}" height="${rackHeightMm}" fill="url(#cad_ear_bevel)" stroke="#2c2c2c" stroke-width="0.5"/>`);
      svgParts.push(`<rect x="${rackWidthMm - earWidthMm}" y="0" width="${earWidthMm}" height="${rackHeightMm}" fill="url(#cad_ear_bevel)" stroke="#2c2c2c" stroke-width="0.5"/>`);

      [-1, 1].forEach(side => {
        const earX = side === -1 ? 7.95 : rackWidthMm - 7.95;
        for (let u = 0; u < ru; u++) {
          const uCenterY = u * 44.45 + 22.225;
          [uCenterY - 15.875, uCenterY + 15.875].forEach(slotY => {
            svgParts.push(`<rect x="${earX - 4.75}" y="${slotY - 3.5}" width="9.5" height="7" rx="3.5" fill="#09090b" stroke="#3f3f46" stroke-width="0.8"/>`);
            svgParts.push(`<circle cx="${earX}" cy="${slotY}" r="3.2" fill="url(#cad_screw_head)" stroke="#18181b" stroke-width="0.5"/>`);
            svgParts.push(`<rect x="${earX - 2.2}" y="${slotY - 0.45}" width="4.4" height="0.9" fill="#18181b"/>`);
          });
        }
      });
    }

    // Top Header Laser-engraved silkscreen brand & model tag
    svgParts.push(`<rect x="${earWidthMm + 4}" y="1.5" width="${usableWidthMm - 8}" height="5.5" rx="1" fill="#0f0f11" stroke="#2c2c2c" stroke-width="0.4"/>`);
    svgParts.push(`<circle cx="${earWidthMm + 8}" cy="4.2" r="1.4" fill="#F4902C"/>`);

    const mfgTag = panel.hardwareMake ? `${panel.hardwareMake} ${panel.hardwareModel || ''}` : '';
    const panelTitle = panel.name || 'PP-AUDIO-01';
    svgParts.push(`<text x="${earWidthMm + 12}" y="5.1" fill="#f4f4f5" font-size="2.6" font-weight="700" font-family="sans-serif">${esc(panelTitle)}</text>`);

    const subTag = mfgTag ? `${mfgTag} · ${ru}U ${panel.hardwareType || 'Panel'}` : `${esc(panel.room || 'MDF RACK 01')} · ${ru}U EIA-310 · ${ports.length} PORTS`;
    svgParts.push(`<text x="${earWidthMm + (panelTitle.length * 2.2 + 18)}" y="5.1" fill="#888888" font-size="2.1" font-family="sans-serif">${esc(subTag)}</text>`);
    svgParts.push(`<text x="${rackWidthMm - earWidthMm - 6}" y="5.1" fill="#F4902C" font-size="2.2" font-weight="bold" text-anchor="end" font-family="monospace">APK.audio CAD</text>`);

    // ── ARCHETYPE-SPECIFIC CHASSIS HIGHLIGHTS ──

    if (isAudioPatchbay) {
      // BANTAM TT or 1/4" TRS JACKFIELD CHASSIS
      // Continuous recessed designation channel along the top and bottom
      const channelW = usableWidthMm - 8;
      const channelX = earWidthMm + 4;
      const topLabelY = 8;
      const btmLabelY = rackHeightMm - windowHMm - 3;

      // Top Designation Pocket
      svgParts.push(`<rect x="${channelX}" y="${topLabelY}" width="${channelW}" height="${windowHMm}" rx="1" fill="url(#cad_recess_channel)" stroke="#27272a" stroke-width="0.5"/>`);
      svgParts.push(`<rect x="${channelX + 0.5}" y="${topLabelY + 0.5}" width="${channelW - 1}" height="${windowHMm - 1}" fill="url(#cad_label_strip_bg)"/>`);
      svgParts.push(`<text x="${channelX + 2}" y="${topLabelY + windowHMm - 2}" fill="#d97706" font-size="2.2" font-weight="bold" font-family="monospace">ROW A · OUTPUTS</text>`);

      // Bottom Designation Pocket
      if (numRows > 1 || ru >= 2) {
        svgParts.push(`<rect x="${channelX}" y="${btmLabelY}" width="${channelW}" height="${windowHMm}" rx="1" fill="url(#cad_recess_channel)" stroke="#27272a" stroke-width="0.5"/>`);
        svgParts.push(`<rect x="${channelX + 0.5}" y="${btmLabelY + 0.5}" width="${channelW - 1}" height="${windowHMm - 1}" fill="url(#cad_label_strip_bg)"/>`);
        svgParts.push(`<text x="${channelX + 2}" y="${btmLabelY + windowHMm - 2}" fill="#2563eb" font-size="2.2" font-weight="bold" font-family="monospace">ROW B · INPUTS</text>`);
      }

      // Middle Ground Bus / Jack Rail Channel
      const midY = (topLabelY + windowHMm + btmLabelY) / 2;
      svgParts.push(`<line x1="${channelX}" y1="${midY}" x2="${channelX + channelW}" y2="${midY}" stroke="#27272a" stroke-width="0.8"/>`);
      svgParts.push(`<line x1="${channelX}" y1="${midY}" x2="${channelX + channelW}" y2="${midY}" stroke="#09090b" stroke-width="0.4" stroke-dasharray="2,2"/>`);

    } else if (isData) {
      // MODULAR KEYSTONE / RJ45 DATA PANEL
      // 4 Modular Bezel Blocks (groups of 6 ports)
      const blocksCount = Math.max(1, Math.round(portsPerRow / 6));
      const blockSpan = (usableWidthMm - 12) / blocksCount;

      for (let b = 0; b < blocksCount; b++) {
        const bx = earWidthMm + 6 + b * blockSpan;
        const bw = blockSpan - 3;
        const by = 8;
        const bh = rackHeightMm - 13;

        svgParts.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="2" fill="url(#cad_keystone_bezel)" stroke="#3f3f46" stroke-width="0.5"/>`);
        svgParts.push(`<text x="${bx + bw / 2}" y="${by + 3.2}" fill="#71717a" font-size="2" text-anchor="middle" font-family="sans-serif">MODULAR BLOCK ${b + 1}</text>`);

        // Slide-in label window above ports in each modular block
        svgParts.push(`<rect x="${bx + 2}" y="${by + 4.2}" width="${bw - 4}" height="${windowHMm * 0.75}" rx="0.8" fill="#ffffff" stroke="#94a3b8" stroke-width="0.3"/>`);
      }

    } else if (isVideo) {
      // 75Ω BNC VIDEO PATCH PANEL
      const channelW = usableWidthMm - 8;
      const channelX = earWidthMm + 4;
      svgParts.push(`<rect x="${channelX}" y="8" width="${channelW}" height="${windowHMm}" rx="1" fill="url(#cad_recess_channel)" stroke="#3b82f6" stroke-width="0.4"/>`);
      svgParts.push(`<rect x="${channelX + 0.5}" y="8.5" width="${channelW - 1}" height="${windowHMm - 1}" fill="url(#cad_label_strip_bg)"/>`);
      svgParts.push(`<text x="${channelX + 2}" y="${8 + windowHMm - 2}" fill="#0f172a" font-size="2.2" font-weight="bold" font-family="monospace">75Ω SDI VIDEO CHANNELS</text>`);
    }

    // ── PORT RENDERING LOOP ──
    const rowHeight = (rackHeightMm - (isAudioPatchbay ? windowHMm * 2 + 10 : 12)) / numRows;

    ports.forEach((port, idx) => {
      const r = Math.floor(idx / portsPerRow);
      const c = idx % portsPerRow;

      // Exact horizontal center X using physical hardware pitch or proportional grid
      const cx = hasPhysicalPitch
        ? (earWidthMm + datumMm + c * pitchMm)
        : (earWidthMm + (usableWidthMm / portsPerRow) * (c + 0.5));

      // Vertical center Y
      let cy = 8 + (isAudioPatchbay ? windowHMm + 2 : 0) + rowHeight * (r + 0.5);
      if (isAudioPatchbay && numRows === 2) {
        cy = r === 0 ? (8 + windowHMm + 5.5) : (rackHeightMm - windowHMm - 8.5);
      }

      const isSelected = selectedPortIndex === idx;
      const defaultIcon = isBantam ? 'bantam-tt' : isJack ? 'trs' : isData ? 'ethercon' : isVideo ? 'bnc' : 'xlr-f';
      const connMeta = getConnectorMeta(port.connector || defaultIcon);

      const portNum = port.portNumber ?? (idx + 1);
      const label = port.label || `P${portNum}`;
      const dest = port.endpoint || '';

      // Port interactive SVG Group
      svgParts.push(`<g class="cad-panel-port" draggable="true" data-port-index="${idx}" data-port-num="${portNum}" style="cursor: grab;">`);

      if (isBantam) {
        // ── 1. BANTAM TT PRECISION BUSHING VISUALIZATION ──
        const radius = isSelected ? 4.6 : 3.8;
        const filterAttr = isSelected ? 'filter="url(#cad_select_glow)"' : '';
        const strokeColor = isSelected ? '#F4902C' : '#18181b';

        // Outer collar & gold bushing
        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#27272a" stroke="${strokeColor}" stroke-width="${isSelected ? 0.9 : 0.4}" ${filterAttr}/>`);
        svgParts.push(`<use href="#cad-icon-bantam-tt" x="${cx - radius * 0.9}" y="${cy - radius * 0.9}" width="${radius * 1.8}" height="${radius * 1.8}"/>`);

        // Normalling indicator between Row A and Row B
        if (r === 0 && numRows === 2) {
          const cyBottom = rackHeightMm - windowHMm - 8.5;
          const normMode = String(port.normalling || port.normalMode || 'half').toLowerCase();
          if (normMode.includes('full')) {
            // Full normal: green link with switch dot
            svgParts.push(`<line x1="${cx}" y1="${cy + 4.5}" x2="${cx}" y2="${cyBottom - 4.5}" stroke="#10b981" stroke-width="0.6"/>`);
            svgParts.push(`<circle cx="${cx}" cy="${(cy + cyBottom) / 2}" r="1.1" fill="#10b981"/>`);
          } else if (normMode.includes('isolated') || normMode.includes('non')) {
            // Isolated / Non-Normal: disconnected break
            svgParts.push(`<line x1="${cx}" y1="${cy + 4.5}" x2="${cx}" y2="${cy + 7}" stroke="#64748b" stroke-width="0.4"/>`);
            svgParts.push(`<line x1="${cx}" y1="${cyBottom - 7}" x2="${cx}" y2="${cyBottom - 4.5}" stroke="#64748b" stroke-width="0.4"/>`);
          } else if (normMode.includes('parallel') || normMode.includes('mult')) {
            // Parallel (Mult): dual amber bus lines
            svgParts.push(`<line x1="${cx - 0.7}" y1="${cy + 4.5}" x2="${cx - 0.7}" y2="${cyBottom - 4.5}" stroke="#f59e0b" stroke-width="0.5"/>`);
            svgParts.push(`<line x1="${cx + 0.7}" y1="${cy + 4.5}" x2="${cx + 0.7}" y2="${cyBottom - 4.5}" stroke="#f59e0b" stroke-width="0.5"/>`);
          } else {
            // Half normal: directional arrow
            svgParts.push(`<line x1="${cx}" y1="${cy + 4.5}" x2="${cx}" y2="${cyBottom - 4.5}" stroke="#38bdf8" stroke-width="0.5" stroke-dasharray="1.5,1"/>`);
            svgParts.push(`<polygon points="${cx},${(cy + cyBottom) / 2 + 1.2} ${cx - 0.9},${(cy + cyBottom) / 2 - 0.9} ${cx + 0.9},${(cy + cyBottom) / 2 - 0.9}" fill="#38bdf8"/>`);
          }
        }

        // Port number & label printed on adjacent designation strip
        const labelY = r === 0 ? (8 + windowHMm - 2) : (rackHeightMm - 5);
        svgParts.push(`<text x="${cx}" y="${labelY}" fill="#0f172a" font-size="1.8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(label)}</text>`);
        svgParts.push(`<text x="${cx}" y="${r === 0 ? cy - 4.5 : cy + 6}" fill="${isSelected ? '#F4902C' : '#71717a'}" font-size="1.8" font-family="monospace" text-anchor="middle">${portNum}</text>`);

      } else if (isJack) {
        // ── 2. 1/4" BALANCED TRS PHONE JACK VISUALIZATION ──
        const radius = isSelected ? 6.8 : 5.8;
        const filterAttr = isSelected ? 'filter="url(#cad_select_glow)"' : '';
        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#3f3f46" stroke="${isSelected ? '#F4902C' : '#18181b'}" stroke-width="${isSelected ? 1.0 : 0.5}" ${filterAttr}/>`);
        svgParts.push(`<use href="#cad-icon-trs" x="${cx - radius * 0.9}" y="${cy - radius * 0.9}" width="${radius * 1.8}" height="${radius * 1.8}"/>`);

        // Normalling indicator between Row A and Row B for 1/4" bays
        if (r === 0 && numRows === 2) {
          const cyBottom = rackHeightMm - windowHMm - 8.5;
          const normMode = String(port.normalling || port.normalMode || 'half').toLowerCase();
          const normColor = normMode.includes('full') ? '#10b981' : normMode.includes('isolated') ? '#64748b' : normMode.includes('parallel') ? '#f59e0b' : '#38bdf8';
          svgParts.push(`<line x1="${cx}" y1="${cy + radius + 1}" x2="${cx}" y2="${cyBottom - radius - 1}" stroke="${normColor}" stroke-width="0.6"/>`);
        }

        svgParts.push(`<text x="${cx}" y="${cy - radius - 1}" fill="${isSelected ? '#F4902C' : '#a1a1aa'}" font-size="2" font-family="monospace" text-anchor="middle">${portNum}</text>`);
        svgParts.push(`<text x="${cx}" y="${cy + radius + 3.2}" fill="#f4f4f5" font-size="1.9" font-weight="bold" font-family="sans-serif" text-anchor="middle">${esc(label)}</text>`);

      } else if (isData) {
        // ── 3. KEYSTONE / RJ45 MODULAR PORT VISUALIZATION ──
        const kw = Math.min(pitchMm * 0.88, 15.5);
        const kh = Math.min(rowHeight * 0.7, 16.5);
        const kx = cx - kw / 2;
        const ky = cy - kh / 2;
        const filterAttr = isSelected ? 'filter="url(#cad_select_glow)"' : '';

        // Molded modular bezel cutout
        svgParts.push(`<rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" rx="1" fill="#09090b" stroke="${isSelected ? '#F4902C' : '#3f3f46'}" stroke-width="${isSelected ? 1.0 : 0.5}" ${filterAttr}/>`);

        // Shielded RJ45 / EtherCON Socket Icon
        const iconSize = Math.min(kw, kh) * 0.85;
        svgParts.push(`<use href="#cad-icon-rj45" x="${cx - iconSize / 2}" y="${cy - iconSize / 2}" width="${iconSize}" height="${iconSize}"/>`);
        svgParts.push(`<text x="${cx}" y="${ky - 1.2}" fill="${isSelected ? '#F4902C' : '#71717a'}" font-size="1.9" font-family="monospace" text-anchor="middle">${portNum}</text>`);

        // Label on modular strip
        svgParts.push(`<text x="${cx}" y="${ky + kh + 2.8}" fill="#f4f4f5" font-size="1.8" font-weight="bold" font-family="sans-serif" text-anchor="middle">${esc(label)}</text>`);

      } else if (isVideo) {
        // ── 4. 75Ω BNC VIDEO BULKHEAD VISUALIZATION ──
        const radius = isSelected ? 8.2 : 7.2;
        const filterAttr = isSelected ? 'filter="url(#cad_select_glow)"' : '';

        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="url(#cad_bnc_ring)" stroke="${isSelected ? '#F4902C' : '#18181b'}" stroke-width="${isSelected ? 1.1 : 0.6}" ${filterAttr}/>`);
        const iconSize = radius * 1.7;
        svgParts.push(`<use href="#cad-icon-bnc" x="${cx - iconSize / 2}" y="${cy - iconSize / 2}" width="${iconSize}" height="${iconSize}"/>`);
        svgParts.push(`<text x="${cx}" y="${cy - radius - 1.2}" fill="${isSelected ? '#F4902C' : '#a1a1aa'}" font-size="2" font-family="monospace" text-anchor="middle">${portNum}</text>`);
        svgParts.push(`<text x="${cx}" y="${cy + radius + 3.2}" fill="#f4f4f5" font-size="1.9" font-weight="bold" font-family="sans-serif" text-anchor="middle">${esc(label)}</text>`);

      } else {
        // ── 5. STANDARD EIA-310-D D-SERIES FLANGE VISUALIZATION ──
        const colWidth = usableWidthMm / portsPerRow;
        const flangeW = Math.min(colWidth * 0.92, 26);
        const flangeH = Math.min(rowHeight * 0.72, 31);
        const flangeX = cx - flangeW / 2;
        const flangeY = cy - flangeH / 2;

        const filterAttr = isSelected ? 'filter="url(#cad_select_glow)"' : '';
        const strokeColor = isSelected ? '#F4902C' : '#3f3f46';
        const strokeW = isSelected ? '1.2' : '0.5';

        // D-Flange Plate
        svgParts.push(`<rect x="${flangeX}" y="${flangeY}" width="${flangeW}" height="${flangeH}" rx="1.5" fill="#1f1f23" stroke="${strokeColor}" stroke-width="${strokeW}" ${filterAttr}/>`);

        // D-Flange M3 Mounting Screws (top-left & bottom-right)
        svgParts.push(`<circle cx="${flangeX + 2.4}" cy="${flangeY + 2.4}" r="1.1" fill="url(#cad_screw_head)" stroke="#18181b" stroke-width="0.3"/>`);
        svgParts.push(`<circle cx="${flangeX + flangeW - 2.4}" cy="${flangeY + flangeH - 2.4}" r="1.1" fill="url(#cad_screw_head)" stroke="#18181b" stroke-width="0.3"/>`);

        // Bore Hole
        const boreRadius = Math.min(flangeW, flangeH) * 0.42;
        svgParts.push(`<circle cx="${cx}" cy="${cy}" r="${boreRadius}" fill="#09090b" stroke="#2c2c2c" stroke-width="0.6"/>`);

        // Authentic Vector CAD Connector Icon rendered inside the bore
        const iconSize = boreRadius * 1.85;
        svgParts.push(`<use href="#cad-icon-${connMeta.id}" x="${cx - iconSize / 2}" y="${cy - iconSize / 2}" width="${iconSize}" height="${iconSize}"/>`);

        // Port Number Tag
        const numBadgeY = flangeY - 1.2;
        svgParts.push(`<text x="${cx}" y="${numBadgeY}" fill="${isSelected ? '#F4902C' : '#a1a1aa'}" font-size="2.2" font-weight="bold" text-anchor="middle" font-family="monospace">${portNum}</text>`);

        // Integrated Scribble Strip (below connector)
        const scribbleY = flangeY + flangeH + 0.5;
        const scribbleH = Math.max(4.5, rowHeight - flangeH - 3.5);
        svgParts.push(`<rect x="${flangeX}" y="${scribbleY}" width="${flangeW}" height="${scribbleH}" rx="0.8" fill="#0f0f11" stroke="#2c2c2c" stroke-width="0.3"/>`);

        // Primary Port Label
        svgParts.push(`<text x="${cx}" y="${scribbleY + 2.6}" fill="#f4f4f5" font-size="2.1" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(label)}</text>`);

        // Destination / Endpoint Wire Tag
        if (dest && scribbleH > 5.5) {
          svgParts.push(`<text x="${cx}" y="${scribbleY + 5.1}" fill="#888888" font-size="1.6" text-anchor="middle" font-family="sans-serif">${esc(dest)}</text>`);
        }
      }

      svgParts.push('</g>');
    });
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 ${rackWidthMm} ${rackHeightMm}"
         width="100%"
         height="100%"
         preserveAspectRatio="xMidYMid meet"
         role="img"
         aria-label="${esc(panel.name || 'CAD Patch Panel')}">
      ${svgParts.join('\n')}
    </svg>
  `;
}
