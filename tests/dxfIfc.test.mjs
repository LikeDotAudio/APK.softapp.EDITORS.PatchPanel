// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* ROAD-3598 answer 2: Export DXF is still the fabrication drawing, Export IFC sits beside it,
   and the DXF carries every object of the panel's .ifc twin on the hidden APK_IFC layer
   (apk-ifc-dxf/1, vendor/apk-contracts/apk-ifc-dxf.js). PANEL_DXF_OUT=<dir> writes both
   files there, for ezdxf and IfcOpenShell. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateCadPanelDxf } from '../js/cadDxfGenerator.js';
import { downloadPanelIfc, ifcFileName } from '../js/cadLikeAudioBridge.js';
import { panelToIfc } from '../js/panelIfc.js';
import { IFC_DXF_LAYER, ifcDxfBlobs, readIfcDxf } from '../vendor/apk-contracts/apk-ifc-dxf.js';

const panel = {
  id: 'pb-test-1', name: 'Stage Left', type: 'patch_panel', rackUnits: 2, portsPerRow: 4, hardwareType: 'TT bantam',
  ports: Array.from({ length: 8 }, (_, i) => ({ portNumber: i + 1, label: `CH ${i + 1}`, normalling: 'half' })),
};
const ifc = panelToIfc(panel, { name: 'panel_stage_left' });

test('without the model the DXF is what it always was', () => {
  const plain = generateCadPanelDxf(panel);
  assert.equal(generateCadPanelDxf(panel, {}), plain);
  assert.ok(!plain.includes(IFC_DXF_LAYER));
});

test('with it, every object of the .ifc twin reads back out of the DXF', () => {
  const plain = generateCadPanelDxf(panel);
  const dxf = generateCadPanelDxf(panel, { ifc });
  const back = readIfcDxf(dxf);
  const want = ifcDxfBlobs(ifc);
  assert.ok(want.length >= 10, 'the panel, its jacks, the spine');
  assert.deepEqual(back.map((b) => b.guid), want.map((b) => b.guid));
  for (const b of back) assert.ok(ifc.includes(b.step), b.guid);
  assert.ok(back.some((b) => b.ifc === 'IFCDISTRIBUTIONBOARD'));
  assert.equal(back.filter((b) => b.ifc === 'IFCDISTRIBUTIONPORT').length >= panel.ports.length, true);
  // the drawing a reader that ignores the layer sees: the same ENTITIES, plus POINTs on APK_IFC only
  const ents = (t) => t.slice(t.indexOf('ENTITIES\n')).split(/(?=^  0\n)/m).filter((e) => !e.includes(`  8\n${IFC_DXF_LAYER}\n`));
  assert.deepEqual(ents(dxf), ents(plain));
  assert.match(dxf, /  2\nAPK_IFC\n 70\n1\n 62\n-8\n/);
  if (process.env.PANEL_DXF_OUT) {
    mkdirSync(process.env.PANEL_DXF_OUT, { recursive: true });
    writeFileSync(join(process.env.PANEL_DXF_OUT, 'panel.dxf'), dxf);
    writeFileSync(join(process.env.PANEL_DXF_OUT, 'panel.ifc'), ifc);
  }
});

test('Export IFC writes the twin beside the DXF', () => {
  const clicked = [];
  const doc = { createElement: () => ({ click() { clicked.push(this.download); } }), body: { appendChild() {}, removeChild() {} } };
  const win = { document: doc, Blob: class { constructor(parts, o) { this.text = parts.join(''); this.type = o.type; } }, URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} } };
  const r = downloadPanelIfc(panel, ifc, null, win);
  assert.equal(r.fileName, 'Stage_Left_fabrication.ifc');
  assert.equal(ifcFileName(panel), r.fileName);
  assert.deepEqual(clicked, ['Stage_Left_fabrication.ifc']);
});
