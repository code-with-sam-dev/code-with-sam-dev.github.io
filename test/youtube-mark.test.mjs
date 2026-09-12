import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

/**
 * Sam's rule, 2026-09-12: the YouTube mark is YouTube red, never the house
 * purple. A viewer recognises the platform by its colour before reading a
 * word, so a purple play button reads as "some app" rather than YouTube.
 */
const mark = await readFile('src/components/YouTubeMark.astro', 'utf8');

test('the YouTube mark is YouTube red, not the house accent', () => {
  assert.match(mark, /#FF0000/i);
  assert.ok(!/#7C5CFF|var\(--primary/i.test(mark), 'the mark uses the house purple');
});

test('the play triangle stays white so the mark is recognisable', () => {
  assert.match(mark, /fill="#fff"/i);
});

test('it is decorative, so it is hidden from screen readers', () => {
  // The adjacent text already says "YouTube". Announcing it twice is noise.
  assert.match(mark, /aria-hidden="true"/);
});

test('every "Watch on YouTube" affordance carries the mark', async () => {
  for (const f of ['src/pages/index.astro', 'src/pages/blog/[...slug].astro']) {
    const src = await readFile(f, 'utf8');
    if (!/Watch on/i.test(src)) continue;
    assert.match(src, /YouTubeMark/, `${f} says "Watch on YouTube" without the mark`);
  }
});
