import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

import {sheet} from '../tools/pdf/design-sheet.data.mjs';
import {sheet as kafkaRebalancing} from '../tools/pdf/kafka-rebalancing.data.mjs';
import {sheet as kafkaOffsets} from '../tools/pdf/kafka-offsets.data.mjs';
import {sheet as kafkaIdempotency} from '../tools/pdf/kafka-idempotency.data.mjs';
import {sheet as kafkaRetries} from '../tools/pdf/kafka-retries.data.mjs';
import {sheet as kafkaTransactions} from '../tools/pdf/kafka-transactions.data.mjs';
import {sheet as kafkaObservability} from '../tools/pdf/kafka-observability.data.mjs';
import {sheet as kafkaPipeline} from '../tools/pdf/kafka-pipeline.data.mjs';
import {sheet as kafkaChallenge} from '../tools/pdf/kafka-challenge.data.mjs';
import {sheet as cc01} from '../tools/pdf/cc-01-harness.data.mjs';
import {sheet as cc02} from '../tools/pdf/cc-02-context.data.mjs';
import {sheet as cc03} from '../tools/pdf/cc-03-sessions.data.mjs';
import {sheet as cc04} from '../tools/pdf/cc-04-blast-radius.data.mjs';
import {sheet as cc05} from '../tools/pdf/cc-05-model-effort.data.mjs';
import {sheet as cc06} from '../tools/pdf/cc-06-skills.data.mjs';
import {sheet as cc07} from '../tools/pdf/cc-07-mcp.data.mjs';
import {sheet as cc08} from '../tools/pdf/cc-08-subagents.data.mjs';
import {sheet as cc09} from '../tools/pdf/cc-09-working-day.data.mjs';
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
  ['kafka offsets', kafkaOffsets],
  ['kafka idempotency', kafkaIdempotency],
  ['kafka retries', kafkaRetries],
  ['kafka transactions', kafkaTransactions],
  ['kafka observability', kafkaObservability],
  ['kafka pipeline', kafkaPipeline],
  ['kafka challenge', kafkaChallenge],
  ['claude code 01', cc01],
  ['claude code 02', cc02],
  ['claude code 03', cc03],
  ['claude code 04', cc04],
  ['claude code 05', cc05],
  ['claude code 06', cc06],
  ['claude code 07', cc07],
  ['claude code 08', cc08],
  ['claude code 09', cc09],
];

/** The Claude Code sheets, for the rules specific to that series. */
const CC_SHEETS = SHEETS.filter(([name]) => name.startsWith('claude code'));

/** The seven Kafka series sheets, for the rules that are specific to them. */
const KAFKA_SHEETS = SHEETS.filter(([name]) => name.startsWith('kafka'));

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

/**
 * ============================================================================
 * THE RULES EVERY KAFKA SERIES SHEET INHERITS
 * ============================================================================
 *
 * Seven sheets arrived in one sitting. That is exactly the situation where a
 * rule enforced by reading carefully stops being enforced, so each rule the
 * claim checks established is written down here as a test instead.
 *
 * Every one of these corresponds to a decision recorded in
 * production/episode-kafka-NN-claims.md in the video project. Where a claims
 * doc says "not asserted, deliberately", there is a test below making sure a
 * later edit cannot quietly assert it.
 */

test('every sheet sources every claim, and only to something nameable', () => {
  // The allow list is the whole point. A claim sourced to "common knowledge"
  // is a rumour with a citation shaped box drawn around it.
  const allowed =
    /postgresql|kafka|kip-\d+|prometheus|youtube|gsma|literature|first principles|operational practice|xa specification|standard statistics|claude code docs|claude\.com/i;
  for (const [name, s] of SHEETS) {
    for (const section of s.sections) {
      assert.ok((section.claims ?? []).length > 0, `${name}/${section.id} has no claims at all`);
      for (const claim of section.claims) {
        assert.ok(claim.text?.trim().length > 0, `${name}/${section.id}: empty claim`);
        assert.match(claim.source, allowed, `${name}/${section.id}: unrecognised source "${claim.source}"`);
      }
    }
  }
});

