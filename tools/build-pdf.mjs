#!/usr/bin/env node
/**
 * Builds the design sheet PDF with headless Chrome.
 *
 * Chrome rather than a PDF library, for one reason: the sheet has to look like
 * the videos, and the videos are already defined by CSS-shaped tokens. Driving
 * a layout engine that understands @page, page-break-inside and web fonts is
 * the difference between matching the channel and approximating it.
 *
 * The intermediate HTML is written next to the PDF and kept, so a rendering
 * problem can be opened in a browser and looked at rather than guessed at.
 */
import {writeFile, mkdir, rm, rename} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {dirname, resolve} from 'node:path';

import {readFile} from 'node:fs/promises';

import {renderHtml} from './pdf/render.mjs';

/**
 * Which sheet to build.
 *
 * Was hard coded to the wallet one, which was fine while there was exactly
 * one. Sam's rule is that EVERY episode gets a sheet, so the sheet is an
 * argument now:
 *
 *     npm run build:pdf                     the wallet sheet, as before
 *     npm run build:pdf kafka-rebalancing   episode 3
 *
 * Each sheet is a data module in tools/pdf/, and the output filename is
 * derived from the same name, so adding a sheet means adding one file.
 */
const SHEETS = {
  'digital-wallet': {
    data: './pdf/design-sheet.data.mjs',
    out: 'public/downloads/digital-wallet-design-sheet.pdf',
  },
  'kafka-rebalancing': {
    data: './pdf/kafka-rebalancing.data.mjs',
    out: 'public/downloads/kafka-rebalancing-design-sheet.pdf',
  },
  'kafka-offsets': {
    data: './pdf/kafka-offsets.data.mjs',
    out: 'public/downloads/kafka-offsets-design-sheet.pdf',
  },
  'kafka-idempotency': {
    data: './pdf/kafka-idempotency.data.mjs',
    out: 'public/downloads/kafka-idempotency-design-sheet.pdf',
  },
  'kafka-retries': {
    data: './pdf/kafka-retries.data.mjs',
    out: 'public/downloads/kafka-retries-design-sheet.pdf',
  },
  'kafka-transactions': {
    data: './pdf/kafka-transactions.data.mjs',
    out: 'public/downloads/kafka-transactions-design-sheet.pdf',
  },
  'kafka-observability': {
    data: './pdf/kafka-observability.data.mjs',
    out: 'public/downloads/kafka-observability-design-sheet.pdf',
  },
  'kafka-pipeline': {
    data: './pdf/kafka-pipeline.data.mjs',
    out: 'public/downloads/kafka-pipeline-design-sheet.pdf',
  },
  'kafka-challenge': {
    data: './pdf/kafka-challenge.data.mjs',
    out: 'public/downloads/kafka-challenge-design-sheet.pdf',
  },

  // The Claude Code series. Sam, 2026-09-13: "PDF sheets are important for
  // each episode." Same pattern as the Kafka sheets, with one difference that
  // matters: every claim is dated on the page, because this subject changes
  // with every release and a sheet outlives the version it describes.
  'cc-01-harness': {
    data: './pdf/cc-01-harness.data.mjs',
    out: 'public/downloads/claude-code-01-harness.pdf',
  },
  'cc-02-context': {
    data: './pdf/cc-02-context.data.mjs',
    out: 'public/downloads/claude-code-02-context.pdf',
  },
  'cc-03-sessions': {
    data: './pdf/cc-03-sessions.data.mjs',
    out: 'public/downloads/claude-code-03-sessions.pdf',
  },
  'cc-04-blast-radius': {
    data: './pdf/cc-04-blast-radius.data.mjs',
    out: 'public/downloads/claude-code-04-blast-radius.pdf',
  },
  'cc-05-model-effort': {
    data: './pdf/cc-05-model-effort.data.mjs',
    out: 'public/downloads/claude-code-05-model-effort.pdf',
  },
  'cc-06-skills': {
    data: './pdf/cc-06-skills.data.mjs',
    out: 'public/downloads/claude-code-06-skills.pdf',
  },
  'cc-07-mcp': {
    data: './pdf/cc-07-mcp.data.mjs',
    out: 'public/downloads/claude-code-07-mcp.pdf',
  },
  'cc-08-subagents': {
    data: './pdf/cc-08-subagents.data.mjs',
    out: 'public/downloads/claude-code-08-subagents.pdf',
  },
  'cc-09-working-day': {
    data: './pdf/cc-09-working-day.data.mjs',
    out: 'public/downloads/claude-code-09-working-day.pdf',
  },
  'cc-10-token-economy': {
    data: './pdf/cc-10-token-economy.data.mjs',
    out: 'public/downloads/claude-code-10-token-economy.pdf',
  },
  'cc-11-chrome': {
    data: './pdf/cc-11-chrome.data.mjs',
    out: 'public/downloads/claude-code-advanced-01-chrome.pdf',
  },
  'cc-12-anywhere': {
    data: './pdf/cc-12-anywhere.data.mjs',
    out: 'public/downloads/claude-code-advanced-02-anywhere.pdf',
  },
  'cc-13-limits': {
    data: './pdf/cc-13-limits.data.mjs',
    out: 'public/downloads/claude-code-advanced-03-limits.pdf',
  },
  'cc-14-schedule': {
    data: './pdf/cc-14-schedule.data.mjs',
    out: 'public/downloads/claude-code-advanced-04-schedule.pdf',
  },
  'cc-16-two-models': {
    data: './pdf/cc-16-two-models.data.mjs',
    out: 'public/downloads/claude-code-advanced-06-two-models.pdf',
  },

  // Modern Java. Same pattern, with the perishability note the Claude Code
  // sheets carry, for the same reason: a version claim is true for months and
  // a sheet lives for years.
  'modern-java': {
    data: './pdf/modern-java.data.mjs',
    out: 'public/downloads/modern-java-design-sheet.pdf',
  },

  // The craft sheets: episodes about how to work rather than about a
  // technology. Their shared module carries an ATTRIBUTION notice rather than
  // a trademark one, because a craft sheet quotes research instead of naming a
  // product.
  'while-ai-writes': {
    data: './pdf/while-ai-writes.data.mjs',
    out: 'public/downloads/while-the-ai-writes-the-code.pdf',
  },
  'tdd-java': {
    data: './pdf/tdd-java.data.mjs',
    out: 'public/downloads/tdd-for-java-design-sheet.pdf',
  },
  'ejb-to-spring': {
    data: './pdf/ejb-to-spring.data.mjs',
    out: 'public/downloads/ejb-to-spring-design-sheet.pdf',
  },
  'distributed-transactions': {
    data: './pdf/distributed-transactions.data.mjs',
    out: 'public/downloads/distributed-transactions-design-sheet.pdf',
  },
};

