/**
 * Patch Panel Vendor Catalog & Hardware Geometry Index
 *
 * The patch panels and patchbays the BIM library holds (2,174 parts with panel
 * geometry, read from it — this file keeps no list of makers or models of its own:
 * a panel is picked with 📚 Library, ROAD-3572/3597).
 *
 * Provides exact physical pitch (P), window height (H), rack units, datum offset (X0),
 * and chassis retaining mechanisms for 1:1 CAD panel visualizer and label maker.
 */

// Internal model cache
let catalogCache = null;
let catalogFault = null; // what stopped the last read of the BIM library, or null

/**
 * Standardize model object to full physical preset
 */
export function modelToMechanicalPreset(model) {
  if (!model) return null;
  const isModular = model.type === 'Keystone' || model.type === 'Modular';
  const retaining = model.retaining || (
    model.type === 'Data' ? 'slide_in' :
    isModular ? 'snap_in' : 'direct_adhesive'
  );
  const blocks = isModular ? Math.max(1, Math.round((model.portCount || 24) / 6)) : 1;
  const portCount = Number(model.portCount) || 24;
  const pitchMm = Number(model.portPitchMm) || 17.5;
  const widthMm = Number(model.stripWidthMm) || 430.0;
  const heightMm = Number(model.labelWindowHeightMm) || (model.type === 'Data' ? 9.5 : 8.0);
  const datumMm = Number(model.datumMm) || 13.75;

  return {
    id: `vendor_${String(model.make).toLowerCase().replace(/[^a-z0-9]/g, '_')}_${String(model.model).toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: `${model.make} ${model.model} (${portCount}P ${model.rackUnits} ${model.type})`,
    vendor: model.make,
    make: model.make,
    model: model.model,
    type: model.type,
    rackUnits: model.rackUnits,
    portCount,
    portsPerRow: portCount,
    portsPerBlock: blocks > 1 ? Math.round(portCount / blocks) : portCount,
    pitchMm,
    portPitchMm: pitchMm,
    portPitchInches: Number(model.portPitchInches) || (pitchMm / 25.4),
    widthMm,
    stripWidthMm: widthMm,
    heightMm,
    windowHeightMm: heightMm,
    labelWindowHeightMm: heightMm,
    labelWindowHeightInches: Number(model.labelWindowHeightInches) || (heightMm / 25.4),
    datumMm,
    baselineMm: 0.5,
    retaining,
    modularBlocks: blocks,
    blockGapMm: isModular ? 5.0 : 0.0,
    dualRow: false,
    description: `${model.make} ${model.model} · ${model.rackUnits} ${model.type} Panel · Pitch ${pitchMm}mm (${model.portPitchInches}″) · Window ${heightMm}mm (${model.labelWindowHeightInches}″)`
  };
}

/**
 * THE CATALOGUE LIVES IN THE BIM LIBRARY (DATABASE.server.BIM), not here.
 * Every patch panel is a part there (class "Patch Panel", its panel geometry in
 * ext.patch_panel); this module turns those parts back into the rows the label
 * maker and CAD visualizer have always used. The data/vendors/ copies this app
 * and EDITORS.PatchPanel each used to carry are gone.
 *   Browser: GET <BIM_API>/parts?class=Patch Panel&full=1 (paged).
 *   Node (tests, tools): the library repo on disk, beside this tree.
 * BIM_API is same-origin /api/bim unless the page sets globalThis.APK_BIM_API.
 */
const LIBRARY_FROM_HERE = '../../../../../POD.database/DATABASE.server.BIM/SRC/library/';
const PAGE = 1000;

function bimApi() {
  return (globalThis.APK_BIM_API || '/api/bim').replace(/\/$/, '');
}

const in2 = mm => Math.round((Number(mm) / 25.4) * 100) / 100;

/** One BIM part → the row shape this module has always handed out. */
export function partToVendorRow(part) {
  const ext = part?.ext?.patch_panel;
  if (!ext) return null;
  const phys = part.physical || {};
  return {
    index: ext.index,
    make: ext.make || part.manufacturer,
    model: part.model,
    type: ext.type,
    rackUnits: `${phys.rack_units}U`,
    portCount: ext.portCount,
    heightInches: in2(phys.height_mm),
    widthInches: in2(phys.width_mm),
    portPitchInches: in2(ext.portPitchMm),
    labelWindowHeightInches: in2(ext.labelWindowHeightMm),
    heightMm: phys.height_mm,
    widthMm: phys.width_mm,
    portPitchMm: ext.portPitchMm,
    labelWindowHeightMm: ext.labelWindowHeightMm,
    stripWidthMm: ext.stripWidthMm,
    datumMm: ext.datumMm,
    retaining: ext.retaining,
    bimId: part.id
  };
}

function finish(parts) {
  return parts.map(partToVendorRow).filter(Boolean)
    .sort((a, b) => a.make.localeCompare(b.make) || (a.index ?? 0) - (b.index ?? 0));
}

async function readLibraryFromDisk() {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const roots = [
    fileURLToPath(new URL(LIBRARY_FROM_HERE, import.meta.url)),
    path.resolve(process.cwd(), 'PODS/POD.database/DATABASE.server.BIM/SRC/library')
  ];
  const root = roots.find(r => fs.existsSync(r));
  if (!root) return null;
  const parts = [];
  for (const maker of fs.readdirSync(root, { withFileTypes: true })) {
    if (!maker.isDirectory() || maker.name.startsWith('.')) continue;
    for (const f of fs.readdirSync(path.join(root, maker.name))) {
      if (!f.endsWith('.bim.json')) continue;
      const text = fs.readFileSync(path.join(root, maker.name, f), 'utf8');
      if (!text.includes('"patch_panel"')) continue;
      parts.push(JSON.parse(text));
    }
  }
  return parts;
}

async function readLibraryOverHttp() {
  const parts = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = `${bimApi()}/parts?class=${encodeURIComponent('Patch Panel')}&full=1&sort=name&limit=${PAGE}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw Object.assign(new Error(`BIM library answered ${res.status} for ${url}`), { ok: false, status: res.status, statusText: res.statusText, url });
    const page = await res.json();
    parts.push(...page.items);
    if (!page.items.length || parts.length >= page.total) break;
  }
  return parts;
}