test('a source that is not documentation says so in its own name', () => {
  // "First principles" and "operational practice" are honest labels. The
  // failure this prevents is a judgement being dressed as a vendor fact by
  // giving it a source that merely sounds official.
  // A judgement source names what it is NOT: "not vendor documentation",
  // "not the PostgreSQL manual", "stated as such". That disclaimer is the
  // whole signal, so the pattern looks for the family of labels that carry it.
  const judgement = /first principles|operational practice|standard statistics|literature/i;
  const vendor = /postgresql \d|kafka \d|kip-\d+|prometheus|xa specification|claude code docs|claude\.com/i;
  for (const [name, s] of SHEETS) {
    for (const section of s.sections) {
      for (const claim of section.claims ?? []) {
        const isJudgement = judgement.test(claim.source);
        const isVendor = vendor.test(claim.source);
        assert.ok(
          isJudgement !== isVendor,
          `${name}/${section.id}: source "${claim.source}" is both or neither`,
        );
      }
    }
  }
});

test('every sheet labels its figures as interview assumptions, not measurements', () => {
  // The wallet sheet had this checked. The seven that followed did not, and
  // an unlabelled table of numbers reads as data from a real deployment.
  for (const [name, s] of SHEETS) {
    assert.match(s.scale.note, /interview assumption/i, `${name} does not label its figures`);
    // The two families of sheet disclaim different things: the wallet sheet
    // names companies, the Kafka sheets name deployments. Both must disclaim
    // SOMETHING, and neither wording is the canonical one.
    assert.match(s.scale.note, /no claim is made/i, `${name} does not disclaim the figures`);
  }
});

test('every Kafka sheet links to its own runnable module, not just the repo root', () => {
  // Sam's rule: the code in GitHub is runnable and testable end to end. A link
  // to the repo root makes the reader hunt for which module this episode is.
  for (const [name, s] of KAFKA_SHEETS) {
    const repo = s.links.find((l) => /runnable code/i.test(l.label));
    assert.ok(repo, `${name} has no runnable code link`);
    assert.match(repo.url, /^https:\/\/github\.com\/code-with-sam-dev\/kafka-payments\/tree\/main\/.+/,
      `${name} runnable code link does not point at a module`);
  }
});

test('no two sheets share a title or a strapline', () => {
  // Nine PDFs in one downloads folder. Two with the same cover line is how a
  // reader ends up with the wrong one open during an interview.
  for (const field of ['title', 'strapline']) {
    const seen = new Map();
    for (const [name, s] of SHEETS) {
      const value = s[field];
      assert.ok(!seen.has(value), `${name} and ${seen.get(value)} share a ${field}: "${value}"`);
      seen.set(value, name);
    }
  }
});

test('every sheet says what it is NOT covering', () => {
  // Saying what you are not covering is itself the senior move the sheets
  // teach. A sheet that scopes nothing out is claiming to cover everything.
  for (const [name, s] of SHEETS) {
    assert.ok(s.scope.out.length >= 3, `${name} scopes out fewer than three things`);
  }
});

test('every built sheet is a real PDF of a plausible size', async () => {
  const {SHEETS: BUILT} = await import('../tools/pdf/built.mjs');
  for (const [name, path] of Object.entries(BUILT)) {
    let info;
    try {
      info = await stat(path);
    } catch {
      assert.fail(`${path} has not been built. Run: npm run build:pdf all`);
    }
    const head = (await readFile(path)).subarray(0, 5).toString('latin1');
    assert.equal(head, '%PDF-', `${name} output is not a PDF`);
    assert.ok(info.size > 20_000, `${name} PDF is suspiciously small at ${info.size} bytes`);
  }
});

/*
  The claims docs each recorded something deliberately NOT asserted. Those are
  the easiest things in the world for a later edit to add back in good faith,
  which is why each one gets a test rather than a comment.
*/

test('the retries sheet recommends no specific retry count', () => {
  // Episode 6 claim check: "A sheet that said 'use three retries' would be
  // inventing a default that does not exist." The whole argument is that the
  // exit condition is a business question.
  const rendered = renderHtml(kafkaRetries);
  assert.ok(!/use (three|3|five|5) retries/i.test(rendered), 'a retry count is being recommended');
  assert.ok(!/retry (three|3|five|5) times/i.test(rendered), 'a retry count is being recommended');
  assert.match(rendered, /no universally correct retry count/i,
    'the sheet should say out loud that no correct count exists');
});

test('the retries sheet makes a claim about effort, not about framework defaults', () => {
  // Framework defaults are version specific and rot fastest. The sheet names
  // no framework behaviour at all.
  const rendered = renderHtml(kafkaRetries);
  assert.ok(!/by default,? spring/i.test(rendered), 'asserts a Spring Kafka default');
  assert.ok(!/DefaultErrorHandler/.test(rendered), 'names a specific framework class behaviour');
});

