import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

/**
 * ONE LINKS LIST FOR EVERY SHEET. Five copies existed until 2026-09-23, and the
 * support links reached 25 of 42 PDFs because only one copy was edited.
 */
const dir = 'tools/pdf';
const commons = (await readdir(dir)).filter((f) => f.endsWith('-common.mjs'));

test('no common module keeps its own copy of the links', async () => {
  for (const f of commons) {
    const src = await readFile(`${dir}/${f}`, 'utf8');
    assert.doesNotMatch(src, /export const CHANNEL_LINKS\s*=/, `${f} defines its own CHANNEL_LINKS`);
  }
});

test('the one list carries the support links, coffee above sadza', async () => {
  const src = await readFile(`${dir}/channel-links.mjs`, 'utf8');
  const coffee = src.indexOf('Buy me a coffee');
  const sadza = src.indexOf('Buy me sadza');
  assert.ok(coffee > 0 && sadza > coffee);
  assert.match(src, /https:\/\/buymeacoffee\.com\/codewithsam/);
});
