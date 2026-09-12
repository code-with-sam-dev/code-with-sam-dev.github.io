import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';

/**
 * The signup must never ask for something it cannot honour.
 *
 * It used to post to the literal string REPLACE_WITH_KIT_FORM_ENDPOINT on six
 * of twelve pages including the homepage. It looked like a working signup and
 * discarded every address given to it. This test is what stops that returning.
 */
async function htmlFiles(dir = 'dist', found = []) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await htmlFiles(p, found);
    else if (e.name.endsWith('.html')) found.push(p);
  }
  return found;
}

const pages = await htmlFiles();

test('no built page contains a placeholder form action', async () => {
  for (const p of pages) {
    const html = await readFile(p, 'utf8');
    // Case SENSITIVE, and only sentinel tokens. The first version of this
    // test matched the legitimate HTML attribute placeholder="you@example.com"
    // and failed two perfectly good contact forms.
    assert.ok(!/REPLACE_WITH|TODO_[A-Z]|FIXME|XXX_/.test(html),
      `${p} ships a placeholder sentinel to real readers`);
  }
});

test('no page collects an email without somewhere to send it', async () => {
  for (const p of pages) {
    const html = await readFile(p, 'utf8');
    const inputs = [...html.matchAll(/<input[^>]*type="email"[^>]*>/gi)];
    if (inputs.length === 0) continue;
    // An email input implies a form, and that form needs a real destination.
    const actions = [...html.matchAll(/<form[^>]*action="([^"]*)"/gi)].map((m) => m[1]);
    for (const a of actions) {
      assert.ok(a.startsWith('http'),
        `${p} has an email input posting to "${a}", which will lose the address`);
    }
  }
});

test('when signup is off, the section still offers something that works', async () => {
  const home = await readFile('dist/index.html', 'utf8');
  const hasForm = /type="email"/i.test(home);
  if (hasForm) return; // endpoint configured, nothing to check
  assert.match(home, /Subscribe on YouTube/i, 'no working alternative offered');
  assert.match(home, /rss\.xml/i, 'the feed is not offered as an alternative');
});

/**
 * The signup is live, as of 2026-09-12.
 *
 * The endpoint came from the Kit form "Code with Sam newsletter", form id
 * 9911205, read from its own Embed HTML snippet rather than typed from memory.
 * These tests hold the wiring in place: an endpoint that quietly reverts to
 * empty would swap a working form back for the fallback without anything
 * failing, and nobody would notice until subscribers stopped arriving.
 */
test('the homepage posts the newsletter to Kit', async () => {
  const home = await readFile('dist/index.html', 'utf8');
  const actions = [...home.matchAll(/<form[^>]*action="([^"]*)"/gi)].map((m) => m[1]);
  assert.ok(
    actions.some((a) => /^https:\/\/app\.kit\.com\/forms\/\d+\/subscriptions$/.test(a)),
    `homepage has no Kit form action, found: ${JSON.stringify(actions)}`,
  );
});

test('the field Kit reads is the field the form sends', async () => {
  // Kit reads email_address. A form posting name="email" returns 200 and
  // records nobody, which is the exact failure this whole file exists to stop.
  const home = await readFile('dist/index.html', 'utf8');
  const emailInput = home.match(/<input[^>]*type="email"[^>]*>/i);
  assert.ok(emailInput, 'no email input on the homepage');
  assert.match(emailInput[0], /name="email_address"/, 'Kit will not see this field');
});

test('every page that shows the signup shows the live form, not the fallback', async () => {
  for (const p of pages) {
    const html = await readFile(p, 'utf8');
    if (!/The Senior Backend Interview Pack|Get the interview pack/.test(html)) continue;
    assert.ok(!/Email sign up is not open yet/.test(html),
      `${p} still shows the fallback copy after the endpoint went live`);
  }
});

/**
 * The privacy policy has to describe the site as it actually is.
 *
 * It said "email sign up is currently closed" for as long as that was true, and
 * stayed saying it for the first minutes after the Kit endpoint went live. A
 * privacy policy that contradicts the page it sits behind is the single easiest
 * thing for a reviewer to catch, and it is the sort of drift nothing else would
 * have failed on.
 */
test('the privacy policy agrees with whether signup is live', async () => {
  const home = await readFile('dist/index.html', 'utf8');
  const privacy = await readFile('dist/privacy/index.html', 'utf8');
  const live = /type="email"/i.test(home);
  const claimsClosed = /sign up is currently closed|sign up is not open/i.test(privacy);
  assert.equal(live && claimsClosed, false,
    'the form collects addresses while the privacy policy says signup is closed');
  if (live) {
    assert.match(privacy, /\bKit\b/, 'the live newsletter processor is not disclosed');
  }
});
