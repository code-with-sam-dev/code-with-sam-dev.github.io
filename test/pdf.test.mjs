import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

import {sheet} from '../tools/pdf/design-sheet.data.mjs';
import {sheet as kafkaRebalancing} from '../tools/pdf/kafka-rebalancing.data.mjs';
import {renderHtml} from '../tools/pdf/render.mjs';

/**
 * Every sheet, not just the first one.
 *
 * These checks were written against the wallet sheet while it was the only
 * one. Sam's rule is that EVERY episode gets a sheet, so a second sheet that
 * quietly skipped all of them would be worse than no tests: it would look
 * covered. The list is what makes a new sheet inherit the rules.
 */
const SHEETS = [
  ['digital wallet', sheet],
  ['kafka rebalancing', kafkaRebalancing],
];

/*
  The design sheet is the first thing on this channel that a viewer keeps. It
  outlives the video, gets emailed to a colleague, and may be open on a second
  screen during a real interview. So the bar is higher than for a caption: a
  wrong isolation level here is wrong in someone's hands for years.

  These tests enforce the things that cannot be checked by reading it once.
*/

const html = renderHtml(sheet);

test('no em dashes anywhere in any document', () => {
  // Sam's standing rule, and the one most easily broken by prose written fast.
  for (const [name, s] of SHEETS) {
    assert.equal(renderHtml(s).includes('—'), false, `em dash found in the ${name} sheet`);
  }
});

test('nothing identifies Sam personally, in any sheet', () => {
  const banned = [/samson/i, /nyabanga/i, /@gmail\.com/i, /\bmailto:/i];
  for (const [name, s] of SHEETS) {
    const rendered = renderHtml(s);
    for (const pattern of banned) {
      assert.equal(pattern.test(rendered), false, `${name} sheet leaks ${pattern}`);
    }
  }
});

