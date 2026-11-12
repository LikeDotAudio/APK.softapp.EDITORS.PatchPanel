// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3783: a connector dropped from the palette onto a port saves the symbol's
// label in both panel editors (PanelBuddy and PatchPanel), the word the table,
// the IFC port words and the CSV read; a panel PatchPanel saved with the
// symbol's id instead reads back as the label. Drives the app's OWN
// renderPreview drop listener with a one-port stage (no DOM).

import test from 'node:test';
import assert from 'node:assert/strict';
import { PanelBuddyApp } from '../js/panelBuddyApp.js';
import { getConnectorMeta, savedConnector } from '../js/cadConnectorSymbols.js';

function fakePort(index) {
  const on = {};
  return {
    on,
    dataset: { portIndex: String(index) },
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(type, fn) { on[type] = fn; },
  };
}

function headlessApp() {
  const app = Object.create(PanelBuddyApp.prototype);
  app.panel = { id: 'p', name: 'P-1', room: 'R', formFactor: 'rack', hardwareType: '', portsPerRow: 2, rackUnits: 1,
    ports: [{ portNumber: 1, label: 'A', connector: 'XLR-F' }, { portNumber: 2, label: 'B', connector: 'XLR-F' }] };
  app.tableMode = 'linear';
  app.viewMode = 'front';
  app.zoom = 1;
  app.selectedPortIndex = 0;
  const port = fakePort(1);
  app.previewStage = { innerHTML: '', classList: { toggle() {} }, querySelectorAll: (q) => (q === '.cad-panel-port' ? [port] : []) };
  for (const k of ['render', 'updateChipsState', 'setupConnectorPalette', 'renderBatchButtons', 'changed', 'selectPort', 'applyZoom']) app[k] = () => {};
  app.renderView = () => ({ svg: '' });
  return { app, port };
}

const drop = (port, payload) => port.on.drop({
  preventDefault() {},
  dataTransfer: { getData: () => JSON.stringify(payload) },
});

test('a palette drop keeps the symbol label on the port, not its id', () => {
  const { app, port } = headlessApp();
  app.renderPreview();
  assert.equal(typeof port.on.drop, 'function', 'renderPreview wires a drop on each port');
  drop(port, { type: 'CONNECTOR_PALETTE_ITEM', connectorId: 'bnc' });
  assert.equal(app.panel.ports[1].connector, getConnectorMeta('bnc').label);
  assert.equal(app.panel.ports[1].connector, 'BNC Coax');
  assert.equal(app.toBlock().ports[1].connector, 'BNC Coax');
});

test('a panel saved with the symbol id reads back as its label; every other word is kept', () => {
  const { app } = headlessApp();
  app.handleBlockLoaded({ type: 'panel', id: 'q', name: 'Q', ports: [
    { portNumber: 1, label: 'A', connector: 'bnc' },
    { portNumber: 2, label: 'B', connector: 'XLR Female' },
    { portNumber: 3, label: 'C', connector: 'XLR-F' },
    { portNumber: 4, label: 'D', connector: 'Jack' },
    { portNumber: 5, label: 'E' },
  ] }, {});
  assert.deepEqual(app.panel.ports.map(p => p.connector), ['BNC Coax', 'XLR Female', 'XLR-F', 'Jack', 'XLR-F']);
  assert.equal(savedConnector('bantam-tt'), 'TT Bantam');
  assert.equal(savedConnector('TT Bantam'), 'TT Bantam');
});
