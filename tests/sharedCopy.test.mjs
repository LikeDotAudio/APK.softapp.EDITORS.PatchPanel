// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
// ROAD-3766: js/shared/ is a byte copy of EDITORS.PanelBuddy/js/shared/ (the methods both
// panel editors carry word for word). The copy fails here the moment it drifts: edit the
// PanelBuddy file, then copy it here. Skipped when PanelBuddy is not checked out beside this repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const HERE = new URL('../js/shared/', import.meta.url);
const SOURCE = new URL('../../EDITORS.PanelBuddy/js/shared/', import.meta.url);
const list = (dir) => readdirSync(dir).filter(f => f.endsWith('.js')).sort();

test('js/shared/ is byte for byte EDITORS.PanelBuddy/js/shared/', { skip: !existsSync(SOURCE) && 'EDITORS.PanelBuddy is not beside this repo' }, () => {
  assert.deepEqual(list(HERE), list(SOURCE), 'the same files in both js/shared/');
  for (const f of list(SOURCE)) {
    assert.ok(readFileSync(new URL(f, HERE)).equals(readFileSync(new URL(f, SOURCE))),
      `js/shared/${f} drifted from EDITORS.PanelBuddy/js/shared/${f}: copy it over`);
  }
});