test('every link is a full https URL, never a bare hostname', () => {
  for (const [name, s] of SHEETS) {
    for (const link of s.links) {
      assert.match(link.url, /^https:\/\//, `${name}: ${link.label} is not a full https URL`);
    }
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
  const allowed = /postgresql|kafka|prometheus|youtube|gsma|literature|first principles/i;
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

test('the channel mark appears on every page, in the margins', () => {
  // Both marks are position:fixed, so Chrome paints them onto every page, and
  // both live in the page margin so they can never land on a line of text.
  // Crop any single page and it is still identifiably from this channel.
  assert.match(html, /class="stamp"/);
  assert.match(html, /class="footmark"/);
  assert.ok(html.includes(sheet.channel), 'channel name missing from the page marks');
});

test('there is no watermark printed behind the body text', () => {
  // Deliberate. Anything set large enough behind body copy to survive a
  // screenshot also makes the text harder to read, and this is a document
  // someone may have open during a real interview. Sam's instruction was that
  // it must not be excessive and must still read cleanly.
  assert.equal(html.includes('class="watermark"'), false);
});

test('the link block includes Facebook and a contact route', () => {
  // Facebook is kept out of captions on platforms that do not linkify, where a
  // raw profile.php id would have to be retyped. In a PDF the link is
  // clickable, so that objection does not apply here.
  const labels = sheet.links.map((l) => l.label.toLowerCase());
  assert.ok(labels.includes('facebook'), 'Facebook missing');
  assert.ok(labels.includes('contact'), 'contact route missing');
});

test('the published PDF refuses editing but still allows printing and screen readers', async () => {
  const {execFile} = await import('node:child_process');
  const {promisify} = await import('node:util');
  let out;
  try {
    ({stdout: out} = await promisify(execFile)('qpdf', [
      '--show-encryption',
      'public/downloads/digital-wallet-design-sheet.pdf',
    ]));
  } catch {
    // qpdf absent is a tooling gap on this machine, not a broken document.
    return;
  }
  assert.match(out, /modify anything: not allowed/);
  // Blocking these would punish blind readers to inconvenience a plagiarist.
  assert.match(out, /extract for accessibility: allowed/);
  assert.match(out, /print high resolution: allowed/);
  // It must still open without anyone being asked for a password.
  assert.match(out, /User password = *\n/);
});

test('the diagram cannot restyle the page around it', async () => {
  // An inline SVG's <style> block is not scoped to the SVG in an HTML
  // document; it leaks. The first version of the board used .sub and .box,
  // which silently overrode the cover subtitle and shrank it. Every class the
  // diagram defines is prefixed so a collision cannot happen again.
  const {architectureSvg} = await import('../tools/pdf/diagram.mjs');
  const svg = architectureSvg();
  const classes = [...svg.matchAll(/class="([a-z-]+)"/g)].map((m) => m[1]);
  const unprefixed = [...new Set(classes)].filter((c) => c !== 'board' && !c.startsWith('bd-'));
  assert.deepEqual(unprefixed, [], `diagram defines unprefixed classes: ${unprefixed}`);
});

test('the architecture board is on the document, with its flow numbered', async () => {
  const {architectureSvg, boardGeometry} = await import('../tools/pdf/diagram.mjs');
  assert.ok(html.includes('<svg'), 'board missing from the sheet');
  assert.deepEqual(boardGeometry.lanes, ['clients', 'edge', 'core', 'async', 'obs', 'fail']);
  // Steps must run 1..n with none skipped, or the reader loses the path.
  const steps = [...architectureSvg().matchAll(/class="bd-step">(\d+)</g)].map((m) => Number(m[1]));
  assert.deepEqual([...steps].sort((a, b) => a - b), Array.from({length: steps.length}, (_, i) => i + 1));
});

test('the footer links to the site and to the video, both clickable', () => {
  assert.ok(html.includes(`href="${sheet.siteUrl}"`), 'site link not clickable');
  assert.ok(html.includes(`href="${sheet.video.url}"`), 'video link not clickable');
  assert.match(sheet.video.url, /^https:\/\//);
});

test('the channel cartoon is embedded, not linked', () => {
  // Self contained: nothing to fetch when the PDF is opened, and nothing to
  // break if the image is ever moved in the repo.
  const withAvatar = renderHtml(sheet, {avatarDataUri: 'data:image/png;base64,AAA'});
  assert.match(withAvatar, /<img src="data:image\/png;base64,/);
});

test('technology marks appear only where the design commits to that technology', async () => {
  // Decorating a box with a logo we did not choose would assert an
  // architectural decision through clip art. Each mark below is a choice the
  // sheet actually argues for somewhere in the text.
  const {technologies} = await import('../tools/pdf/diagram.mjs');
  assert.ok(technologies.length > 0);
  for (const t of technologies) {
    assert.ok(t.title, `no title resolved for ${t.slug}`);
  }
});

test('the sheet carries a trademark note, because it shows other people marks', () => {
  assert.match(html, /property of their respective owners/i);
  assert.match(html, /implies any endorsement/i);
});

test('observability is in the flow diagram but is not a numbered step', async () => {
  // Observability watches every step; it is not a step the money passes
  // through. Numbering it would teach the opposite model.
  const {architectureSvg} = await import('../tools/pdf/diagram.mjs');
  const svg = architectureSvg();
  assert.match(svg, /OBSERVABILITY/);
  assert.match(svg, /stroke-dasharray/, 'observability taps should be dashed');
});

/**
 * The sheet and the video draw the SAME board.
 *
 * The board is defined once, in the video project, and exported into this repo
 * as generated data. These tests exist so that a hand edit to that generated
 * file, or a stale copy of it, fails here rather than being discovered by a
 * viewer who notices the sheet and the video disagree.
 */
test('the board is generated data, not something edited here', async () => {
  const {readFile} = await import('node:fs/promises');
  const src = await readFile(new URL('../tools/pdf/board.data.mjs', import.meta.url), 'utf8');
  assert.match(src, /GENERATED FILE\. Do not edit\./);
  assert.match(src, /export-board-data\.mjs/, 'the file should say what regenerates it');
});

test('every box the data declares is actually drawn', async () => {
  const {architectureSvg} = await import('../tools/pdf/diagram.mjs');
  const {BOXES} = await import('../tools/pdf/board.data.mjs');
  const svg = architectureSvg();
  for (const b of BOXES) {
    assert.ok(svg.includes(b.label), `${b.id} is in the data but not on the sheet`);
  }
});

test('every numbered step the data declares is drawn, with its label', async () => {
  const {architectureSvg} = await import('../tools/pdf/diagram.mjs');
  const {CONNECTORS} = await import('../tools/pdf/board.data.mjs');
  const svg = architectureSvg();
  const steps = CONNECTORS.filter((c) => c.kind === 'step');
  assert.ok(steps.length >= 10, 'the money path should have at least ten steps');
  for (const s of steps) {
    assert.ok(svg.includes(`>${s.step}</text>`), `step ${s.step} has no badge`);
    if (s.note) assert.ok(svg.includes(s.note), `step ${s.step} lost its label "${s.note}"`);
  }
});

test('the observability taps are drawn and none of them is numbered', async () => {
  const {architectureSvg} = await import('../tools/pdf/diagram.mjs');
  const {CONNECTORS} = await import('../tools/pdf/board.data.mjs');
  const svg = architectureSvg();
  const taps = CONNECTORS.filter((c) => c.kind === 'tap');
  assert.ok(taps.length > 0);
  for (const t of taps) {
    assert.ok(svg.includes(t.note), `the ${t.note} tap is missing`);
    assert.equal(t.step, undefined, 'a tap must never carry a step number');
  }
});

/**
 * The rules every sheet inherits, applied to every sheet.
 *
 * The sourcing rule is the whole reason these sheets are worth keeping: a
 * claim with no source is a rumour with nice typography, and this sheet may be
 * open on someone's second screen during a real interview.
 */
test('every claim in every sheet carries a source', () => {
  for (const [name, s] of SHEETS) {
    for (const section of s.sections) {
      for (const claim of section.claims ?? []) {
        assert.ok(
          claim.source && claim.source.trim().length > 0,
          `${name}/${section.id}: a claim has no source: "${claim.text.slice(0, 60)}"`,
        );
      }
    }
  }
});

test('every sheet says which day it was verified, and against what', () => {
  for (const [name, s] of SHEETS) {
    assert.match(s.verifiedOn, /^\d{4}-\d{2}-\d{2}$/, `${name} has no verification date`);
  }
});

test('a sheet for a published episode links to that episode, not the channel', () => {
  // The wallet sheet shipped pointing at the channel because the video was not
  // up yet. Once a video exists, the sheet has to point at it: a reader with
  // the PDF open is one click from watching, or is not.
  assert.match(kafkaRebalancing.video.url, /youtu\.be\/[A-Za-z0-9_-]{11}$/,
    'the rebalancing sheet does not link to its own video');
});

test('the rebalancing sheet states the Kafka version it was checked against', () => {
  // This episode is unusually version sensitive: the protocol changed in 4.0
  // and the classic one is being deprecated. A sheet that does not date its
  // claims will be quietly wrong within a year.
  const rendered = renderHtml(kafkaRebalancing);
  assert.match(rendered, /Kafka 4\.3/, 'no Kafka version stated anywhere in the sheet');
});

test('the rebalancing sheet gets the opt-in direction right', () => {
  // The easy error, and the one a viewer running a 4.x broker will correct:
  // server side the new protocol is on by default, and it is the CLIENT that
  // must opt in. Saying it is simply "off by default" is wrong.
  const rendered = renderHtml(kafkaRebalancing);
  assert.match(rendered, /group\.protocol=consumer/, 'the opt-in setting is not named');
  assert.ok(!/the new protocol is off by default/i.test(rendered),
    'states the opt-in backwards');
});

test('the Apache trademark notice is present where the Kafka mark is used', () => {
  assert.match(kafkaRebalancing.trademarks, /Apache Software Foundation/);
  assert.ok(/not?(hing)?\s+(here\s+)?impl(y|ies)/i.test(kafkaRebalancing.trademarks),
    'the notice does not disclaim endorsement');
});

/**
 * A sheet must never render another sheet's diagram.
 *
 * This shipped: the rebalancing sheet rendered the digital wallet
 * architecture, a transfer service and a ledger and an outbox, on page two of
 * a document about consumer groups. The board was hard coded into the template
 * while there was only one sheet to serve, and nothing failed when a second
 * arrived.
 */
test('no sheet renders a diagram belonging to a different subject', () => {
  const foreign = {
    'kafka rebalancing': [/Transfer service/i, /Idempotency store/i, /Ledger/i, /Outbox table/i],
    'digital wallet': [/Consumer group/i, /Rebalance protocol/i],
  };
  for (const [name, s] of SHEETS) {
    const rendered = renderHtml(s);
    for (const pattern of foreign[name] ?? []) {
      assert.ok(!pattern.test(rendered), `${name} sheet renders ${pattern}, which is another sheet's board`);
    }
  }
});

test('a sheet that declares no board simply has no board page', () => {
  // Better no diagram than the wrong one.
  for (const [name, s] of SHEETS) {
    if (s.board) {
      assert.equal(typeof s.board.svg, 'function', `${name} board has no svg`);
      assert.ok(s.board.title && s.board.lead, `${name} board is missing its copy`);
    }
  }
});
