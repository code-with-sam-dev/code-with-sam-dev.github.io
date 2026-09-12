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
  assert.match(home, /class="[^"]*shorts\b/, 'no Shorts section on the page');
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

test('it holds each Short rather than sliding continuously', () => {
  // Sam rejected the marquee for the right reason: "it's moving too fast",
  // and a title you cannot finish reading is a title nobody reads. The
  // carousel holds for a set number of milliseconds and then steps.
  assert.match(home, /data-hold="\d{4,}"/, 'no hold interval, so this is still a marquee');
  const hold = Number(home.match(/data-hold="(\d+)"/)[1]);
  assert.ok(hold >= 4000, `holds only ${hold}ms, which is not long enough to read`);
});

test('it stops for anyone who asked for reduced motion', () => {
  const all = (home.match(/<style[^>]*>[\s\S]*?<\/style>/g)?.join('') ?? '') + home;
  assert.match(all, /prefers-reduced-motion/, 'nothing respects reduced motion');
});

test('the previews are served from this domain, not hot-linked', () => {
  // Hot-linking i.ytimg.com would call Google on every page load and make the
  // privacy policy's "nothing loads from YouTube until you press play" false.
  assert.ok(!/i\.ytimg\.com/.test(home), 'a preview is hot-linked from YouTube');
  for (const id of ids) {
    assert.ok(home.includes(`/shorts/${id}.jpg`), `Short ${id} has no local poster`);
  }
});

test('no YouTube iframe exists until someone presses play', () => {
  assert.ok(!/<iframe[^>]*youtube/i.test(home), 'a YouTube iframe ships in the HTML');
  assert.match(home, /shorts-play/, 'there is no play control at all');
});

test('every declared Short has a poster file on disk', async () => {
  // A missing poster renders as a broken image in a section whose entire job
  // is to look like something worth pressing.
  const {access} = await import('node:fs/promises');
  for (const id of ids) {
    await access(`public/shorts/${id}.jpg`);
  }
});
