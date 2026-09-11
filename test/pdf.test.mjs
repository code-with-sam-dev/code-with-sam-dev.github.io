import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

import {sheet} from '../tools/pdf/design-sheet.data.mjs';
import {renderHtml} from '../tools/pdf/render.mjs';

/*
  The design sheet is the first thing on this channel that a viewer keeps. It
  outlives the video, gets emailed to a colleague, and may be open on a second
  screen during a real interview. So the bar is higher than for a caption: a
  wrong isolation level here is wrong in someone's hands for years.

  These tests enforce the things that cannot be checked by reading it once.
*/

const html = renderHtml(sheet);

test('no em dashes anywhere in the document', () => {
  // Sam's standing rule, and the one most easily broken by prose written fast.
  assert.equal(html.includes('—'), false, 'em dash found in the design sheet');
});

test('nothing identifies Sam personally', () => {
  const banned = [/samson/i, /nyabanga/i, /@gmail\.com/i, /\bmailto:/i];
  for (const pattern of banned) {
    assert.equal(pattern.test(html), false, `design sheet leaks ${pattern}`);
  }
});

test('every link is a full https URL, never a bare hostname', () => {
  for (const link of sheet.links) {
    assert.match(link.url, /^https:\/\//, `${link.label} is not a full https URL`);
  }
});

test('the link block carries every account the channel owns', () => {
  // The omission that shipped on 2026-09-11: seven links where there should
  // have been nine, because the canonical list itself was wrong.
  const labels = sheet.links.map((l) => l.label.toLowerCase());
  for (const required of ['youtube', 'linkedin', 'x', 'tiktok', 'instagram', 'github', 'site']) {
    assert.ok(
      labels.some((l) => l.includes(required)),
      `link block is missing ${required}`
    );
  }
});

test('every claim carries a source, because that is the whole point of the sheet', () => {
  for (const section of sheet.sections) {
    for (const claim of section.claims ?? []) {
      assert.ok(claim.text?.length > 0, 'claim with no text');
      assert.ok(
        claim.source?.length > 0,
        `claim has no source: ${claim.text.slice(0, 60)}`
      );
    }
  }
});

test('sources are primary documentation or named explicitly as something else', () => {
  // A claim sourced to "common knowledge" is how a wrong thing gets a citation
  // shaped box drawn around it.
  const allowed = /postgresql|kafka|youtube|gsma|literature|first principles/i;
  for (const section of sheet.sections) {
    for (const claim of section.claims ?? []) {
      assert.match(claim.source, allowed, `unrecognised source: ${claim.source}`);
    }
  }
});

test('the scale figures are labelled as interview assumptions, not measurements', () => {
  assert.match(html, /interview assumption/i);
});

test('the document uses the channel palette rather than inventing one', () => {
  for (const token of ['#FBFBF9', '#12161F', '#7C5CFF', '#12A87A', '#D93A3A']) {
    assert.ok(html.includes(token), `palette token ${token} missing`);
  }
});

test('the built PDF exists, is a real PDF, and is not a blank page', async () => {
  const path = 'public/downloads/digital-wallet-design-sheet.pdf';
  let info;
  try {
    info = await stat(path);
  } catch {
    assert.fail(`${path} has not been built. Run: npm run build:pdf`);
  }
  const head = (await readFile(path)).subarray(0, 5).toString('latin1');
  assert.equal(head, '%PDF-', 'output is not a PDF');
  assert.ok(info.size > 20_000, `PDF is suspiciously small at ${info.size} bytes`);
});
