// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.

import { BlockBridge } from './blockBridge.js';
import { PatchPanelModel, NORMAL_TYPES } from './patchModel.js';

export class PatchApp {
  constructor() {
    this.model = new PatchPanelModel(24);
    this.selectedCh = 1;

    this.bridge = new BlockBridge({
      name: 'Patch Panel Designer',
      type: 'patch_panel',
      onBlockLoaded: (block, meta) => this.handleBlockLoaded(block, meta),
      onBlockChanged: () => {},
    });

    this.initElements();
    this.attachEvents();
    this.loadInitialData();
  }

  initElements() {
    this.btnOpen = document.getElementById('btn-open');
    this.btnSave = document.getElementById('btn-save');
    this.btnClose = document.getElementById('btn-close');
    this.btnSyncDiscovered = document.getElementById('btn-sync-discovered');

    this.inputBayName = document.getElementById('input-bay-name');
    this.selectDensity = document.getElementById('select-density');

    this.topStrip = document.getElementById('top-strip');
    this.topRow = document.getElementById('top-row');
    this.bottomRow = document.getElementById('bottom-row');
    this.bottomStrip = document.getElementById('bottom-strip');
    this.tableBody = document.getElementById('patch-table-body');
  }

  attachEvents() {
    this.btnOpen?.addEventListener('click', () => this.promptOpen());
    this.btnSave?.addEventListener('click', () => this.saveBlock());
    this.btnClose?.addEventListener('click', () => this.bridge.close());
    this.btnSyncDiscovered?.addEventListener('click', () => this.loadFromDiscoveredProject());

    this.inputBayName.addEventListener('input', (e) => {
      this.model.name = e.target.value;
      this.bridge.notifyChanged();
    });

    this.selectDensity.addEventListener('change', (e) => {
      const c = parseInt(e.target.value, 10);
      this.model.pairCount = c;
      this.model.generatePairs(c);
      this.render();
      this.bridge.notifyChanged();
    });
  }

  loadInitialData() {
    this.loadFromDiscoveredProject().catch(() => {
      this.render();
    });
  }

  async loadFromDiscoveredProject() {
    try {
      const data = await this.bridge.fetchDiscoveredProject();
      if (data && (data.patchbays || data.patchPanels)) {
        const pbs = data.patchbays || data.patchPanels;
        if (Array.isArray(pbs) && pbs.length > 0) {
          this.handleBlockLoaded(pbs[0], { title: pbs[0].name });
          return;
        }
      }
    } catch (_) {}
    this.render();
  }

  handleBlockLoaded(block, meta = {}) {
    if (!block) return;
    this.model.id = block.id || this.model.id;
    this.model.name = block.name || this.model.name;
    if (Array.isArray(block.pairs) && block.pairs.length > 0) {
      this.model.pairs = block.pairs;
      this.model.pairCount = block.pairs.length;
    }
    this.render();
  }

