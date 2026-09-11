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
import {writeFile, mkdir, rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {dirname, resolve} from 'node:path';

import {sheet} from './pdf/design-sheet.data.mjs';
import {renderHtml} from './pdf/render.mjs';

const run = promisify(execFile);

const OUT_PDF = 'public/downloads/digital-wallet-design-sheet.pdf';
const OUT_HTML = 'tools/pdf/.build/design-sheet.html';

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

async function main() {
  await mkdir(dirname(OUT_HTML), {recursive: true});
  await mkdir(dirname(OUT_PDF), {recursive: true});

  const html = renderHtml(sheet);
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

  const {stat} = await import('node:fs/promises');
  const {size} = await stat(OUT_PDF);
  console.log(`${OUT_PDF} written, ${(size / 1024).toFixed(0)} KB`);
  console.log(`Source HTML kept at ${OUT_HTML} for inspection.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
