// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3486: the panel block in and out over cad.like.audio/host@1 through the
// vendored apk-softapp client, driving the app's OWN handleBlockLoaded /
// toBlock / saveBlock (no DOM: the renderers are stubbed); the paired-table
// model; the DXF hand-over to a popped-out CAD on its `ready`, once.

import test from 'node:test';
import assert from 'node:assert/strict';
import { world, ORIGIN } from './softappWorld.mjs';
import { PanelBuddyApp } from '../js/panelBuddyApp.js';
import { panelToIfc, panelFromIfc } from '../js/panelIfc.js';
import { pairedRows, applyPairedEdit, fillEndpointsFromThings } from '../js/portTables.js';
import { openInCadLikeAudio, CAD_HOST_PROTOCOL } from '../js/cadLikeAudioBridge.js';

const P = 'cad.like.audio/host@1';
const BLOCK = {
  type: 'patch_panel', id: 'pp9', name: 'PP-9', portsPerRow: 2, rackUnits: 1,
  pairs: [{ ch: 1, topLabel: 'A1', bottomLabel: 'B1', normalling: 'full' }, { ch: 2, topLabel: 'A2', bottomLabel: 'B2' }],
};

/** The app's own methods on a panel with no page around it. */
function headlessApp(w) {
  const app = Object.create(PanelBuddyApp.prototype);
  app.panel = { id: 'x', name: 'PP-AUDIO-01', room: 'R', formFactor: 'rack', portsPerRow: 24, rackUnits: 2, ports: [] };
  app.tableMode = 'paired';
  app.selectedPortIndex = 0;
  for (const k of ['render', 'renderPreview', 'updateChipsState', 'setupConnectorPalette', 'renderBatchButtons']) app[k] = () => {};
  app.host = w.S.connectHost({
    editor: 'Panel Buddy',
    blockType: 'panel',
    onLoad: (block, meta) => app.handleBlockLoaded(block, meta),
    onRequest: () => ({ block: app.toBlock(), meta: app.blockMeta() }),
  });
  return app;
}

test('in the CAD: editorReady, load, an edit, request → blockSave with the edited panel, to our origin only', () => {
  const w = world();
  const app = headlessApp(w);
  assert.equal(w.toParent[0].m.type, 'editorReady');
  assert.equal(w.toParent[0].o, ORIGIN);
  w.fire({ protocol: P, type: 'load', block: BLOCK, meta: { blockName: 'PP-9' } });
  assert.equal(app.panel.name, 'PP-9');
  assert.equal(app.panel.ports.length, 4);
  const rows = pairedRows(app.panel);
  assert.ok(applyPairedEdit(app.panel, rows[1], 'bottomEndpoint', 'DAW / IN-2'));   // an edit in the paired table
  w.fire({ protocol: P, type: 'request' });
  const save = w.toParent.at(-1);
  assert.equal(save.m.type, 'blockSave');
  assert.equal(save.o, ORIGIN);
  assert.equal(save.m.block.name, 'PP-9');
  assert.equal(save.m.block.pairs[1].bottomEndpoint, 'DAW / IN-2');
  assert.equal(save.m.block.pairs[0].normalling, 'full');
  assert.equal(save.m.meta.filename, 'panel_pp_9');
  assert.equal(w.downloads.length, 0, 'no download when the CAD holds the block');
});

test('a stranger, or the old private APK_LOAD_BLOCK, changes nothing', () => {
  const w = world();
  const app = headlessApp(w);
  w.fire({ protocol: P, type: 'load', block: BLOCK }, { source: {} });
  w.fire({ protocol: P, type: 'load', block: BLOCK }, { origin: 'http://evil' });
  w.fire({ type: 'APK_LOAD_BLOCK', block: BLOCK });
  assert.equal(app.panel.name, 'PP-AUDIO-01');
});

