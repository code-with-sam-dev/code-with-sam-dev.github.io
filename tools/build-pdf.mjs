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
};

const NAME = process.argv[2] ?? 'digital-wallet';
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
