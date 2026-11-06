// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3583: the panel's .ifc twin (js/panelIfc.js) — written byte-deterministically, read back to the same
// block. IFC_OUT=<dir> npm test also writes the files there, for IfcOpenShell validate + the BIM oracle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { panelToIfc, panelFromIfc, connectorWords, endpointOf, systemTypeOf, schemaOf } from '../js/panelIfc.js';

function out(name, text) {
  if (!process.env.IFC_OUT) return;
  mkdirSync(process.env.IFC_OUT, { recursive: true });
  writeFileSync(join(process.env.IFC_OUT, name), text);
}

const PAIRED = {
  type: 'patch_panel', id: 'pp9', name: 'PP-9', room: 'MDF / RACK-01 · U14', formFactor: 'rack', hardwareType: 'patchbay-tt',
  portsPerRow: 2, rackUnits: 1, pairCount: 2,
  bimId: 'neutrik/nys-spp-l1', hardwareName: 'Neutrik NYS-SPP-L1',
  ports: [
    { portNumber: 1, label: 'PRE 1', endpoint: 'MIC-PRE-01 / OUT-1', signal: 'Analog Audio', connector: 'TT-Bantam', normalling: 'full' },
    { portNumber: 2, label: 'PRE 2', endpoint: 'MIC-PRE-01 / OUT-2', signal: 'Analog Audio', connector: 'TT-Bantam', normalling: 'half' },
    { portNumber: 3, label: 'DAW 1', endpoint: 'INTERFACE / IN-1', signal: 'Analog Audio', connector: 'TT-Bantam', normalling: 'full' },
    { portNumber: 4, label: 'DAW 2', endpoint: 'INTERFACE / IN-1', signal: 'Analog Audio', connector: 'TT-Bantam', normalling: 'half' },
  ],
};

const LINEAR = {
  type: 'panel', id: 'wp1', name: 'WP-STAGE-L', room: '', formFactor: 'wallplate', portsPerRow: 4, rackUnits: 1,
  ports: [
    { portNumber: 1, label: 'MIC 1', endpoint: 'STAGE / BOX-01', signal: 'Analog Audio', connector: 'XLR-F' },
    { portNumber: 2, label: 'LAN', endpoint: 'SW-01 / ge-0/0/3', signal: 'Dante', connector: 'EtherCON' },
    { portNumber: 3, label: 'SDI', endpoint: '', signal: '12G-SDI', connector: 'BNC Coax' },
    { portNumber: 4, label: 'spare', endpoint: '', signal: 'Analog Audio', connector: 'Blank Plate' },
  ],
};

const strip = (block) => block.ports.map(({ portNumber, label, endpoint, signal, connector, normalling }) =>
  ({ portNumber, label, endpoint, signal, connector, ...(normalling ? { normalling } : {}) }));

