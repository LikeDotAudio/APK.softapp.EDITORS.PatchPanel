// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3501: the connectors this editor draws are the CAD catalogue's
// (vendor/apk-vocabulary) through config/vocabulary.json symbols — no
// connector list in source, and every symbol has an icon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAD_CONNECTOR_CATALOG, CAD_CONNECTOR_SYMBOLS_SVG, getConnectorMeta } from '../js/cadConnectorSymbols.js';
import { VOCABULARY } from '../js/vocabulary.js';

const V = globalThis.APKVocabulary;
const config = JSON.parse(readFileSync(new URL('../config/vocabulary.json', import.meta.url), 'utf8'));

test('config/vocabulary.json names only what the catalogue has', () => {
  assert.deepEqual(VOCABULARY.problems, []);
  for (const s of config.symbols) if (s.abbreviation) assert.ok(V.connector(s.abbreviation), `${s.id} -> ${s.abbreviation}`);
});

test('each symbol takes its description, group and cutout from the CAD catalogue', () => {
  assert.equal(CAD_CONNECTOR_CATALOG.length, config.symbols.length);
  const xlr = CAD_CONNECTOR_CATALOG.find(c => c.id === 'xlr-f');
  assert.equal(xlr.abbreviation, 'X3S');
  assert.equal(xlr.desc, V.connector('X3S').description);
  assert.equal(xlr.category, 'Audio-XLR');
  assert.equal(xlr.cutout, V.connector('X3S').cutout);
  assert.equal(xlr.footprint.unit, 'mm');                  // datasheet-sourced (ROAD-3492), carried through
  assert.equal(CAD_CONNECTOR_CATALOG.find(c => c.id === 'dsub25').channels, 8);   // A59S: AES59, 8 channels
});

test('every symbol has an icon in the sheet', () => {
  for (const c of CAD_CONNECTOR_CATALOG) assert.match(CAD_CONNECTOR_SYMBOLS_SVG, new RegExp(`<symbol id="cad-icon-${c.id}"`), c.id);
});

test('catalogue abbreviations and older spellings resolve to the symbol', () => {
  assert.equal(getConnectorMeta('X3S').id, 'xlr-f');
  assert.equal(getConnectorMeta('ECON').id, 'ethercon');
  assert.equal(getConnectorMeta('XLR Female').id, 'xlr-f');   // the label a saved port stores
  assert.equal(getConnectorMeta('TT').id, 'bantam-tt');
});

test('no connector list is typed into the app source', () => {
  const src = readFileSync(new URL('../js/cadConnectorSymbols.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /CAD_CONNECTOR_CATALOG\s*=\s*\[/);
  assert.doesNotMatch(src, /"label":\s*"/);
});
