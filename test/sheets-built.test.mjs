import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

/*
  EVERY REGISTERED SHEET HAS A FILE ON DISK.

  WHY THIS EXISTS. On 2026-09-17 the Claude Code advanced sheets for episodes 14
  and 16 were found missing from public/downloads. Both were REGISTERED in
  build-pdf.mjs and both had complete, finished data modules sitting in
  tools/pdf/. Nobody had ever run the build. One command each.

  IT IS THE THIRD INSTANCE OF ONE SHAPE in a single session:

    ThumbnailOpen   built, and no episode ever passed thumbId
    Two PDF sheets  written and registered, never rendered
    PromptScene     had no typing, so a standing rule was unimplementable

  The pattern is not laziness. FINISHING IS INVISIBLE. Writing the data module
  feels like the work; running the build is an afterthought nothing reminds you
  about. And a missing file in public/downloads looks exactly like a file nobody
  has written yet, so there is no signal to notice.

  This is the signal. Registering a sheet is now a promise the build checks.
*/
const buildPdf = readFileSync(new URL('../tools/build-pdf.mjs', import.meta.url), 'utf8');

/** Every `out:` path declared in the SHEETS table, with the key that owns it. */
const registered = [...buildPdf.matchAll(/'([a-z0-9-]+)':\s*\{[^}]*?out:\s*'([^']+)'/gs)].map(
  (m) => ({key: m[1], out: m[2]}),
);

test('the SHEETS table was parsed at all', () => {
  // A matcher that silently finds nothing would make every assertion below
  // pass, which is the way a gate quietly stops guarding anything.
  assert.ok(registered.length > 20, `only ${registered.length} sheets parsed; the matcher has drifted`);
});

test('every registered sheet has been built', () => {
  const missing = registered
    .filter(({out}) => !existsSync(new URL(`../${out}`, import.meta.url)))
    .map(({key, out}) => `${key} -> ${out}`);

  assert.deepEqual(
    missing,
    [],
    `these sheets are registered but were never rendered. Run npm run build:pdf <key>:\n  ${missing.join('\n  ')}`,
  );
});

test('every registered sheet has its data module', () => {
  const missing = [...buildPdf.matchAll(/data:\s*'\.\/(pdf\/[^']+)'/g)]
    .map((m) => m[1])
    .filter((p) => !existsSync(new URL(`../tools/${p}`, import.meta.url)));

  assert.deepEqual(missing, [], `registered sheets with no data module:\n  ${missing.join('\n  ')}`);
});