/**
 * Load the whole patch-panel catalogue (every vendor).
 * The basePath argument is kept for callers that still pass one; it is unused.
 */
export async function loadMasterCatalog(_basePath) {
  if (catalogCache && catalogCache.length > 0) {
    return catalogCache;
  }
  try {
    const parts = (typeof process !== 'undefined' && process.versions?.node && typeof window === 'undefined')
      ? await readLibraryFromDisk()
      : await readLibraryOverHttp();
    catalogCache = finish(parts || []);
    catalogFault = null;
  } catch (e) {
    console.warn('[patchPanelVendorCatalog] the BIM library could not be read', e);
    catalogCache = [];
    catalogFault = e;
  }
  return catalogCache;
}

/** What stopped the last BIM library read (thrown error / HTTP answer), or null. An empty catalogue is retried on the next load. */
export function catalogError() {
  return catalogFault;
}

/**
 * A part picked from the BIM library (📚 Library, ROAD-3572: {bim, ref}) → the row
 * applyHardwareModel takes. The pick carries the block view; the panel geometry
 * (ext.patch_panel) is on the full part, which the ref resolves to on the live
 * library (ref.url /api/bim/parts/<id>), else in this page's catalogue read. A part
 * with no geometry anywhere (the published snapshot) is still placed: its port count
 * and rack units from the block view, the label geometry the generic preset's.
 */
export async function rowForLibraryItem(item, { fetcher = globalThis.fetch, catalog = null } = {}) {
  const bim = item && item.bim;
  if (!bim || !bim.id) return null;
  let row = partToVendorRow(bim);
  const url = item.ref && item.ref.url;
  if (!row && url && /\/api\/bim\/parts\//.test(url) && fetcher) {
    try { const r = await fetcher(url); if (r.ok) row = partToVendorRow(await r.json()); } catch (_) { /* not reachable: the catalogue */ }
  }
  if (!row) {
    const all = catalog || await loadMasterCatalog();
    row = (all || []).find(m => m.bimId === bim.id) || null;
  }
  if (!row) {
    const ports = (bim.ports || []).reduce((n, p) => n + Math.max(1, Number(p.count) || 1), 0) || 24;
    const conn = String(((bim.ports || [])[0] || {}).connector || '');
    row = {
      make: bim.manufacturer || bim.maker || '', model: bim.model || bim.id, portCount: ports,
      rackUnits: `${bim.ru || (bim.physical && bim.physical.rack_units) || 1}U`,
      type: /rj45|ethernet|cat/i.test(conn) ? 'Data' : /bnc/i.test(conn) ? 'Video' : conn ? 'Jack' : 'Panel',
    };
  }
  return Object.assign({}, row, { bimId: bim.id });
}
