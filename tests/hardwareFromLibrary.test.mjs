// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* 📚 the panel's hardware is a BIM part (ROAD-3572): a library pick → the panel's row. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rowForLibraryItem } from '../js/patchPanelVendorCatalog.js';

const FULL = { id: 'adc/adc-0014', manufacturer: 'ADC', model: 'ADC-0014', physical: { rack_units: 2, width_mm: 482.6, height_mm: 88.9 },
  ext: { patch_panel: { make: 'ADC', type: 'Jack', portCount: 48, portPitchMm: 8.64, labelWindowHeightMm: 7.87, stripWidthMm: 430, datumMm: 11.96, retaining: 'direct_adhesive', index: 14 } } };
const BLOCK = { id: 'adc/adc-0014', manufacturer: 'ADC', model: 'ADC-0014', ru: 2, ports: [{ group: 'Jack field', connector: 'Jack', count: 48 }] };

test('a live pick: the ref resolves to the full part and its panel geometry', async () => {
  const item = { bim: BLOCK, ref: { part: 'adc/adc-0014', url: 'http://bench:8160/api/bim/parts/adc/adc-0014', rev: 'x' } };
  const row = await rowForLibraryItem(item, { fetcher: async () => ({ ok: true, json: async () => FULL }), catalog: [] });
  assert.equal(row.bimId, 'adc/adc-0014');
  assert.equal(row.portPitchMm, 8.64);
  assert.equal(row.rackUnits, '2U');
});

test('a snapshot pick with no geometry anywhere is still placed from its block view', async () => {
  const item = { bim: BLOCK, ref: { part: 'adc/adc-0014', url: 'https://apk.audio/x/infrastructure.json#adc/adc-0014', rev: 'x' } };
  const row = await rowForLibraryItem(item, { fetcher: null, catalog: [] });
  assert.deepEqual([row.make, row.model, row.portCount, row.rackUnits, row.bimId], ['ADC', 'ADC-0014', 48, '2U', 'adc/adc-0014']);
});