test('standalone: Save is Save Model — the panel .json AND its .ifc twin, the .ifc first', async () => {
  const w = world({ framed: false });
  globalThis.window = w.win;   // the app reads window.APKSoftapp
  try {
    const app = headlessApp(w);
    app.handleBlockLoaded(BLOCK, {});
    assert.equal(await app.saveBlock(), 'download');
    assert.deepEqual(w.downloads.map((d) => d.name), ['panel_pp_9.ifc', 'panel_pp_9.json']);
    const block = JSON.parse(w.downloads[1].text);
    assert.equal(block.pairs.length, 2);
    assert.equal(w.downloads[0].text, panelToIfc(block, { name: 'panel_pp_9' }));
    assert.equal(panelFromIfc(w.downloads[0].text).pairs[0].normalling, 'full');
  } finally {
    delete globalThis.window;
  }
});

test('paired rows: both rows exist, normalling edits land on both ports', () => {
  const panel = { portsPerRow: 3, ports: [] };
  const rows = pairedRows(panel);
  assert.equal(panel.ports.length, 6);
  assert.deepEqual(rows.map((r) => [r.topIdx, r.botIdx]), [[0, 3], [1, 4], [2, 5]]);
  applyPairedEdit(panel, rows[2], 'normalling', 'parallel');
  assert.equal(panel.ports[2].normalling, 'parallel');
  assert.equal(panel.ports[5].normalMode, 'parallel');
  assert.equal(applyPairedEdit(panel, rows[0], 'ch', 9), false, 'the channel number is not editable');
});

test('discovered endpoints: empty ones only, by MAC/serial, never a thing with only an IP', () => {
  const ports = [{ endpoint: '' }, { endpoint: 'KEEP' }, { endpoint: '' }, { endpoint: '' }];
  const things = [{ ips: ['10.0.0.9'] }, { mac: 'aa:bb:cc:dd:ee:01', name: 'amp-L' }, { serial: 'SN-2', vendor: 'ACME', model: 'X' }];
  assert.equal(fillEndpointsFromThings(ports, things), 2);
  assert.deepEqual(ports.map((p) => p.endpoint), ['amp-L', 'KEEP', 'ACME X', '']);
  assert.equal(ports[0].endpointId, 'aa:bb:cc:dd:ee:01');
  assert.equal(fillEndpointsFromThings(ports, things), 0, 'already wired things are not used twice');
});

test('Open in CAD: the DXF goes once, on the CAD window\'s own ready, at our origin; no timers', () => {
  const listeners = [];
  const posted = [];
  const cadWin = { postMessage: (m, o) => posted.push({ m, o }) };
  const win = {
    location: { href: 'http://bench:8080/apps/EDITORS.PatchPanel/index.html', origin: 'http://bench:8080' },
    addEventListener: (t, fn) => listeners.push(fn),
    removeEventListener: (t, fn) => listeners.splice(listeners.indexOf(fn), 1),
    open: (url) => { win.opened = url; return cadWin; },
    File: class { constructor(parts, name, o) { this.name = name; this.text = parts.join(''); this.type = o.type; } },
    setTimeout: () => { throw new Error('no timers'); },
  };
  const fire = (data, source = cadWin, origin = 'http://bench:8080') => listeners.slice().forEach((fn) => fn({ data, source, origin }));
  const r = openInCadLikeAudio({ name: 'PP 1', formFactor: 'rack', rackUnits: 1, portsPerRow: 2, ports: [] }, { win });
  assert.match(win.opened, /EDITORS\.CAD\.Like\.audio\/dist\/index\.html#\/drawing\?host=panel$/);
  assert.equal(listeners.length, 1, 'listening before the window could say ready');
  fire({ protocol: CAD_HOST_PROTOCOL, type: 'ready' }, {});                     // another window
  fire({ protocol: CAD_HOST_PROTOCOL, type: 'ready' }, cadWin, 'http://evil');  // another origin
  fire({ type: 'ready' });                                                       // no protocol
  assert.equal(posted.length, 0);
  fire({ protocol: CAD_HOST_PROTOCOL, type: 'ready' });
  fire({ protocol: CAD_HOST_PROTOCOL, type: 'ready' });
  assert.equal(posted.length, 1, 'one floorplan, no resend');
  assert.equal(posted[0].o, 'http://bench:8080');
  assert.equal(posted[0].m.type, 'floorplan');
  assert.equal(posted[0].m.file.name, 'PP_1_fabrication.dxf');
  assert.match(posted[0].m.file.text, /SECTION/);
  assert.ok(r.sent());
  assert.equal(listeners.length, 0);
});