test('a paired patchbay: the same panel writes the same bytes, and reads back to the same block', () => {
  const a = panelToIfc(PAIRED, { name: 'panel_pp_9' });
  assert.equal(a, panelToIfc(JSON.parse(JSON.stringify(PAIRED)), { name: 'panel_pp_9' }));
  assert.match(a, /^ISO-10303-21;/);
  assert.equal(schemaOf(a), 'IFC4X3_ADD2');
  assert.match(a, /IFCDISTRIBUTIONBOARD\('[^']+',#\d+,'PP-9',\$,\$,#\d+,\$,'pp9',\.DISTRIBUTIONFRAME\.\)/);
  assert.match(a, /IFCDISTRIBUTIONBOARDTYPE\('[^']+',#\d+,'Neutrik NYS-SPP-L1'/);
  assert.match(a, /'PortCapacity',\$,IFCINTEGER\(4\)/);
  assert.match(a, /IFCSPACE\('[^']+',#\d+,'MDF \/ RACK-01 \\X2\\00B7\\X0\\ U14'/);
  assert.equal((a.match(/IFCRELCONNECTSPORTS\(/g) || []).length, 4);
  out('panel-paired.ifc', a);
  const b = panelFromIfc(a);
  assert.equal(b.type, 'patch_panel');
  assert.equal(b.id, 'pp9');
  assert.equal(b.name, 'PP-9');
  assert.equal(b.room, PAIRED.room);
  assert.equal(b.formFactor, 'rack');
  assert.equal(b.hardwareType, 'patchbay-tt');
  assert.equal(b.portsPerRow, 2);
  assert.equal(b.rackUnits, 1);
  assert.equal(b.bimId, 'neutrik/nys-spp-l1');
  assert.equal(b.hardwareName, 'Neutrik NYS-SPP-L1');
  assert.deepEqual(strip(b), strip(PAIRED));
  assert.deepEqual(b.pairs.map((p) => [p.topLabel, p.bottomLabel, p.normalling]), [['PRE 1', 'DAW 1', 'full'], ['PRE 2', 'DAW 2', 'half']]);
  assert.equal(panelToIfc(b, { name: 'panel_pp_9' }), a, 'read and written again: the same file');
});

test('two ports landing on one far port: the second gets its own far port, folded back on read', () => {
  const a = panelToIfc(PAIRED, { name: 'p' });
  assert.match(a, /IFCDISTRIBUTIONPORT\('[^']+',#\d+,'IN-1 \/ 4'/);
  assert.match(a, /'FansOutOf',\$,IFCIDENTIFIER\('port:IN-1'\)/);
  assert.equal(panelFromIfc(a).ports[3].endpoint, 'INTERFACE / IN-1');
});

test('a wall plate: an IfcOutlet AUDIOVISUALOUTLET; connectors as ISO words; a blank has no connector', () => {
  const a = panelToIfc(LINEAR, { name: 'panel_wp_stage_l' });
  out('panel-wallplate.ifc', a);
  assert.match(a, /IFCOUTLET\('[^']+',#\d+,'WP-STAGE-L',\$,\$,#\d+,\$,'wp1',\.AUDIOVISUALOUTLET\.\)/);
  assert.match(a, /IFCOUTLETTYPE\('[^']+',#\d+,'Wall plate'/);
  assert.doesNotMatch(a, /IFCSPACE\(/, 'no room, no space');
  assert.match(a, /'Protocols',\$,\(IFCIDENTIFIER\('Dante'\)\)/);
  const b = panelFromIfc(a);
  assert.equal(b.type, 'panel');
  assert.equal(b.formFactor, 'wallplate');
  assert.equal(b.pairs, undefined);
  assert.deepEqual(strip(b), strip(LINEAR));
});

test('the vocabulary helpers', () => {
  assert.deepEqual(connectorWords('XLR-F'), { type: 'XLR', gender: 'FEMALE', subtype: 'XLR-F' });
  assert.deepEqual(connectorWords('XLR Male'), { type: 'XLR', gender: 'MALE', subtype: 'XLR Male' });
  assert.equal(connectorWords('TT Bantam').type, 'TRS');
  assert.equal(connectorWords('EtherCON').type, 'RJ');
  assert.equal(connectorWords('SpeakON').type, 'OTHER');
  assert.equal(connectorWords('PowerCON').type, 'ACPLUG');
  assert.equal(connectorWords('Blank Plate'), null);
  assert.deepEqual(endpointOf('A / B / C'), { device: 'A', port: 'B / C' });
  assert.deepEqual(endpointOf('STAGE'), { device: 'STAGE', port: '' });
  assert.equal(systemTypeOf('12G-SDI'), 'AUDIOVISUAL');
  assert.equal(systemTypeOf('Cat6A'), 'DATA');
});

test('not a panel: a sentence, never a half-read block', () => {
  const a = panelToIfc(LINEAR, { name: 'x' }).replace(/IFCOUTLET\(/, 'IFCFURNITURE(');
  assert.throws(() => panelFromIfc(a), /no patch panel in this IFC/);
});
