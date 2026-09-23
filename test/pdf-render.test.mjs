import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

/**
 * Sam, 2026-09-23: "i expected to see things like [a dark terminal block] in
 * the pdf sheet for code snippets or installation commands", and "documents
 * don't have icons like on the site".
 */
const render = await readFile('tools/pdf/render.mjs', 'utf8');

test('a code block is drawn as a terminal window, dark, with a title bar', () => {
  assert.match(render, /class="code term"/);
  assert.match(render, /class="dots"/);
  assert.match(render, /\.code\s*\{[^}]*background:\s*#0f1115/);
});

test('every channel link carries its platform icon, sadza its own artwork', () => {
  for (const name of ['YouTube', 'LinkedIn', 'X', 'TikTok', 'Instagram', 'Facebook', 'GitHub', 'Buy me a coffee']) {
    assert.match(render, new RegExp(`'${name}':`), `no icon for ${name}`);
  }
  assert.match(render, /'Buy me sadza'\) return `<img/, 'sadza is not drawn with its own artwork');
  assert.match(render, /data:image\/png;base64/);
});
