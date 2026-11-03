import test from 'node:test';
import assert from 'node:assert/strict';
import { PatchPanelModel } from '../js/patchApp.js';

test('PatchPanelModel initializes pairs and manages normalling and labels', () => {
  const bay = new PatchPanelModel(24);
  assert.equal(bay.pairs.length, 24);

  const p1 = bay.pairs[0];
  assert.equal(p1.channel, 1);
  assert.equal(p1.normalMode, 'half-normal');

  bay.setNormalling(1, 'full-normal');
  assert.equal(bay.pairs[0].normalMode, 'full-normal');

  bay.setLabels(1, 'VOCAL MIC', 'CONSOLE CH 1');
  assert.equal(bay.pairs[0].topLabel, 'VOCAL MIC');
  assert.equal(bay.pairs[0].bottomLabel, 'CONSOLE CH 1');
});
