import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';

/**
 * The Shorts marquee.
 *
 * Sam asked for the Shorts on the site, rotating in their own section so the
 * list can grow without the page growing with it. These tests hold the two
 * things that would make it worse than not having it: a link that goes
 * nowhere, and a marquee that never stops for someone who cannot read it
 * moving.
 */
const src = await readFile('src/lib/shorts.ts', 'utf8');
const ids = [...src.matchAll(/id: '([^']+)'/g)].map((m) => m[1]);

test('every Short id is a real YouTube id shape', () => {
  assert.ok(ids.length > 0, 'no Shorts declared');
  for (const id of ids) {
    assert.match(id, /^[A-Za-z0-9_-]{11}$/, `"${id}" is not an 11 character video id`);
  }
});

test('no Short is listed twice', () => {
  // The channel page renders each Short twice. Copying that in would show a
  // reader the same clip coming round again as if it were new.
  assert.equal(new Set(ids).size, ids.length, 'duplicate Short ids');
});

async function htmlFiles(dir = 'dist', found = []) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await htmlFiles(p, found);
    else if (e.name.endsWith('.html')) found.push(p);
  }
  return found;
}
const home = await readFile('dist/index.html', 'utf8');

test('the homepage actually renders the Shorts section', () => {
  assert.match(home, /class="[^"]*shorts-marquee/, 'no marquee on the page');
  for (const id of ids) {
    assert.ok(home.includes(id), `Short ${id} is declared but not rendered`);
  }
});

test('every Short link points at YouTube and opens safely', () => {
  const links = [...home.matchAll(/<a[^>]*href="(https:\/\/www\.youtube\.com\/shorts\/[^"]+)"[^>]*>/g)];
  assert.ok(links.length >= ids.length, 'not every Short is a link');
  for (const [tag] of links) {
    assert.match(tag, /rel="[^"]*noopener/, `a Short link is missing rel=noopener: ${tag}`);
  }
});

test('the animation stops for anyone who asked it to', () => {
  // A section that scrolls forever is a genuine accessibility problem, and it
  // is one line of CSS to respect the setting.
  const css = home.match(/<style[^>]*>[\s\S]*?<\/style>/g)?.join('') ?? '';
  const all = css + home;
  assert.match(all, /prefers-reduced-motion/, 'the marquee never stops');
});

test('the track is duplicated so the loop has no visible gap', () => {
  // A single copy scrolls off and leaves empty space before it wraps. The
  // standard fix is two copies, with the second hidden from screen readers so
  // the list is not announced twice.
  assert.match(home, /aria-hidden="true"/, 'no duplicated track for a seamless loop');
});
