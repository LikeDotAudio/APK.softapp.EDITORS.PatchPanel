// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// The two port schedules (paired patchbay, linear ports) as APKTable tables.
// The paired rows are built from the panel (pairedRows, pure); the linear rows
// ARE the panel's ports, so an APKTable edit lands on the port itself.

export const NORMALLING = [
  { id: 'half', label: 'Half Normal' },
  { id: 'full', label: 'Full Normal' },
  { id: 'parallel', label: 'Parallel (Mult)' },
  { id: 'isolated', label: 'Non-Normal (Isolated)' },
];

/** Channels on the panel: top row is ports[0..n-1], bottom row ports[n..2n-1]. */
export function pairCountOf(panel) {
  return Math.max(1, panel.portsPerRow || Math.ceil(panel.ports.length / 2));
}

/** Make sure both rows exist (the paired schedule's own defaults), then one row per channel. */
export function pairedRows(panel) {
  const pairCount = pairCountOf(panel);
  while (panel.ports.length < pairCount * 2) {
    const idx = panel.ports.length;
    const isTop = idx < pairCount;
    const ch = (idx % pairCount) + 1;
    panel.ports.push({
      portNumber: idx + 1,
      label: isTop ? `PREAMP ${ch}` : `DAW IN ${ch}`,
      endpoint: isTop ? `MIC-PRE-01 / OUT-${ch}` : `INTERFACE / IN-${ch}`,
      signal: 'Analog Audio',
      connector: 'TT-Bantam',
      normalling: ch <= 16 ? 'half' : 'full',
    });
  }
  const rows = [];
  for (let ch = 1; ch <= pairCount; ch++) {
    const top = panel.ports[ch - 1];
    const bot = panel.ports[ch - 1 + pairCount];
    rows.push({
      ch,
      topIdx: ch - 1,
      botIdx: ch - 1 + pairCount,
      topLabel: top.label || '',
      topEndpoint: top.endpoint || '',
      bottomLabel: bot.label || '',
      bottomEndpoint: bot.endpoint || '',
      normalling: String(top.normalling || bot.normalling || 'half').toLowerCase(),
    });
  }
  return rows;
}

/** A paired-table edit, written back to the two ports it stands for. */
export function applyPairedEdit(panel, row, key, value) {
  const top = panel.ports[row.topIdx];
  const bot = panel.ports[row.botIdx];
  if (!top || !bot) return false;
  const v = String(value ?? '');
  if (key === 'topLabel') top.label = v;
  else if (key === 'topEndpoint') top.endpoint = v;
  else if (key === 'bottomLabel') bot.label = v;
  else if (key === 'bottomEndpoint') bot.endpoint = v;
  else if (key === 'normalling') {
    top.normalling = bot.normalling = v;
    top.normalMode = bot.normalMode = v;
  } else return false;
  return true;
}

/** A discovered thing's identity: MAC, else serial, else the agent — never an IP. */
export function thingIdentity(t) {
  return (t && (t.mac || t.serial || t.agent)) || '';
}

/**
 * Give every port with no wire endpoint the next discovered device
 * (APKSoftapp.discovered().things()) not wired yet: its name as the endpoint,
 * its identity (MAC / serial) as endpointId. A thing with only an IP is skipped.
 * Returns how many ports were filled.
 */
export function fillEndpointsFromThings(ports, things) {
  const used = new Set(ports.map((p) => p.endpointId).filter(Boolean));
  const free = (things || []).filter((t) => {
    const id = thingIdentity(t);
    return id && !used.has(id);
  });
  let n = 0;
  for (const p of ports) {
    if (String(p.endpoint || '').trim() || !free.length) continue;
    const t = free.shift();
    p.endpointId = thingIdentity(t);
    p.endpoint = t.name || [t.vendor, t.model].filter(Boolean).join(' ') || p.endpointId;
    n++;
  }
  return n;
}

/**
 * The tables, in their two hosts. `app` gives: panel, selectedPortIndex,
 * selectPort(i), renderPreview(), render(), changed(), swapOrMovePorts(a, b).
 * connectorOptions() is the connector labels the linear table offers.
 */
