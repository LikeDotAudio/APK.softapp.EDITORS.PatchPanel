// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* panelIfc.js — THE PANEL'S .IFC TWIN (ROAD-3583). Save Model writes the native panel block (toBlock)
   AND this IFC4X3_ADD2 file through APKSoftapp.saveModel; Open Model reads it back to the same block.
   The same bytes in EDITORS.PanelBuddy and EDITORS.PatchPanel (one panel, two pages): change them together.
   Written with the contracts STEP codec (vendor/apk-contracts/apk-ifc.js, scripts/vendor-ifc.mjs), no
   IfcOpenShell in the page. Byte-deterministic: the same panel writes the same file.

     IfcProject ─ IfcSite ─ IfcBuilding ─ IfcBuildingStorey 'Panels' ─ IfcSpace (the panel's room)   units: mm
     the panel   rack       IfcDistributionBoard DISTRIBUTIONFRAME (Tag = the panel id), typed by an
                            IfcDistributionBoardType DISTRIBUTIONFRAME + Pset_DistributionBoardTypeDistributionFrame
                            .PortCapacity; APK_AVDevice.RackUnits
                 wallplate  IfcOutlet AUDIOVISUALOUTLET, typed by an IfcOutletType AUDIOVISUALOUTLET
                 the type   Name = the hardware picked from the BIM library (its GlobalId part/<id> and
                            APK_Part.PartId when one was), else the hardware word
                 APK_Panel  FormFactor, Layout (paired | linear), PortsPerRow, HardwareType
     a port      IfcDistributionPort CABLE nested in panel order (IfcRelNests), Name = its label,
                 Description = its signal, SystemType from the signal, FlowDirection SOURCEANDSINK (a jack);
                 Pset_DistributionPortTypeCable ElectricalConnectionType / ConnectionGender / ConnectionSubtype
                 from the connector, Protocols for a network signal; APK_Terminal TerminalId (port #),
                 Connector (as the panel names it), Group (top | bottom in a paired panel), Normalling
     its endpoint 'DEV / PORT': an IfcDistributionElement Name = DEV with an IfcDistributionPort Name = PORT,
                 joined to the panel port by ONE IfcRelConnectsPorts (panel port relating). A far port ends one
                 connection: a second panel port landing on the same 'DEV / PORT' gets its own far port
                 '<PORT> / <port #>' with APK_Terminal.FansOutOf, which the reader folds back.
   Everything here is ISO 16739 or an APK_ set declared in DATABASE.server.BIM SRC/tools/ifc
   (apk_psets.py + apk_psets_editors.py). The block's pairs are derived from its ports and are not written. */

import { entitiesByType, enumv, getPsets, ifcGuid, isRef, parseStep, real, ref, typed, unwrap, writeStep } from '../vendor/apk-contracts/apk-ifc.js';

export const PANEL_IFC_SCHEMA = 'IFC4X3_ADD2';
const STAMP = '1970-01-01T00:00:00';   // fixed: the file is a function of the panel, never of the clock

const str = (v) => (v == null ? '' : String(v));
const label = (s) => typed('IFCLABEL', String(s));
const ident = (s) => typed('IFCIDENTIFIER', String(s));
const int = (n) => typed('IFCINTEGER', Math.trunc(n));
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/** The IfcDistributionSystemEnum word a signal reads as (the wirelist's rule). */
export function systemTypeOf(text) {
  const t = String(text || '').toLowerCase();
  if (!t) return 'NOTDEFINED';
  if (/earth|ground/.test(t)) return 'EARTHING';
  if (/power|mains|\bac\b|\bdc\b|\bpoe\b/.test(t)) return 'ELECTRICAL';
  if (/network|ethernet|\blan\b|dante|aes67|2110|\bip\b|\bdata\b|cat ?5|cat ?6|fib(er|re)/.test(t)) return 'DATA';
  if (/speaker|loudspeaker|\bpa\b/.test(t)) return 'ELECTROACOUSTIC';
  if (/video|sdi|hdmi|\b(3|6|12)g\b|dvi|displayport|audio|aes|mic|line|analog|madi|adat/.test(t)) return 'AUDIOVISUAL';
  if (/control|rs-?232|rs-?422|rs-?485|gpio|gpi|midi|serial|dmx/.test(t)) return 'CONTROL';
  return 'SIGNAL';
}

/** The transports a network signal names (Pset_DistributionPortTypeCable.Protocols); [] when it names none. */
export function protocolsOf(signal) {
  const t = String(signal || '').toLowerCase();
  const out = [];
  if (/dante/.test(t)) out.push('Dante');
  if (/aes67/.test(t)) out.push('AES67');
  if (/2110/.test(t)) out.push('SMPTE ST 2110');
  if (/\bndi\b/.test(t)) out.push('NDI');
  if (!out.length && /ethernet|\blan\b|cat ?5|cat ?6|network|\bdata\b/.test(t)) out.push('Ethernet');
  return out;
}

/** A connector word → its ISO 16739 port words (Pset_DistributionPortTypeCable). null for a blank (no connector). */
export function connectorWords(connector) {
  const c = String(connector || '').trim();
  if (!c || /^blank/i.test(c)) return null;
  const t = c.toLowerCase();
  let type = 'OTHER';
  if (/powercon|iec|\bac\b|nema|schuko/.test(t)) type = 'ACPLUG';
  else if (/xlr/.test(t)) type = 'XLR';
  else if (/ethercon|rj-?45|\blan\b|8p8c/.test(t)) type = 'RJ';
  else if (/bnc|coax|video (midsize|mini)/.test(t)) type = 'COAXIAL';
  else if (/\btrs\b|\btt\b|tt-|bantam|1\/4|6\.35|long frame|jack/.test(t)) type = 'TRS';
  else if (/hdmi/.test(t)) type = 'HDMI';
  else if (/usb/.test(t)) type = 'USB';
  else if (/\bdb-?\d+|d-?sub/.test(t)) type = 'DSUB';
  else if (/rca|phono/.test(t)) type = 'RCA';
  else if (/\bdvi/.test(t)) type = 'DVI';
  else if (/\bdin\b/.test(t)) type = 'DIN';
  const gender = /female|socket|(^|[-\s])f$/i.test(c) ? 'FEMALE' : /\bmale\b|plug|(^|[-\s])m$/i.test(c) ? 'MALE' : null;
  return { type, gender, subtype: c };
}

/** 'DEV / PORT' → { device, port } (the first ' / ' splits). */
export function endpointOf(text) {
  const s = str(text).trim();
  if (!s) return { device: '', port: '' };
  const at = s.indexOf(' / ');
  return at < 0 ? { device: s, port: '' } : { device: s.slice(0, at), port: s.slice(at + 3) };
}

class Writer {
  constructor() { this.entities = []; }
  add(type, ...args) {
    const id = this.entities.length + 1;
    this.entities.push({ id, type, args });
    return ref(id);
  }
}

const stemOf = (name) => String(name || 'panel').replace(/\.(ifc|json)$/i, '');
const portsOf = (block) => (Array.isArray(block?.ports) ? block.ports : []);
const isPaired = (block) => block?.type === 'patch_panel';

/**
 * The panel block (toBlock) as IFC4X3_ADD2 STEP text. `name` is the file stem; the project GlobalId is
 * uuid5 of panel/<id>, so the same panel saved again keeps every GlobalId.
 */
export function panelToIfc(block, { name } = {}) {
  const b = block || {};
  const ports = portsOf(b);
  const stem = stemOf(name || b.name);
  const panelId = str(b.id) || stem;
  const W = new Writer();
  const P = ifcGuid('panel', panelId);
  const rel = (...roles) => ifcGuid('rel', ...roles);

  // ---- owner, units (mm), context, the spine
  const person = W.add('IFCPERSON', null, 'APK.audio', null, null, null, null, null, null);
  const org = W.add('IFCORGANIZATION', null, 'APK.audio', 'Panel editor', null, null);
  const po = W.add('IFCPERSONANDORGANIZATION', person, org, null);
  const app = W.add('IFCAPPLICATION', org, '1', 'APK.audio panel editor', 'EDITORS.PanelBuddy');
  const oh = W.add('IFCOWNERHISTORY', po, app, null, null, null, null, null, 0);
  const mm = W.add('IFCSIUNIT', { kind: 'derived' }, enumv('LENGTHUNIT'), enumv('MILLI'), enumv('METRE'));
  const units = W.add('IFCUNITASSIGNMENT', [mm]);
  const origin = W.add('IFCAXIS2PLACEMENT3D', W.add('IFCCARTESIANPOINT', [real(0), real(0), real(0)]), null, null);
  const ctx = W.add('IFCGEOMETRICREPRESENTATIONCONTEXT', null, 'Model', 3, real(1e-5), origin, null);
  const project = W.add('IFCPROJECT', P, oh, str(b.name) || stem, 'Panel editor: one patch panel or wall plate', null, null, null, [ctx], units);
  const sitePl = W.add('IFCLOCALPLACEMENT', null, origin);
  const buildingPl = W.add('IFCLOCALPLACEMENT', sitePl, origin);
  const storeyPl = W.add('IFCLOCALPLACEMENT', buildingPl, origin);
  const siteGid = ifcGuid('site', P, 'site');
  const buildingGid = ifcGuid('site', P, 'building');
  const storeyGid = ifcGuid('site', P, 'storey');
  const site = W.add('IFCSITE', siteGid, oh, 'Site', null, null, sitePl, null, null, enumv('ELEMENT'), null, null, null, null, null);
  const building = W.add('IFCBUILDING', buildingGid, oh, 'Building', null, null, buildingPl, null, null, enumv('ELEMENT'), null, null, null);
  const storey = W.add('IFCBUILDINGSTOREY', storeyGid, oh, 'Panels', null, null, storeyPl, null, null, enumv('ELEMENT'), real(0));
  W.add('IFCRELAGGREGATES', rel('aggregates', P), oh, null, null, project, [site]);
  W.add('IFCRELAGGREGATES', rel('aggregates', siteGid), oh, null, null, site, [building]);
  W.add('IFCRELAGGREGATES', rel('aggregates', buildingGid), oh, null, null, building, [storey]);
  let container = storey;
  let containerGid = storeyGid;
  const room = str(b.room).trim();
  if (room) {
    const spaceGid = ifcGuid('site', P, 'space');
    const space = W.add('IFCSPACE', spaceGid, oh, room, null, null, W.add('IFCLOCALPLACEMENT', storeyPl, origin), null, null, enumv('ELEMENT'), enumv('NOTDEFINED'), null);
    W.add('IFCRELAGGREGATES', rel('aggregates', storeyGid), oh, null, null, storey, [space]);
    container = space;
    containerGid = spaceGid;
  }

  const rels = [];
  const prop = (n, v) => (v == null || v === '' ? null : W.add('IFCPROPERTYSINGLEVALUE', n, null, v, null));
  const enumProp = (n, v) => (v ? W.add('IFCPROPERTYENUMERATEDVALUE', n, null, [label(v)], null) : null);
  const listProp = (n, vs) => (vs.length ? W.add('IFCPROPERTYLISTVALUE', n, null, vs, null) : null);
  const pset = (setName, ownerGid, props, owners) => {
    const list = props.filter(Boolean);
    if (!list.length) return null;
    const ps = W.add('IFCPROPERTYSET', ifcGuid('rel', 'pset', ownerGid, setName), oh, setName, null, list);
    if (owners) rels.push({ ps, owners, gid: ifcGuid('rel', 'props', ownerGid, setName) });
    return ps;
  };

  // ---- the type: the picked BIM part, else this panel's own
  const wall = b.formFactor === 'wallplate';
  const partId = str(b.bimId || b.bimRef?.part);
  const typeGid = partId ? ifcGuid('part', partId) : ifcGuid('decl', P, 'type');
  const typeName = str(b.hardwareName) || str(b.hardwareType) || (wall ? 'Wall plate' : 'Patch panel');
  const typeSets = [
    wall ? null : pset('Pset_DistributionBoardTypeDistributionFrame', typeGid, [prop('PortCapacity', int(ports.length))]),
    partId ? pset('APK_Part', typeGid, [prop('PartId', ident(partId))]) : null,
  ].filter(Boolean);
  const type = wall
    ? W.add('IFCOUTLETTYPE', typeGid, oh, typeName, null, null, typeSets.length ? typeSets : null, null, partId || null, null, enumv('AUDIOVISUALOUTLET'))
    : W.add('IFCDISTRIBUTIONBOARDTYPE', typeGid, oh, typeName, null, null, typeSets.length ? typeSets : null, null, partId || null, null, enumv('DISTRIBUTIONFRAME'));
  W.add('IFCRELDECLARES', rel('declares', P), oh, null, null, project, [type]);

  // ---- the panel itself
  const panelGid = ifcGuid('decl', P, 'panel');
  const panelPl = W.add('IFCLOCALPLACEMENT', null, origin);
  const panel = wall
    ? W.add('IFCOUTLET', panelGid, oh, str(b.name) || stem, null, null, panelPl, null, panelId, enumv('AUDIOVISUALOUTLET'))
    : W.add('IFCDISTRIBUTIONBOARD', panelGid, oh, str(b.name) || stem, null, null, panelPl, null, panelId, enumv('DISTRIBUTIONFRAME'));
  W.add('IFCRELDEFINESBYTYPE', rel('type', panelGid), oh, null, null, [panel], type);
  const ru = num(b.rackUnits);
  if (!wall && ru != null && ru > 0) pset('APK_AVDevice', panelGid, [prop('RackUnits', int(ru))], [panel]);
  const perRow = num(b.portsPerRow ?? b.pairCount);
  pset('APK_Panel', panelGid, [
    prop('FormFactor', label(b.formFactor || 'rack')),
    prop('Layout', label(isPaired(b) ? 'paired' : 'linear')),
    perRow != null && perRow > 0 ? prop('PortsPerRow', int(perRow)) : null,
    prop('HardwareType', b.hardwareType ? label(b.hardwareType) : null),
  ], [panel]);

  // ---- its ports, in panel order
  const pairCount = Math.max(1, perRow || Math.ceil(ports.length / 2));
  const panelPorts = [];
  const links = [];
  ports.forEach((p, i) => {
    const n = num(p.portNumber) ?? i + 1;
    const gid = ifcGuid('decl', P, 'port', String(i));
    const words = connectorWords(p.connector);
    const sys = words ? systemTypeOf(p.signal) : 'NOTDEFINED';
    const port = W.add('IFCDISTRIBUTIONPORT', gid, oh, str(p.label) || `P${n}`, p.signal ? str(p.signal) : null, null, null, null,
      enumv('SOURCEANDSINK'), enumv(words ? 'CABLE' : 'NOTDEFINED'), enumv(sys));
    panelPorts.push(port);
    if (words) {
      const protocols = sys === 'DATA' ? protocolsOf(p.signal) : [];
      pset('Pset_DistributionPortTypeCable', gid, [
        enumProp('ElectricalConnectionType', words.type),
        prop('ConnectionSubtype', label(words.subtype)),
        enumProp('ConnectionGender', words.gender),
        listProp('Protocols', protocols.map(ident)),
      ], [port]);
    }
    pset('APK_Terminal', gid, [
      prop('TerminalId', ident(String(n))),
      prop('Connector', p.connector ? label(p.connector) : null),
      isPaired(b) ? prop('Group', label(i < pairCount ? 'top' : 'bottom')) : null,
      prop('Normalling', isPaired(b) && p.normalling ? label(p.normalling) : null),
    ], [port]);
    const end = endpointOf(p.endpoint);
    if (end.device) links.push({ port, gid, end, n });
  });
  const nests = [[panel, panelGid, panelPorts]];

  // ---- the far ends: one device per name, one port per connection
  const devices = new Map();
  for (const { port, gid, end, n } of links) {
    let d = devices.get(end.device);
    if (!d) {
      const dGid = ifcGuid('decl', P, 'device', end.device);
      d = { ref: W.add('IFCDISTRIBUTIONELEMENT', dGid, oh, end.device, null, null, null, null, end.device), gid: dGid, ports: [], used: new Set() };
      devices.set(end.device, d);
    }
    const again = d.used.has(end.port);
    d.used.add(end.port);
    const farName = again ? `${end.port} / ${n}` : end.port;
    const farGid = ifcGuid('decl', P, 'device', end.device, 'port', farName);
    const far = W.add('IFCDISTRIBUTIONPORT', farGid, oh, farName || null, null, null, null, null, enumv('SOURCEANDSINK'), enumv('CABLE'), enumv('NOTDEFINED'));
    if (again) pset('APK_Terminal', farGid, [prop('FansOutOf', ident(`port:${end.port}`))], [far]);
    d.ports.push(far);
    W.add('IFCRELCONNECTSPORTS', rel('connects', gid), oh, null, null, port, far, null);
  }
  for (const d of devices.values()) nests.push([d.ref, d.gid, d.ports]);
  for (const [host, gid, list] of nests) if (list.length) W.add('IFCRELNESTS', rel('nests', gid), oh, null, null, host, list);
  W.add('IFCRELCONTAINEDINSPATIALSTRUCTURE', rel('contains', containerGid), oh, null, null, [panel, ...[...devices.values()].map((d) => d.ref)], container);
  for (const { ps, owners, gid } of rels) W.add('IFCRELDEFINESBYPROPERTIES', gid, oh, null, null, owners, ps);

  return writeStep({
    header: [
      { type: 'FILE_DESCRIPTION', args: [['ViewDefinition [ReferenceView]'], '2;1'] },
      { type: 'FILE_NAME', args: [`${stem}.ifc`, STAMP, ['APK.audio'], ['APK.audio'], 'APK.audio panel editor', 'EDITORS.PanelBuddy', ''] },
      { type: 'FILE_SCHEMA', args: [[PANEL_IFC_SCHEMA]] },
    ],
    entities: W.entities,
  });
}

/* ───────────────────────── reading it back ───────────────────────── */

const flat = (v) => {
  const u = unwrap(v);
  return u && typeof u === 'object' && 'value' in u ? u.value : u;
};

/** The schema an .ifc text declares (FILE_SCHEMA), '' when none. */
export function schemaOf(text) {
  const m = /FILE_SCHEMA\s*\(\s*\(\s*'([^']+)'/i.exec(String(text || ''));
  return m ? m[1] : '';
}

/**
 * An IFC model → the panel block. The panel is the first IfcDistributionBoard DISTRIBUTIONFRAME (else the
 * first IfcOutlet) that carries ports; throws a sentence when the file holds none.
 */
export function panelFromIfc(text) {
  const file = parseStep(String(text));
  const byId = file.byId;
  const get = (v) => (isRef(v) ? byId.get(v.id) : undefined);
  const nestsOf = new Map();
  for (const r of entitiesByType(file, 'IFCRELNESTS')) {
    const host = get(r.args[4]);
    if (host) nestsOf.set(host.id, (r.args[5] || []).map(get).filter(Boolean));
  }
  const portsOn = (e) => (nestsOf.get(e.id) || []).filter((x) => x.type === 'IFCDISTRIBUTIONPORT');
  const candidates = [...entitiesByType(file, 'IFCDISTRIBUTIONBOARD'), ...entitiesByType(file, 'IFCOUTLET')];
  const panel = candidates.find((e) => portsOn(e).length) || candidates[0];
  if (!panel) throw new TypeError('no patch panel in this IFC: it has no IfcDistributionBoard (DISTRIBUTIONFRAME) or IfcOutlet');

  // the far end of each panel port
  const farOf = new Map();
  for (const r of entitiesByType(file, 'IFCRELCONNECTSPORTS')) {
    const a = get(r.args[4]);
    const z = get(r.args[5]);
    if (a && z) { farOf.set(a.id, z); farOf.set(z.id, a); }
  }
  const hostOf = new Map();
  for (const [host, list] of nestsOf) for (const p of list) hostOf.set(p.id, byId.get(host));
  let room = '';
  for (const r of entitiesByType(file, 'IFCRELCONTAINEDINSPATIALSTRUCTURE')) {
    if ((r.args[4] || []).some((x) => isRef(x) && x.id === panel.id)) {
      const s = get(r.args[5]);
      if (s && s.type === 'IFCSPACE') room = str(s.args[2]);
    }
  }
  let type = null;
  for (const r of entitiesByType(file, 'IFCRELDEFINESBYTYPE')) {
    if ((r.args[4] || []).some((x) => isRef(x) && x.id === panel.id)) type = get(r.args[5]);
  }
  const psets = getPsets(file, panel);
  const info = psets.APK_Panel || {};
  const typeSets = type ? getPsets(file, type) : {};
  const partId = str(flat(typeSets.APK_Part?.PartId));
  const paired = flat(info.Layout) === 'paired';
  const ports = portsOn(panel).map((port, i) => {
    const ps = getPsets(file, port);
    const t = ps.APK_Terminal || {};
    const far = farOf.get(port.id);
    let endpoint = '';
    if (far) {
      const dev = hostOf.get(far.id);
      const fan = str(flat(getPsets(file, far).APK_Terminal?.FansOutOf));
      const farPort = fan.startsWith('port:') ? fan.slice(5) : str(far.args[2]);
      const device = dev ? str(dev.args[2]) : '';
      endpoint = farPort ? `${device} / ${farPort}` : device;
    }
    const n = num(flat(t.TerminalId));
    const out = {
      portNumber: n ?? i + 1,
      label: str(port.args[2]),
      endpoint,
      signal: str(port.args[3]),
      connector: str(flat(t.Connector)) || str(flat(ps.Pset_DistributionPortTypeCable?.ConnectionSubtype)),
    };
    const normal = str(flat(t.Normalling));
    if (normal) out.normalling = normal;
    return out;
  });
  const perRow = num(flat(info.PortsPerRow));
  const ru = num(flat(psets.APK_AVDevice?.RackUnits));
  const block = {
    type: paired ? 'patch_panel' : 'panel',
    id: str(panel.args[7]),
    name: str(panel.args[2]),
    room,
    formFactor: str(flat(info.FormFactor)) || (panel.type === 'IFCOUTLET' ? 'wallplate' : 'rack'),
    hardwareType: str(flat(info.HardwareType)),
    portsPerRow: perRow ?? Math.ceil(ports.length / (paired ? 2 : 1)),
    rackUnits: ru ?? 1,
    pairCount: perRow ?? Math.ceil(ports.length / 2),
    ports,
  };
  if (paired) block.pairs = pairsOf(ports, block.portsPerRow);
  if (partId) { block.bimId = partId; block.hardwareName = type ? str(type.args[2]) : ''; }
  return block;
}

/** The pairs of a paired panel: port i over port i + pairCount (PanelBuddyApp.getPairs). */
export function pairsOf(ports, portsPerRow) {
  const pairCount = Math.max(1, portsPerRow || Math.ceil(ports.length / 2));
  const pairs = [];
  for (let ch = 1; ch <= pairCount; ch++) {
    const top = ports[ch - 1];
    const bot = ports[ch - 1 + pairCount];
    pairs.push({
      ch,
      channel: ch,
      topLabel: top?.label || `OUT ${ch}`,
      topEndpoint: top?.endpoint || '',
      topSignal: top?.signal || 'Analog Audio',
      bottomLabel: bot?.label || `IN ${ch}`,
      bottomEndpoint: bot?.endpoint || '',
      bottomSignal: bot?.signal || 'Analog Audio',
      normalling: top?.normalling || bot?.normalling || 'half',
      ...(top?.connector ? { connector: top.connector } : {}),
    });
  }
  return pairs;
}
