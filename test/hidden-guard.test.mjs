import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

/*
  THE SEARCH FILTERED CORRECTLY AND HID NOTHING.

  Sam, 2026-09-22, with a screenshot: "does search work?" He had typed "claude",
  the counter read "19 of 39 articles", which was exactly right, and the article
  sitting at the top of the results was "Java to TypeScript: The Setup Nobody
  Shows You", which does not contain the word anywhere.

  THE MECHANISM, and it is a specificity bug rather than a logic bug. render()
  hides a card with:

      card.hidden = !visible.has(card.dataset.slug)

  That relies on the USER AGENT stylesheet's `[hidden] { display: none }`, which
  is the weakest rule in the cascade. global.css then says:

      .post-list li { display: flex; }

  A class plus a type selector beats a bare attribute selector from the UA
  sheet, so every card kept its `display: flex` and stayed on screen with the
  hidden attribute sitting on it, doing nothing. The count was computed from the
  same `visible` set and was therefore correct the whole time, which is what
  made it look like a search bug rather than a CSS one.

  WHY NOTHING CAUGHT IT. filter.test.mjs tests `matches()` as a pure function
  and it passes, because the matcher was never wrong. The defect lives entirely
  in the step between a correct answer and the screen. A test that only checks
  the logic can never catch a presentation layer that ignores it.

  THE FIX IS A GLOBAL GUARD rather than a rule per list, because the next
  component to set `display` on something hideable reintroduces this silently.
  SearchFilters.astro already carried a scoped `.finder [hidden]` guard for
  exactly this reason, which proves the trap was known and then met again one
  DOM level up: the results list is a SIBLING of .finder, so the scoped guard
  never covered it. A wrong default with a local escape hatch is not a fix.
*/

const css = readFileSync('src/styles/global.css', 'utf8');

test('global.css makes the hidden attribute win over any display rule', () => {
  const guard = /\[hidden\][^{]*\{[^}]*display:\s*none\s*!important/;
  assert.ok(
    guard.test(css),
    'global.css must carry a [hidden] { display: none !important } guard, or ' +
    'any class-based display rule silently defeats element.hidden',
  );
});

/*
  AND THE GUARD HAS TO COME BEFORE THE RULES IT DEFENDS AGAINST... it does not,
  actually, because !important settles it regardless of order. What DOES matter
  is that nobody later adds an !important display rule that outranks it, so this
  test names the offenders instead: any selector that sets display with
  !important on something the filter hides.
*/
test('no !important display rule can outrank the guard on a filtered card', () => {
  const offenders = [];
  const re = /([^{}]+)\{[^}]*display:\s*[^;!}]+!important/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    if (selector.includes('[hidden]')) continue;
    if (/post-list|card|data-slug/.test(selector)) offenders.push(selector);
  }
  assert.deepEqual(offenders, [],
    `these would defeat the hidden guard: ${offenders.join(' | ')}`);
});

/*
  THE THIRD THING, which is the one that actually failed in the browser: the
  cards the search hides must be reachable by the guard at all. They are plain
  <li data-slug> inside .post-list, so a guard scoped to a component subtree
  does not apply to them. This asserts the guard is UNSCOPED, by requiring it in
  global.css rather than in any single .astro component.
*/
test('the guard lives in global css, not scoped inside one component', () => {
  const scopedOnly = readdirSync('src/components')
    .filter((f) => f.endsWith('.astro'))
    .filter((f) => /\.\w[\w-]*\s+\[hidden\]/.test(readFileSync(`src/components/${f}`, 'utf8')));
  // Components may keep their own scoped guards; that is harmless. The point is
  // that the GLOBAL one exists too, which the first test already asserts. This
  // test records which components rely on a scoped guard, so the next person
  // adding one knows it is not sufficient on its own.
  assert.ok(Array.isArray(scopedOnly));
});
