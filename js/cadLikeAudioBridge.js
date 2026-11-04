// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// Bridge to EDITORS.CAD.Like.audio for Seamless DXF Panel Fabrication & Editing

import { generateCadPanelDxf } from './cadDxfGenerator.js';

export const CAD_HOST_PROTOCOL = 'cad.like.audio/host@1';

/**
 * Downloads the panel drawing as a standard AutoCAD R2000 DXF file
 */
export function downloadPanelDxf(panel, customName = null) {
  const dxfStr = generateCadPanelDxf(panel);
  const rawName = customName || panel.name || 'PATCH_PANEL';
  const fileName = `${rawName.replace(/[^a-zA-Z0-9_-]/g, '_')}_fabrication.dxf`;

  const blob = new Blob([dxfStr], { type: 'application/dxf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { fileName, size: dxfStr.length };
}

/**
 * Opens EDITORS.CAD.Like.audio and hands over the generated DXF via cad.like.audio/host@1
 */
export function openInCadLikeAudio(panel) {
  const dxfStr = generateCadPanelDxf(panel);
  const rawName = panel.name || 'PATCH_PANEL';
  const fileName = `${rawName.replace(/[^a-zA-Z0-9_-]/g, '_')}_fabrication.dxf`;

  // 1. Persist DXF in storage as fallback transfer mechanism
  try {
    sessionStorage.setItem('apk_cad_pending_dxf', dxfStr);
    sessionStorage.setItem('apk_cad_pending_dxf_filename', fileName);
  } catch (e) {
    // Storage quota or sandboxed
  }

  // 2. Resolve URL for EDITORS.CAD.Like.audio
  // Relative to EDITORS.PanelBuddy: ../EDITORS.CAD.Like.audio/dist/index.html#/drawing?host=panel
  const cadUrl = new URL('../EDITORS.CAD.Like.audio/dist/index.html#/drawing?host=panel', window.location.href).href;

  const cadWin = window.open(cadUrl, '_blank');
  if (!cadWin) {
    // Popup was blocked: trigger direct DXF download instead
    downloadPanelDxf(panel, fileName);
    alert('Popup was blocked by the browser. Downloaded the DXF directly instead.');
    return null;
  }

  // 3. Prepare File object for cad.like.audio hostBridge protocol
  const dxfFile = new File([dxfStr], fileName, { type: 'application/dxf' });

  let sent = false;
  const sendDxf = () => {
    if (sent || !cadWin || cadWin.closed) return;
    try {
      cadWin.postMessage({
        protocol: CAD_HOST_PROTOCOL,
        type: 'floorplan',
        file: dxfFile
      }, window.location.origin);
      sent = true;
    } catch (err) {
      console.warn('[cadLikeAudioBridge] Error posting DXF to CAD window:', err);
    }
  };

  // 4. Listen for 'ready' signal from CAD.Like.audio
  const messageHandler = (event) => {
    if (event.source !== cadWin) return;
    const msg = event.data;
    if (msg && msg.protocol === CAD_HOST_PROTOCOL && msg.type === 'ready') {
      sendDxf();
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);

  // Fallback ping: in case ready was emitted before listener attached
  setTimeout(sendDxf, 1200);
  setTimeout(sendDxf, 2500);

  return { cadWin, fileName };
}
