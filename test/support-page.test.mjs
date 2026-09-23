import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

/**
 * Sam, 2026-09-23, on /support: "by me coffe should be big on this page, that's
 * it's whole use not hidden at the bottom, should at the top and visible".
 * The page is FOR giving, so the way to give is the first thing on it, large,
 * coffee first and sadza under it.
 */
const page = await readFile('src/pages/support.astro', 'utf8');
const lib = await readFile('src/lib/support.ts', 'utf8');

test('the donation list is open, with coffee before sadza, to the real page', () => {
  assert.match(lib, /https:\/\/buymeacoffee\.com\/codewithsam/);
  assert.ok(lib.indexOf('Buy me a coffee') > 0 && lib.indexOf('Buy me sadza') > lib.indexOf('Buy me a coffee'));
});

test('the support buttons come before everything else on the page', () => {
  const hero = page.indexOf('class="hero"');
  assert.ok(hero > 0, 'no hero block');
  assert.ok(hero < page.indexOf('Free ways to help'), 'the buttons sit below the free ways');
  assert.ok(hero < page.indexOf('class="lede"'), 'the buttons sit below the introduction');
});

test('the old "not open yet" wording is gone', () => {
  assert.doesNotMatch(page, /Not open yet/);
});
