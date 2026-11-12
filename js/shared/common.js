// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

/* What every part of PanelBuddyApp shares (ROAD-3766).
   One source: EDITORS.PanelBuddy/js/shared/. EDITORS.PatchPanel/js/shared/ is a byte copy,
   checked by EDITORS.PatchPanel/tests/sharedCopy.test.mjs — edit it here and copy it there. */

/** The shared client: window.APKSoftapp, read when asked (it may load after this module). */
export const S = () => window.APKSoftapp;

/** Copies a mixin class's methods onto `target`'s prototype as the class itself would
    define them (non-enumerable), so `this` and every method name stay the PanelBuddyApp's. */
export function mixInto(target, ...mixins) {
  for (const M of mixins) {
    for (const [name, d] of Object.entries(Object.getOwnPropertyDescriptors(M.prototype))) {
      if (name === 'constructor') continue;
      if (Object.prototype.hasOwnProperty.call(target.prototype, name)) throw new Error(`mixInto: ${name} is defined twice`);
      Object.defineProperty(target.prototype, name, d);
    }
  }
}
