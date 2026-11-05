// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Bridge to EDITORS.CAD.Like.audio for Seamless DXF Panel Fabrication & Editing

import { generateCadPanelDxf } from './cadDxfGenerator.js';

/* The wire: cad.like.audio/host@1 (EDITORS.CAD.Like.audio contract/host@1). The
   vendored apk-softapp client names it; the literal is only the fallback for a
   page (or a test) that did not load that script. */
export const CAD_HOST_PROTOCOL = (typeof window !== 'undefined' && window.APKSoftapp && window.APKSoftapp.PROTOCOL)
  || 'cad.like.audio/host@1';

export function dxfFileName(panel, customName = null) {
  const rawName = customName || panel.name || 'PATCH_PANEL';
  return `${String(rawName).replace(/[^a-zA-Z0-9_-]/g, '_')}_fabrication.dxf`;
}

/**
 * Downloads the panel drawing as a standard AutoCAD R2000 DXF file
 */
export function downloadPanelDxf(panel, customName = null, win = window) {
  const dxfStr = generateCadPanelDxf(panel);
  const fileName = dxfFileName(panel, customName);
  const doc = win.document;
  const blob = new win.Blob([dxfStr], { type: 'application/dxf;charset=utf-8' });
  const url = win.URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = fileName;
  doc.body.appendChild(a);
  a.click();
  doc.body.removeChild(a);
  win.URL.revokeObjectURL(url);
  return { fileName, size: dxfStr.length };
}

/**
 * Opens EDITORS.CAD.Like.audio in a window of its own and hands it the DXF over
 * cad.like.audio/host@1, as the CAD's hostBridge expects of a host that pops it
 * out: the address names a host (`#/drawing?host=panel`), so the CAD treats
 * window.opener (us) as its host and says `ready` once it is up. We answer that
 * `ready` — from that window, at our own origin — with ONE `floorplan` { file }.
 * No timers, no resends, no '*': a CAD that never says ready gets nothing.
 */
export function openInCadLikeAudio(panel, { win = window, onStatus = () => {} } = {}) {
  const dxfStr = generateCadPanelDxf(panel);
  const fileName = dxfFileName(panel);
  // Relative to this editor: ../EDITORS.CAD.Like.audio/dist/index.html#/drawing?host=panel
  const cadUrl = new URL('../EDITORS.CAD.Like.audio/dist/index.html#/drawing?host=panel', win.location.href).href;
  const origin = win.location.origin;

  let cadWin = null;
  let sent = false;
  const onMessage = (event) => {
    if (sent || !cadWin || event.source !== cadWin || event.origin !== origin) return;
    const msg = event.data;
    if (!msg || msg.protocol !== CAD_HOST_PROTOCOL || msg.type !== 'ready') return;
    sent = true;
    win.removeEventListener('message', onMessage);
    const file = new win.File([dxfStr], fileName, { type: 'application/dxf' });
    cadWin.postMessage({ protocol: CAD_HOST_PROTOCOL, type: 'floorplan', file }, origin);
    onStatus(`Handed ${fileName} to the CAD.`, 'good');
  };
  // Listening before the window exists: its `ready` cannot come before us.
  win.addEventListener('message', onMessage);

  cadWin = win.open(cadUrl, '_blank');
  if (!cadWin) {
    win.removeEventListener('message', onMessage);
    downloadPanelDxf(panel, null, win);
    onStatus('The browser blocked the CAD window: the DXF was downloaded instead.', 'kinda');
    return null;
  }
  onStatus('Waiting for the CAD to say ready…', 'kinda');
  return { cadWin, fileName, sent: () => sent };
}