const NAME = process.argv[2] ?? 'digital-wallet';

/**
 * "all" builds every sheet, one child process each.
 *
 * A child per sheet rather than a loop in here, because the output paths are
 * resolved once at module scope and threading them through would be a rewrite
 * of a script that works. Nine sheets is also the point at which building them
 * one command at a time stops being reasonable, and a sheet that only gets
 * rebuilt when somebody remembers it is a sheet that goes stale.
 */
if (NAME === 'all') {
  const {spawnSync} = await import('node:child_process');
  let failed = 0;
  for (const key of Object.keys(SHEETS)) {
    const result = spawnSync(process.execPath, [process.argv[1], key], {stdio: 'inherit'});
    if (result.status !== 0) {
      console.error(`FAILED: ${key}`);
      failed += 1;
    }
  }
  console.log(failed === 0 ? `All ${Object.keys(SHEETS).length} sheets built.` : `${failed} sheet(s) failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

if (!SHEETS[NAME]) {
  console.error(`Unknown sheet "${NAME}". Known: ${Object.keys(SHEETS).join(', ')}`);
  process.exit(1);
}

/**
 * The channel mark, inlined as a data URI.
 *
 * Embedded rather than linked so the PDF is self contained: nothing to fetch
 * at print time, and nothing to break if the file is ever moved. It is the
 * same crop the videos use, from motion/public/sam-mark.png, so the mark on
 * the sheet and the mark in the corner of every frame are the same image.
 */
const AVATAR = 'public/sam-mark.png';

const run = promisify(execFile);

const OUT_PDF = SHEETS[NAME].out;
const OUT_HTML = `tools/pdf/.build/${NAME}.html`;

/** Where Chrome lives on this machine, in order of preference. */
const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

async function chromePath() {
  const {existsSync} = await import('node:fs');
  const found = CHROME.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'No Chrome or Chromium found. The PDF is built by a real browser so it ' +
        'matches the video styling. Install Chrome, or add its path to CHROME in this file.'
    );
  }
  return found;
}

/**
 * Marks the PDF as not modifiable.
 *
 * Be clear about what this is and is not. It sets the PDF permission flags,
 * which well behaved readers such as Preview and Acrobat honour: the document
 * opens with no password, but editing, annotating and form filling are refused.
 *
 * It is NOT security. The flags live inside a file the reader fully controls,
 * and anyone who wants to strip them can do so in seconds with the same tool
 * used here. Treat it as a "do not scribble on this" sign, not a lock.
 *
 * Printing and text extraction stay allowed on purpose. Blocking extraction
 * breaks screen readers, and punishing every blind reader to inconvenience a
 * plagiarist is a bad trade.
 *
 * The owner password is random and thrown away, because nothing should ever
 * need it: the document's source of truth is design-sheet.data.mjs in this
 * repository, and editing means changing that file and rebuilding.
 */
async function restrictEditing() {
  const tmp = `${OUT_PDF}.restricted`;
  const owner = randomBytes(24).toString('base64url');
  try {
    await run('qpdf', [
      '--encrypt', '', owner, '256',
      '--modify=none',
      '--annotate=n',
      '--form=n',
      '--print=full',
      '--extract=y',
      '--accessibility=y',
      '--', OUT_PDF, tmp,
    ]);
    await rename(tmp, OUT_PDF);
    console.log('Permissions set: opens freely, editing and annotation refused.');
  } catch (error) {
    await rm(tmp, {force: true});
    // Not fatal. A sheet without the flag is still a correct sheet, and
    // failing the whole build over a "do not scribble" sign would be silly.
    console.warn(`Could not set PDF permissions (${error.message.split('\n')[0]}).`);
    console.warn('Install qpdf to enable this. The PDF itself is fine.');
  }
}

async function main() {
  await mkdir(dirname(OUT_HTML), {recursive: true});
  await mkdir(dirname(OUT_PDF), {recursive: true});

  const {sheet} = await import(SHEETS[NAME].data);
  const avatar = (await readFile(AVATAR)).toString('base64');
  const html = renderHtml(sheet, {avatarDataUri: `data:image/png;base64,${avatar}`});
  await writeFile(OUT_HTML, html);

  // Remove any previous output first. Chrome leaves the old file in place when
  // it fails, which would let a stale PDF pass the tests and get published.
  await rm(OUT_PDF, {force: true});

  const chrome = await chromePath();
  await run(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    // Google Fonts are fetched over the network, so give the page time to get
    // them. Without this the PDF silently falls back to a system face and
    // stops looking like the channel.
    '--virtual-time-budget=12000',
    `--print-to-pdf=${resolve(OUT_PDF)}`,
    `file://${resolve(OUT_HTML)}`,
  ]);

  await restrictEditing();

  const {stat} = await import('node:fs/promises');
  const {size} = await stat(OUT_PDF);
  console.log(`${OUT_PDF} written, ${(size / 1024).toFixed(0)} KB`);
  console.log(`Source HTML kept at ${OUT_HTML} for inspection.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
