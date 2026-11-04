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
 * Load the master hardware catalog index
 * Works in Node.js (via fs) and in Browser (via fetch)
 */
export async function loadMasterCatalog(basePath = './data/vendors/') {
  if (catalogCache && catalogCache.length > 0) {
    return catalogCache;
  }

  // Node environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.resolve(process.cwd(), 'PODS/POD.THIN/Softapps/EDITORS/EDITORS.PanelBuddy/data/vendors/index.json');
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(raw);
        catalogCache = parsed.models || [];
        return catalogCache;
      }
    } catch (e) {
      // Continue to fetch fallback
    }
  }

  // Browser environment
  if (typeof fetch === 'function') {
    try {
      const url = basePath.endsWith('/') ? `${basePath}index.json` : `${basePath}/index.json`;
      const res = await fetch(url);
      if (res.ok) {
        const parsed = await res.json();
        catalogCache = parsed.models || [];
        return catalogCache;
      }
    } catch (e) {
      console.warn('[patchPanelVendorCatalog] fetch failed, attempting vendor individual load', e);
    }
  }

  return catalogCache || [];
}

/**
 * Load models for a specific vendor
 */
export async function loadVendorModels(vendorName, basePath = './data/vendors/') {
  const normKey = vendorName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  const fileKey = VENDOR_KEY_MAP[normKey] || vendorName.replace(/\s+/g, '_');

  if (vendorCache.has(fileKey)) {
    return vendorCache.get(fileKey);
  }

  // If master is already loaded, filter from master
  if (catalogCache && catalogCache.length > 0) {
    const filtered = catalogCache.filter(m => m.make.toLowerCase() === vendorName.toLowerCase() || m.make.toLowerCase() === normKey);
    if (filtered.length > 0) {
      vendorCache.set(fileKey, filtered);
      return filtered;
    }
  }

  // Node environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const fullPath = path.resolve(process.cwd(), `PODS/POD.THIN/Softapps/EDITORS/EDITORS.PanelBuddy/data/vendors/${fileKey}.json`);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const list = JSON.parse(raw);
        vendorCache.set(fileKey, list);
        return list;
      }
    } catch (e) {
      // Fall through
    }
  }

  // Browser fetch
  if (typeof fetch === 'function') {
    try {
      const url = `${basePath.replace(/\/$/, '')}/${fileKey}.json`;
      const res = await fetch(url);
      if (res.ok) {
        const list = await res.json();
        vendorCache.set(fileKey, list);
        return list;
      }
    } catch (e) {
      console.warn(`[patchPanelVendorCatalog] Could not load vendor file for ${vendorName}`, e);
    }
  }

  return [];
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