test('the transactions sheet asserts nothing about transactional.id fencing', () => {
  // Episode 7 claim check: fencing semantics per version were NOT verified, so
  // they are absent rather than hedged. Absence here is a choice, and this
  // test is what keeps it a choice rather than an oversight.
  // Saying "fencing is out of scope" is the sheet doing its job. Asserting how
  // fencing BEHAVES is the thing that was never verified. So the word is
  // allowed in the scope list and nowhere else.
  const scopedOut = kafkaTransactions.scope.out.join(' ');
  assert.match(scopedOut, /fenc/i, 'fencing should be named as out of scope');
  assert.match(scopedOut, /not verified for this sheet/i,
    'the sheet should say why fencing is out of scope');
  for (const section of kafkaTransactions.sections) {
    const prose = [...section.body, ...(section.claims ?? []).map((c) => c.text)].join(' ');
    assert.ok(!/fenc/i.test(prose),
      `${section.id} asserts something about fencing, which was never verified`);
  }
});

test('the transactions sheet names no CDC product', () => {
  // Named products, versions and configurations go stale fastest, and the
  // polling versus log reading argument survives without any of them.
  const rendered = renderHtml(kafkaTransactions);
  for (const product of ['Debezium', 'Maxwell', 'Kafka Connect']) {
    assert.ok(!rendered.includes(product), `names ${product}, which will date the sheet`);
  }
});

test('the transactions sheet says the outbox is at-least-once publication', () => {
  // The part most explanations skip, and the strongest single signal in an
  // answer on this topic. If an edit removes it the sheet becomes ordinary.
  const rendered = renderHtml(kafkaTransactions);
  assert.match(rendered, /does not give you exactly-once publication/i);
  assert.match(rendered, /at-least-once publication/i);
});