export function createPortTables(app, { pairedHost, linearHost, connectorOptions }) {
  const T = () => window.APKTable;
  let paired = null;
  let linear = null;
  let linearOpts = '';
  let mode = 'paired';
  let quiet = false;   // a select() of our own is not the user picking a row

  const button = (text, title, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-icon';
    b.title = title;
    b.textContent = text;
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    return b;
  };

  const edited = () => { app.renderPreview(); app.changed(); };

  function makePaired() {
    paired = T().create(pairedHost, {
      id: 'patch-paired-schedule',
      columns: [
        { key: 'ch', label: 'Ch #', editable: false, mono: true, type: 'number', width: '48px' },
        { key: 'topLabel', label: 'Top Row (Output / Source)' },
        { key: 'topEndpoint', label: 'Top Wire Endpoint', placeholder: 'e.g. MIC-PRE-01 / OUT-1' },
        { key: 'bottomLabel', label: 'Bottom Row (Input / Destination)' },
        { key: 'bottomEndpoint', label: 'Bottom Wire Endpoint', placeholder: 'e.g. INTERFACE / IN-1' },
        {
          key: 'normalling', label: 'Normalling', width: '175px',
          render: (v, row) => {
            const sel = document.createElement('select');
            sel.className = 'cell-select';
            NORMALLING.forEach((n) => {
              const o = new Option(n.label, n.id);
              if (v.includes(n.id)) o.selected = true;
              sel.appendChild(o);
            });
            sel.addEventListener('change', () => {
              row.normalling = sel.value;
              if (applyPairedEdit(app.panel, row, 'normalling', sel.value)) edited();
            });
            return sel;
          },
        },
        {
          key: 'actions', label: 'Act', width: '70px',
          render: (v, row) => {
            const span = document.createElement('span');
            span.style.display = 'inline-flex';
            span.style.gap = '4px';
            span.appendChild(button('🔄', 'Swap Top and Bottom Ports', () => {
              const top = app.panel.ports[row.topIdx];
              const bot = app.panel.ports[row.botIdx];
              [top.label, bot.label] = [bot.label, top.label];
              [top.endpoint, bot.endpoint] = [bot.endpoint, top.endpoint];
              app.render();
              app.changed();
            }));
            span.appendChild(button('🧹', 'Clear Wire Endpoints', () => {
              app.panel.ports[row.topIdx].endpoint = '';
              app.panel.ports[row.botIdx].endpoint = '';
              app.render();
              app.changed();
            }));
            return span;
          },
        },
      ],
      rows: [],
      rowClass: (row) => (app.selectedPortIndex === row.topIdx || app.selectedPortIndex === row.botIdx ? 'selected' : ''),
      onEdit: (i, key, value, row) => { if (applyPairedEdit(app.panel, row, key, value)) edited(); },
      onSelect: (i, row) => { if (!quiet && row) app.selectPort(row.topIdx); },
      empty: 'No channels.',
    });
  }

  function makeLinear(options) {
    linearOpts = options.join('\u0000');
    linear = T().create(linearHost, {
      id: 'patch-linear-ports',
      columns: [
        { key: 'portNumber', label: '#', editable: false, mono: true, type: 'number', width: '40px' },
        { key: 'connector', label: 'CAD Connector', type: 'select', options },
        { key: 'label', label: 'Port Label / Channel' },
        { key: 'endpoint', label: 'Destination / Wire Endpoint', placeholder: 'e.g. STAGE / IN-1' },
        { key: 'signal', label: 'Signal Format' },
      ],
      rows: app.panel.ports,
      rowClass: (row, i) => (app.selectedPortIndex === i ? 'selected draggable-row' : 'draggable-row'),
      onEdit: () => edited(),
      onDelete: (i) => {
        app.panel.ports.splice(i, 1);
        if (app.selectedPortIndex >= app.panel.ports.length) app.selectedPortIndex = Math.max(0, app.panel.ports.length - 1);
        app.render();
        app.changed();
      },
      onSelect: (i) => { if (!quiet) app.selectPort(i); },
      empty: 'No ports: + Add Port / Pair.',
    });
  }

  // Drag a linear row onto another to move it (delegated: APKTable redraws its rows).
  const rowOf = (e) => e.target.closest && e.target.closest('tr[data-index]');
  linearHost.addEventListener('mousedown', (e) => {
    const tr = rowOf(e);
    if (tr && !e.target.closest('[contenteditable="true"], select, button, input')) tr.setAttribute('draggable', 'true');
  });
  linearHost.addEventListener('dragstart', (e) => {
    const tr = rowOf(e);
    if (!tr) return;
    tr.classList.add('dragging');
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'PANEL_PORT_DRAG', fromIndex: Number(tr.dataset.index) }));
    e.dataTransfer.effectAllowed = 'move';
  });
  linearHost.addEventListener('dragover', (e) => {
    const tr = rowOf(e);
    if (!tr) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    tr.classList.add('drag-over');
  });
  linearHost.addEventListener('dragleave', (e) => { rowOf(e)?.classList.remove('drag-over'); });
  linearHost.addEventListener('dragend', () => {
    linearHost.querySelectorAll('tr.dragging, tr.drag-over').forEach((r) => r.classList.remove('dragging', 'drag-over'));
  });
  linearHost.addEventListener('drop', (e) => {
    const tr = rowOf(e);
    if (!tr) return;
    e.preventDefault();
    tr.classList.remove('drag-over');
    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json'));
      const to = Number(tr.dataset.index);
      if (payload.type === 'PANEL_PORT_DRAG' && Number.isInteger(payload.fromIndex) && payload.fromIndex !== to) {
        app.swapOrMovePorts(payload.fromIndex, to);
      }
    } catch (_) { /* not a port drag */ }
  });

  function renderPaired() {
    if (!paired) makePaired();
    paired.setRows(pairedRows(app.panel));
  }

  function renderLinear() {
    const options = connectorOptions();
    if (!linear || options.join('\u0000') !== linearOpts) makeLinear(options);
    else linear.setRows(app.panel.ports);
  }

  return {
    render(m) {
      mode = m === 'linear' ? 'linear' : 'paired';
      pairedHost.style.display = mode === 'paired' ? '' : 'none';
      linearHost.style.display = mode === 'linear' ? '' : 'none';
      if (mode === 'paired') renderPaired(); else renderLinear();
    },
    /** Show port `idx` as selected in whichever table is up, and bring it into view. */
    select(idx) {
      const table = mode === 'paired' ? paired : linear;
      if (!table) return;
      const row = mode === 'paired' ? idx % pairCountOf(app.panel) : idx;
      quiet = true;
      try { table.select(row); } finally { quiet = false; }
      const host = mode === 'paired' ? pairedHost : linearHost;
      host.querySelector(`tr[data-index="${row}"]`)?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
    },
    tables: () => ({ paired, linear }),
  };
}
