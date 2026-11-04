// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

export const MM_PER_INCH = 25.4;
export const PANEL_W_IN = 19.0;
export const USABLE_W_IN = 17.75;
export const INCHES_PER_U = 1.75;

export const inToMm = (inches) => inches * MM_PER_INCH;
export const roundIn = (inches) => Math.round(inches * 1000) / 1000;
export const roundMm = (mm) => Math.round(mm * 100) / 100;

export const SCRIBBLE_H_IN = { inserts: 0.39, etched: 0.5 };

export const PITCH_IN_BY_PPR = {
  1: 3, 2: 4.5, 4: 3, 6: 2, 8: 1.9, 12: 1.416, 16: 1.063, 24: 0.73, 48: 0.37,
};

export const BAY48_PITCH_IN = 0.335;
export const BAY48_MID_PITCH_IN = 0.560;

export const PORTS_PER_ROW_OPTIONS = [8, 12, 16, 24, 48];
export const RACK_UNIT_OPTIONS = [1, 2, 3, 4];

export function pitchInFor(portsPerRow, isBay) {
  if (isBay && portsPerRow === 48) return BAY48_PITCH_IN;
  return PITCH_IN_BY_PPR[portsPerRow] ?? (USABLE_W_IN / Math.max(1, portsPerRow));
}

export function rowsFor(portCount, portsPerRow) {
  return Math.max(1, Math.ceil(portCount / Math.max(1, portsPerRow)));
}

export function derivePanelLabelStock(type, scribbleMode = 'inserts', rows = 1) {
  const portsPerRow = Math.max(1, Math.round(type.portsPerRow) || 24);
  const rackUnits = type.rackUnits > 0 ? type.rackUnits : 1;
  const safeRows = Math.max(1, Math.round(rows) || 1);

  const pitchIn = pitchInFor(portsPerRow, type.isBay);
  const panelHIn = INCHES_PER_U * rackUnits;
  const rowHeightIn = panelHIn / safeRows;

  const bandIn = Math.min(SCRIBBLE_H_IN[scribbleMode] || 0.39, rowHeightIn * 0.7);
  const rowFillPct = (portsPerRow * pitchIn / USABLE_W_IN) * 100;

  return {
    id: `p${portsPerRow}-u${rackUnits}${type.isBay ? '-bay' : ''}-${scribbleMode}`,
    name: `${portsPerRow}-port ${type.isBay ? 'bay' : 'panel'} · ${rackUnits}U · ${roundIn(pitchIn)}″ pitch`,
    type: { portsPerRow, rackUnits, isBay: !!type.isBay },
    scribbleMode,
    cell: {
      widthIn: roundIn(pitchIn),
      heightIn: roundIn(bandIn),
      widthMm: roundMm(inToMm(pitchIn)),
      heightMm: roundMm(inToMm(bandIn)),
    },
    strip: {
      widthIn: roundIn(USABLE_W_IN),
      widthMm: roundMm(inToMm(USABLE_W_IN)),
      cellsPerRow: portsPerRow,
    },
    panel: {
      widthIn: roundIn(PANEL_W_IN),
      heightIn: roundIn(panelHIn),
      rows: safeRows,
    },
    overflowPct: Math.round(Math.max(0, rowFillPct - 100) * 100) / 100,
  };
}

export function scaleSummary(stock) {
  const { cell, type, panel } = stock;
  return `${type.portsPerRow}-port${type.isBay ? ' bay' : ''} · ${type.rackUnits}U · `
    + `cell ${cell.widthIn}″ × ${cell.heightIn}″ (${cell.widthMm} × ${cell.heightMm} mm) · `
    + `strip ${stock.strip.widthIn}″ of a ${panel.widthIn}″ panel · 1:1`;
}

export function buildScaleRulerHtml() {
  const ticks = Array.from({ length: 11 }, (_, i) =>
    `<div class="tick${i % 5 === 0 ? ' major' : ''}" style="left:${i * 10}%"></div>`).join('');
  return `<div class="ruler-wrap">
    <div class="ruler">${ticks}</div>
    <span class="ruler-cap">1 inch — calibrated 1:1 test ruler</span>
  </div>`;
}