  saveBlock() {
    const block = {
      type: 'patch_panel',
      id: this.model.id,
      name: this.model.name,
      pairCount: this.model.pairCount,
      pairs: this.model.pairs,
      timestamp: new Date().toISOString(),
    };
    this.bridge.saveBlock(block, {
      title: `${this.model.name} (${this.model.pairCount} Pairs)`,
      filename: `patchbay_${this.model.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    });
  }

  render() {
    this.inputBayName.value = this.model.name;
    this.selectDensity.value = this.model.pairCount;
    this.renderVisualJacks();
    this.renderTable();
  }

  renderVisualJacks() {
    this.topStrip.innerHTML = '';
    this.bottomStrip.innerHTML = '';
    this.topRow.innerHTML = '';
    this.bottomRow.innerHTML = '';

    this.model.pairs.forEach(p => {
      const isSel = p.ch === this.selectedCh;

      // Top strip cell
      const ts = document.createElement('div');
      ts.className = `strip-cell ${isSel ? 'selected' : ''}`;
      ts.style.flex = '1';
      ts.style.minWidth = '28px';
      ts.style.padding = '3px 2px';
      ts.style.background = isSel ? 'var(--osc-accent-primary)' : 'var(--osc-bg-surface)';
      ts.style.color = isSel ? '#000' : 'var(--osc-text-primary)';
      ts.style.border = '1px solid var(--osc-border-default)';
      ts.style.fontSize = '8px';
      ts.style.textAlign = 'center';
      ts.style.fontWeight = 'bold';
      ts.style.overflow = 'hidden';
      ts.textContent = p.topLabel || `T${p.ch}`;
      this.topStrip.appendChild(ts);

      // Top jack hole
      const tj = document.createElement('div');
      tj.className = 'jack-hole';
      tj.style.flex = '1';
      tj.style.minWidth = '28px';
      tj.style.height = '24px';
      tj.style.display = 'flex';
      tj.style.alignItems = 'center';
      tj.style.justifyContent = 'center';
      tj.style.cursor = 'pointer';
      tj.innerHTML = `<div style="width:16px; height:16px; border-radius:50%; background:#000; border:2px solid ${isSel ? 'var(--osc-accent-primary)' : '#4A9EFF'};"></div>`;
      tj.addEventListener('click', () => {
        this.selectedCh = p.ch;
        this.renderVisualJacks();
        const row = document.getElementById(`pair-row-${p.ch}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      this.topRow.appendChild(tj);

      // Bottom jack hole
      const bj = document.createElement('div');
      bj.className = 'jack-hole';
      bj.style.flex = '1';
      bj.style.minWidth = '28px';
      bj.style.height = '24px';
      bj.style.display = 'flex';
      bj.style.alignItems = 'center';
      bj.style.justifyContent = 'center';
      bj.style.cursor = 'pointer';
      bj.innerHTML = `<div style="width:16px; height:16px; border-radius:50%; background:#000; border:2px solid ${isSel ? 'var(--osc-accent-primary)' : '#10B981'};"></div>`;
      bj.addEventListener('click', () => {
        this.selectedCh = p.ch;
        this.renderVisualJacks();
        const row = document.getElementById(`pair-row-${p.ch}`);
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      this.bottomRow.appendChild(bj);

      // Bottom strip cell
      const bs = document.createElement('div');
      bs.className = `strip-cell ${isSel ? 'selected' : ''}`;
      bs.style.flex = '1';
      bs.style.minWidth = '28px';
      bs.style.padding = '3px 2px';
      bs.style.background = isSel ? 'var(--osc-accent-primary)' : 'var(--osc-bg-surface)';
      bs.style.color = isSel ? '#000' : 'var(--osc-text-primary)';
      bs.style.border = '1px solid var(--osc-border-default)';
      bs.style.fontSize = '8px';
      bs.style.textAlign = 'center';
      bs.style.fontWeight = 'bold';
      bs.style.overflow = 'hidden';
      bs.textContent = p.bottomLabel || `B${p.ch}`;
      this.bottomStrip.appendChild(bs);
    });
  }

  renderTable() {
    this.tableBody.innerHTML = '';
    this.model.pairs.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.id = `pair-row-${p.ch}`;
      if (p.ch === this.selectedCh) {
        tr.style.background = 'var(--osc-bg-surface-hover)';
      }

      tr.innerHTML = `
        <td class="col-idx text-center">${p.ch}</td>
        <td><input type="text" class="cell-input" data-idx="${idx}" data-field="topLabel" value="${p.topLabel}"></td>
        <td><input type="text" class="cell-input" data-idx="${idx}" data-field="topEndpoint" value="${p.topEndpoint}"></td>
        <td><input type="text" class="cell-input" data-idx="${idx}" data-field="bottomLabel" value="${p.bottomLabel}"></td>
        <td><input type="text" class="cell-input" data-idx="${idx}" data-field="bottomEndpoint" value="${p.bottomEndpoint}"></td>
        <td>
          <select class="cell-input" data-idx="${idx}" data-field="normalling">
            ${NORMAL_TYPES.map(nt => `<option value="${nt.id}" ${nt.id === p.normalling ? 'selected' : ''}>${nt.name}</option>`).join('')}
          </select>
        </td>
      `;
      this.tableBody.appendChild(tr);
    });

    this.tableBody.querySelectorAll('.cell-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        const f = e.target.dataset.field;
        this.model.pairs[i][f] = e.target.value;
        this.renderVisualJacks();
        this.bridge.notifyChanged();
      });
    });
  }

  promptOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target.result);
          this.handleBlockLoaded(parsed, { title: file.name });
        } catch (err) {
          alert('Invalid JSON patch panel block');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.patchApp = new PatchApp();
  });
}