test('the observability sheet names no dashboard, exporter or metric path', () => {
  // Episode 8 claim check: community dashboard IDs get deleted, renumbered and
  // abandoned. The five panels are described instead.
  const rendered = renderHtml(kafkaObservability);
  assert.ok(!/dashboard (id|#)\s*\d+/i.test(rendered), 'names a dashboard ID');
  assert.ok(!/kafka\.consumer:type=/i.test(rendered), 'contains a copy-paste JMX path');
  assert.ok(!/grafana/i.test(rendered), 'names a dashboard product');
});

test('the observability sheet keeps the percentile aggregation warning', () => {
  // The subtlest correct thing in the episode, and the one an editor trimming
  // for length would cut first.
  const rendered = renderHtml(kafkaObservability);
  assert.match(rendered, /averaging those three does not give you the system wide p95/i);
});

test('the challenge sheet keeps the ending that tells you not to build it all', () => {
  // Episode 10 claim check, the scene to protect: a series that ends by telling
  // you to use everything it taught is selling rather than teaching.
  const rendered = renderHtml(kafkaChallenge);
  assert.match(rendered, /do not copy every mechanism in this series/i);
  assert.match(rendered, /does not need a payments architecture/i);
});

test('the challenge sheet gets the partition count direction right', () => {
  // Increased, never decreased, and increasing it re-maps existing keys. Both
  // halves, because the second is the one that makes it the best question.
  const rendered = renderHtml(kafkaChallenge);
  assert.match(rendered, /increased but never decreased/i);
  assert.match(rendered, /changing the count changes where existing keys land/i);
});

test('the idempotency sheet keeps the hedges that were checked and kept', () => {
  // "can make this pattern practical", not "solves it". And "cannot normally
  // make that remote charge atomic", where normally is doing real work.
  const rendered = renderHtml(kafkaIdempotency);
  assert.match(rendered, /practical/i);
  assert.ok(!/on conflict.{0,40}solves (it|the problem)/i.test(rendered),
    'overstates what conflict-aware insert does');
  assert.match(rendered, /cannot normally make/i, 'the remote atomicity hedge is gone');
});

test('the offsets sheet dates every Kafka default it states', () => {
  // Four defaults, and a default is the fastest thing in any document to
  // become quietly wrong. Sam's rule: date the claim out loud.
  const rendered = renderHtml(kafkaOffsets);
  assert.match(rendered, /September 2026/);
  for (const setting of ['enable.auto.commit', 'auto.commit.interval.ms', 'isolation.level', 'enable.idempotence']) {
    assert.ok(rendered.includes(setting), `${setting} is not stated`);
  }
});

test('the offsets sheet finishes the at-most-once sentence', () => {
  // The half most answers drop: at-most-once needs producer retries disabled
  // AS WELL AS committing before processing. Kafka's own wording says both.
  const rendered = renderHtml(kafkaOffsets);
  assert.match(rendered, /disabling retries on the producer/i);
});

test('the pipeline sheet credits combinations, not single features', () => {
  // The honest through line, and the reason the episode is not a recap.
  const rendered = renderHtml(kafkaPipeline);
  assert.match(rendered, /No single feature makes a pipeline reliable/i);
  assert.match(rendered, /survived by a combination rather than by a single mechanism/i);
});

test('the observability sheet does not claim the p99 catches a one in a hundred tail', () => {
  // Written the popular way first, and the arithmetic refused it: with one bad
  // request in a hundred the p99 sits at the ninety ninth of a hundred sorted
  // observations and the slow one is the hundredth. The episode-08 repo module
  // asserts the same thing in Java. Corrected here rather than softened,
  // because "the average hides it and the p99 shows it" is repeated everywhere
  // and is wrong at that ratio.
  const rendered = renderHtml(kafkaObservability);
  assert.ok(!/the p99 says somebody had a terrible time/i.test(rendered),
    'the sheet claims the p99 sees a one in a hundred tail');
  assert.match(rendered, /p99\.9, or the maximum|p99\.9 or the maximum/i,
    'the sheet should name a percentile that can actually reach the tail');
});


/**
 * ============================================================================
 * THE RULES EVERY CLAUDE CODE SHEET INHERITS
 * ============================================================================
 *
 * This series rots faster than Kafka does. Half the documentation pages these
 * sheets cite changed this year, and a design sheet outlives the release it
 * was written against by a long way. So the perishability rules are enforced
 * rather than remembered.
 */

test('every Claude Code sheet says it is unofficial and reproduces no artwork', () => {
  // The channel is not affiliated with Anthropic, and a sheet that looked
  // official would be the single most damaging thing this series could ship.
  for (const [name, s] of CC_SHEETS) {
    assert.match(s.trademarks, /independent, unofficial/i, `${name} does not say it is unofficial`);
    assert.match(s.trademarks, /not affiliated with, endorsed by, or sponsored by Anthropic/i,
      `${name} does not disclaim affiliation`);
    assert.match(s.trademarks, /no Anthropic artwork is\s+reproduced/i,
      `${name} does not state that no artwork is reproduced`);
  }
});

test('every Claude Code sheet warns that its facts expire', () => {
  // Kafka 4.3 will still be Kafka 4.3 next month. This will not.
  for (const [name, s] of CC_SHEETS) {
    const intro = s.intro.join(' ');
    assert.match(intro, /changes with every release/i, `${name} does not warn that it expires`);
    assert.match(intro, /check the current documentation/i,
      `${name} does not tell the reader to re-check`);
  }
});

test('every Claude Code source names a docs page or admits it is a judgement', () => {
  const docsPage = /claude code docs, .+, checked \w+ \d{4}/i;
  const judgement = /first principles|operational practice/i;
  const external = /claude\.com/i;

  for (const [name, s] of CC_SHEETS) {
    for (const section of s.sections) {
      for (const claim of section.claims ?? []) {
        const ok = docsPage.test(claim.source) || judgement.test(claim.source)
          || external.test(claim.source);
        assert.ok(ok, `${name}/${section.id}: "${claim.source}" names neither a page nor a judgement`);
      }
    }
  }
});

test('every Claude Code sheet carries the date inside its sources, not only at the foot', () => {
  // A sheet gets separated from its footer: printed, cropped, screenshotted.
  // Each documented claim carries its own "checked September 2026" so a single
  // citation still dates itself.
  for (const [name, s] of CC_SHEETS) {
    const documented = s.sections
      .flatMap((section) => section.claims ?? [])
      .filter((claim) => /claude code docs/i.test(claim.source));
    assert.ok(documented.length > 0, `${name} cites no documentation at all`);
    for (const claim of documented) {
      assert.match(claim.source, /checked \w+ \d{4}/i,
        `${name}: a documentation source carries no date`);
    }
  }
});

test('every Claude Code sheet links to the official docs, not only to the channel', () => {
  for (const [name, s] of CC_SHEETS) {
    const docs = s.links.find((l) => /code\.claude\.com/.test(l.url));
    assert.ok(docs, `${name} does not link to the official documentation`);
  }
});
