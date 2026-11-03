// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import test from 'node:test';
import assert from 'node:assert/strict';

import { PatchPanelModel, NORMAL_TYPES } from '../js/patchModel.js';

test('Patch Panel Model Pair Generation', () => {
  const model = new PatchPanelModel(24);
  assert.equal(model.pairs.length, 24);
  assert.equal(model.pairs[0].ch, 1);
  assert.ok(model.pairs[0].topLabel);
  assert.ok(model.pairs[0].bottomLabel);
});

test('Normalling Types', () => {
  assert.ok(NORMAL_TYPES.length >= 4);
  const full = NORMAL_TYPES.find(n => n.id === 'full');
  const half = NORMAL_TYPES.find(n => n.id === 'half');
  assert.ok(full);
  assert.ok(half);
});
