/**
 * Patch Panel Vendor Catalog & Hardware Geometry Index
 *
 * Index of 2,174 verified patch panel and patchbay models across 15 manufacturers:
 * ADC, Argosy, Audio Accessories, Bittree, Canare, Canford, CommScope, Leviton,
 * Neutrik, Panduit, Pinanson, Signex, Switchcraft, Tripp Lite, Van Damme.
 *
 * Provides exact physical pitch (P), window height (H), rack units, datum offset (X0),
 * and chassis retaining mechanisms for 1:1 CAD panel visualizer and label maker.
 */

export const VENDORS = [
  'ADC',
  'Argosy',
  'Audio Accessories',
  'Bittree',
  'Canare',
  'Canford',
  'CommScope',
  'Leviton',
  'Neutrik',
  'Panduit',
  'Pinanson',
  'Signex',
  'Switchcraft',
  'Tripp Lite',
  'Van Damme'
];

export const VENDOR_KEY_MAP = {
  'adc': 'ADC',
  'argosy': 'Argosy',
  'audio accessories': 'Audio_Accessories',
  'audio_accessories': 'Audio_Accessories',
  'bittree': 'Bittree',
  'canare': 'Canare',
  'canford': 'Canford',
  'commscope': 'CommScope',
  'leviton': 'Leviton',
  'neutrik': 'Neutrik',
  'panduit': 'Panduit',
  'pinanson': 'Pinanson',
  'signex': 'Signex',
  'switchcraft': 'Switchcraft',
  'tripp lite': 'Tripp_Lite',
  'tripp_lite': 'Tripp_Lite',
  'van damme': 'Van_Damme',
  'van_damme': 'Van_Damme'
};

// Internal model cache
let catalogCache = null;
let catalogFault = null; // what stopped the last read of the BIM library, or null
let vendorCache = new Map();

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
 * Load models for a specific vendor (filtered from the master catalogue).
 */
export async function loadVendorModels(vendorName, _basePath) {
  const normKey = vendorName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const fileKey = VENDOR_KEY_MAP[normKey] || vendorName.replace(/\s+/g, '_');
  if (vendorCache.has(fileKey)) {
    return vendorCache.get(fileKey);
  }
  const all = await loadMasterCatalog();
  const want = vendorName.toLowerCase();
  const list = all.filter(m => m.make.toLowerCase() === want || m.make.toLowerCase() === normKey);
  vendorCache.set(fileKey, list);
  return list;
}

/**
 * Get available vendor names
 */
export function getVendors() {
  return [...VENDORS];
}

/**
 * Search the catalog with optional filters
 */
export function searchModels(models, { query = '', vendor = '', rackUnits = '', portCount = null, type = '', limit = 100 } = {}) {
  if (!Array.isArray(models)) return [];

  const q = query.trim().toLowerCase();
  const v = vendor.trim().toLowerCase();
  const ru = rackUnits.trim().toUpperCase();
  const t = type.trim().toLowerCase();
  const pc = portCount ? Number(portCount) : null;

  const results = [];
  for (const m of models) {
    if (v && m.make.toLowerCase() !== v) continue;
    if (ru && m.rackUnits.toUpperCase() !== ru) continue;
    if (pc && Number(m.portCount) !== pc) continue;
    if (t && m.type.toLowerCase() !== t) continue;

    if (q) {
      const match =
        m.model.toLowerCase().includes(q) ||
        m.make.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        String(m.portCount).includes(q) ||
        String(m.rackUnits).toLowerCase().includes(q);
      if (!match) continue;
    }

    results.push(m);
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Find model by exact model code or index
 */
export function findModel(models, identifier) {
  if (!Array.isArray(models)) return null;
  const idStr = String(identifier).trim().toLowerCase();
  return models.find(m =>
    String(m.index) === idStr ||
    m.model.toLowerCase() === idStr ||
    `${m.make} ${m.model}`.toLowerCase() === idStr
  ) || null;
}
