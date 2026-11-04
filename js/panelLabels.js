// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import { derivePanelLabelStock, rowsFor } from './panelLabelStock.js';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function buildPanelLabelStripSvg(panel, stock, options = {}) {
  const { theme = 'dark', zoom = 1 } = options;
  const isDark = theme === 'dark';

  const portsPerRow = stock.type.portsPerRow;
  const totalPorts = panel.ports.length;
  const numRows = rowsFor(totalPorts, portsPerRow);

  const stripWidthMm = stock.strip.widthMm;
  const cellWidthMm = stock.cell.widthMm;
  const cellHeightMm = stock.cell.heightMm;

  const bgPanel = isDark ? '#18181b' : '#f8f9fa';
  const borderPanel = isDark ? '#3f3f46' : '#d0d7de';
  const cellBg = isDark ? '#0f0f11' : '#ffffff';
  const cellBorder = isDark ? '#2c2c2c' : '#e1e4e8';
  const textPort = isDark ? '#F4902C' : '#d97706';
  const textLabel = isDark ? '#f4f4f5' : '#1f2937';
  const textEndpoint = isDark ? '#888888' : '#6b7280';

  const parts = [];
  const svgHeightMm = numRows * (cellHeightMm + 6) + 16;

  // Background chassis
  parts.push(`<rect x="0" y="0" width="${stripWidthMm}" height="${svgHeightMm}" rx="3" fill="${bgPanel}" stroke="${borderPanel}" stroke-width="0.5"/>`);

  // Header line
  parts.push(`<text x="6" y="8" fill="${isDark ? '#f4f4f5' : '#111'}" font-size="3.5" font-weight="bold" font-family="sans-serif">${esc(panel.name || panel.panelLabel || 'PATCH PANEL')}</text>`);
  parts.push(`<text x="${stripWidthMm - 6}" y="8" fill="${textEndpoint}" font-size="2.8" text-anchor="end" font-family="monospace">${stock.type.portsPerRow}P · ${stock.type.rackUnits}U · ${stock.scribbleMode.toUpperCase()}</text>`);

  for (let r = 0; r < numRows; r++) {
    const rowY = 12 + r * (cellHeightMm + 4);

    for (let c = 0; c < portsPerRow; c++) {
      const portIdx = r * portsPerRow + c;
      const port = panel.ports[portIdx];
      const cellX = c * cellWidthMm;

      if (cellX + cellWidthMm > stripWidthMm + 0.1) break;

      // Cell box
      parts.push(`<rect x="${cellX + 0.2}" y="${rowY}" width="${cellWidthMm - 0.4}" height="${cellHeightMm}" fill="${cellBg}" stroke="${cellBorder}" stroke-width="0.3"/>`);

      if (port) {
        const pNum = port.portNumber ?? (portIdx + 1);
        const pLabel = port.label || port.portLabel || `P${pNum}`;
        const pDest = port.endpoint || port.destination || '';

        // Port number
        parts.push(`<text x="${cellX + 1.2}" y="${rowY + 2.8}" fill="${textPort}" font-size="2.2" font-weight="bold" font-family="monospace">${pNum}</text>`);

        // Port label
        parts.push(`<text x="${cellX + cellWidthMm / 2}" y="${rowY + 5.2}" fill="${textLabel}" font-size="2.6" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(pLabel)}</text>`);

        // Endpoint
        if (pDest) {
          parts.push(`<text x="${cellX + cellWidthMm / 2}" y="${rowY + 8}" fill="${textEndpoint}" font-size="2" text-anchor="middle" font-family="sans-serif">${esc(pDest)}</text>`);
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${stripWidthMm} ${svgHeightMm}" `
    + `width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img">`
    + parts.join('')
    + `</svg>`;
}
