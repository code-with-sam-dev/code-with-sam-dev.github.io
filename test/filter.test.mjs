import {test} from 'node:test';
import assert from 'node:assert/strict';

import {matches, valuesOf, facetsFor} from '../src/lib/filter.ts';

/**
 * The search and filter rules.
 *
 * These run against the SAME functions the browser runs, which is the reason
 * the pure logic lives in its own module. A test against a copy of the rules
 * proves the copy.
 */

const post = (overrides = {}) => ({
  slug: 'kafka-rebalancing-explained',
  title: 'Kafka Rebalancing Explained',
  description: 'Healthy consumers, zero progress.',
  tags: ['kafka', 'interviews'],
  series: 'Kafka Payments',
  episode: 3,
  year: 2026,
  date: '2026-09-12',
  hasSheet: true,
  hasRepo: true,
  hasVideo: true,
  haystack: 'kafka rebalancing explained healthy consumers zero progress consumer group offsets',
  ...overrides,
});

const NONE = {text: '', selected: {}};

test('an empty query matches everything', () => {
  assert.equal(matches(post(), NONE), true);
});

test('every typed word must appear, so typing more narrows rather than widens', () => {
  // OR search gets WIDER as a reader tries to be more specific, which reads as
  // broken. AND is what a search box is expected to do.
  assert.equal(matches(post(), {text: 'rebalancing', selected: {}}), true);
  assert.equal(matches(post(), {text: 'rebalancing consumers', selected: {}}), true);
  assert.equal(matches(post(), {text: 'rebalancing bananas', selected: {}}), false);
});

test('search is case and whitespace insensitive', () => {
  assert.equal(matches(post(), {text: '  KAFKA   Offsets ', selected: {}}), true);
});

test('within one dropdown the values are OR', () => {
  const query = {text: '', selected: {tags: ['kafka', 'python']}};
  assert.equal(matches(post(), query), true);

  const java = post({tags: ['java'], haystack: 'java'});
  assert.equal(matches(java, query), false);
});

test('across dropdowns the values are AND', () => {
  const kafka2026 = {text: '', selected: {tags: ['kafka'], year: ['2026']}};
  assert.equal(matches(post(), kafka2026), true);
  assert.equal(matches(post({year: 2025}), kafka2026), false);
});

test('an empty selection for a facet does not filter anything out', () => {
  assert.equal(matches(post(), {text: '', selected: {tags: [], series: []}}), true);
});

test('the includes facet reflects what the article actually carries', () => {
  assert.deepEqual(valuesOf(post(), 'has').sort(), ['Code', 'Design sheet', 'Video']);
  assert.deepEqual(valuesOf(post({hasSheet: false, hasRepo: false}), 'has'), ['Video']);
});

test('an unknown facet key matches nothing rather than throwing', () => {
  // A stale URL with an old facet name should show no results, not a blank
  // page from an exception in a click handler.
  assert.deepEqual(valuesOf(post(), 'nonsense'), []);
  assert.equal(matches(post(), {text: '', selected: {nonsense: ['x']}}), false);
});

test('facets are derived from the articles, never hard coded', () => {
  const posts = [
    post(),
    post({slug: 'b', tags: ['java'], series: 'Java Gotchas', year: 2026, hasSheet: false}),
    post({slug: 'c', tags: ['java', 'kafka'], series: 'Java Gotchas', year: 2025, hasRepo: false}),
  ];
  const facets = facetsFor(posts);
  const byKey = Object.fromEntries(facets.map((f) => [f.key, f]));

  // Including 'interviews', which the first fixture carries. Listing exactly
  // what the articles hold is the assertion: a facet that quietly dropped a
  // tag would be a filter a reader cannot reach.
  assert.deepEqual(
    byKey.tags.options.map((o) => o.value).sort(),
    ['interviews', 'java', 'kafka'],
  );
  assert.deepEqual(byKey.series.options.map((o) => o.value).sort(), ['Java Gotchas', 'Kafka Payments']);
  assert.deepEqual(byKey.year.options.map((o) => o.value).sort(), ['2025', '2026']);
});

test('facet options carry counts, and the commonest comes first', () => {
  const posts = [post(), post({slug: 'b', tags: ['java']}), post({slug: 'c', tags: ['java']})];
  const tags = facetsFor(posts).find((f) => f.key === 'tags');

  assert.equal(tags.options[0].value, 'java');
  assert.equal(tags.options[0].count, 2);
});

test('a facet with only one option is dropped, because it filters nothing', () => {
  const posts = [post(), post({slug: 'b'})];
  const facets = facetsFor(posts);

  // Both articles share one series and one year, so those dropdowns would be
  // pure furniture. Tags differ in count only, so it also collapses here.
  assert.equal(facets.find((f) => f.key === 'series'), undefined);
  assert.equal(facets.find((f) => f.key === 'year'), undefined);
});

test('a tag that no article carries any more disappears from the facets', () => {
  // The point of "dynamic": deleting the last article with a tag must remove
  // the option, or a reader filters by something that returns nothing.
  const withPython = facetsFor([post(), post({slug: 'b', tags: ['python'], year: 2025})]);
  assert.ok(withPython.find((f) => f.key === 'tags').options.some((o) => o.value === 'python'));

  const without = facetsFor([post(), post({slug: 'b', tags: ['java'], year: 2025})]);
  assert.equal(
    without.find((f) => f.key === 'tags').options.some((o) => o.value === 'python'),
    false,
  );
});

import {readFile} from 'node:fs/promises';

test('the finder paints with theme tokens, never a hardcoded light surface', async () => {
  /*
    The same mistake the brand mark made on the thumbnails, in a different
    place: this component was written with `background: #fff` and shipped onto
    a site that has a dark theme, so the dropdown labels were dark ink on a
    dark ground and the whole control was unreadable.

    One literal is allowed and it is checked by name below: white text on the
    purple count badge, which is correct on either ground.
  */
  const css = await readFile('src/components/SearchFilters.astro', 'utf8');
  const styleBlock = css.slice(css.indexOf('<style>'));

  const literals = [...styleBlock.matchAll(/(background|border-color)\s*:\s*(#[0-9a-f]{3,8})/gi)];
  assert.deepEqual(
    literals.map((m) => m[0]),
    [],
    'a surface colour is hardcoded instead of using a theme token',
  );

  // The one permitted literal, asserted so removing the token around it fails.
  assert.match(styleBlock, /background:\s*var\(--primary\);\s*\n\s*color:\s*#fff;/,
    'the count badge should be white on the primary colour');
});

test('the finder uses the same tokens the rest of the site does', async () => {
  const css = await readFile('src/components/SearchFilters.astro', 'utf8');
  for (const token of ['--surface', '--hairline', '--ink', '--ink-soft', '--primary']) {
    assert.ok(css.includes(`var(${token})`), `${token} is not used, so the theme will not reach it`);
  }
});
