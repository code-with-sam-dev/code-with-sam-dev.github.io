/**
 * Data to print-ready HTML.
 *
 * Pure on purpose: it takes the sheet and returns a string, so the tests can
 * check the document without launching a browser. The only impure step in the
 * whole pipeline is Chrome turning this into a PDF.
 *
 * The palette and typefaces are the SAME tokens the Remotion renders use
 * (motion/src/theme.ts and motion/src/fonts.ts), copied deliberately rather
 * than approximated. Sam asked for the same look and feel as the video, and a
 * near miss on brand colour is worse than no attempt: it reads as a knock-off
 * of his own channel.
 */

const COLOR = {
  bg: '#FBFBF9',
  ink: '#12161F',
  inkSoft: '#5A6473',
  primary: '#7C5CFF',
  primarySoft: '#E8E3FF',
  secondary: '#12A87A',
  secondarySoft: '#D6F2E8',
  warn: '#D93A3A',
  hairline: '#D9DDE4',
};

/** Text going into markup, never trusted to be free of angle brackets. */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

import {architectureSvg} from './diagram.mjs';

const claim = (c) => `
  <div class="claim">
    <p>${esc(c.text)}</p>
    <span class="src">${esc(c.source)}</span>
  </div>`;

const section = (s, index) => `
  <section class="sec">
    <h2><span class="num">${String(index + 3).padStart(2, '0')}</span>${esc(s.title)}</h2>
    ${(s.body ?? []).map((p) => `<p class="body">${esc(p)}</p>`).join('')}
    ${(s.claims ?? []).map(claim).join('')}
  </section>`;

export function renderHtml(sheet, {avatarDataUri = ''} = {}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(sheet.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 15mm 15mm 14mm; }

  :root {
    --bg: ${COLOR.bg};
    --ink: ${COLOR.ink};
    --ink-soft: ${COLOR.inkSoft};
    --primary: ${COLOR.primary};
    --primary-soft: ${COLOR.primarySoft};
    --secondary: ${COLOR.secondary};
    --secondary-soft: ${COLOR.secondarySoft};
    --warn: ${COLOR.warn};
    --hairline: ${COLOR.hairline};
  }

  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 400 10.2pt/1.55 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  h1, h2, h3, .kicker, .big { font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif; }

  /*
    Persistent channel marks, on every page.

    In Chrome's print pipeline a position:fixed element is painted onto each
    page, which is what makes a repeating watermark possible without a PDF
    library stamping it afterwards.

    Two marks, deliberately, and they mirror the video:
      .stamp      small dark wordmark in the top right, always present, never
                  decorative. The visual style guide specifies exactly this for
                  the videos, so the sheet carries the same furniture.
      .watermark  a large diagonal wordmark at very low contrast, sitting
                  behind the text. Low enough to read through, present enough
                  that a screenshot of any page is obviously from this channel.
  */
  /*
    Repeating page furniture, done with a table rather than position:fixed.

    The obvious approach, a fixed element, does not survive Chrome's paged
    layout: the marks resolved against the wrong box and landed ON the body
    text, in the wrong margins. A thead and tfoot are repeated on every page by
    every print engine, which is the oldest and still the only reliable way to
    get a running header and footer out of HTML.

    Sam asked for a channel watermark, then for it not to be excessive and for
    the sheet to still read cleanly. Those pull against each other: anything
    set behind body copy large enough to survive a screenshot also makes the
    text harder to read, and this is a document someone may have open during a
    real interview. So the mark is persistent rather than loud, and it lives in
    the running header and footer where it can never touch a line of text.
  */
  table.page { width: 100%; border-collapse: collapse; }
  table.page > thead, table.page > tfoot { display: table-header-group; }
  table.page > tfoot { display: table-footer-group; }
  table.page > thead th, table.page > tfoot td { border: 0; padding: 0; font-weight: 400; }

  /* The channel lockup: cartoon head plus wordmark, same as the videos carry
     in the corner of every frame. Sam asked for the cartoon specifically, for
     consistency across his content, so the mark here is the identical crop the
     Remotion component uses rather than a lookalike. */
  .brand { display: flex; align-items: center; gap: 2.2mm; justify-content: flex-end; }
  .brand img {
    width: 7mm; height: 7mm; border-radius: 999px;
    border: .7mm solid var(--ink); object-fit: cover; display: block;
  }
  .brand b {
    font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    font-size: 9pt; letter-spacing: -.01em; color: var(--ink); text-transform: none;
  }

  /* The board gets its own page and the full width. It is the one thing in
     here somebody will screenshot, so it is not squeezed beside prose. */
  .board-page { page-break-after: always; page-break-inside: avoid; }
  svg.board { width: 100%; height: auto; display: block; }
  .board-note { margin: 4mm 0 0; color: var(--ink-soft); font-size: 9pt; }
  .footmark a { color: var(--ink-soft); text-decoration: none; }
  .footmark a:hover { text-decoration: underline; }
  .footmark .yt { color: var(--primary); font-weight: 600; }

  .stamp {
    text-align: right; padding-bottom: 5mm !important;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    font-size: 8pt; letter-spacing: .1em; text-transform: uppercase;
    color: var(--ink);
  }
  .stamp span { color: var(--primary); }

  .footmark {
    padding-top: 4mm !important; border-top: 1px solid var(--hairline) !important;
    font-size: 7.4pt; color: var(--ink-soft);
  }
  .footmark div { display: flex; justify-content: space-between; align-items: baseline; }
  .footmark b { font-weight: 600; color: var(--ink); }

  /* ---------- cover ---------- */
  .cover { page-break-after: always; padding-top: 6mm; }
  .kicker {
    font-weight: 700; font-size: 8.6pt; letter-spacing: .16em; text-transform: uppercase;
    color: var(--primary); margin: 0 0 10mm;
  }
  h1 { font-size: 31pt; line-height: 1.05; margin: 0 0 4mm; font-weight: 700; letter-spacing: -.01em; }
  .sub { font-size: 13pt; color: var(--primary); font-weight: 600; margin: 0 0 9mm; font-family: 'Space Grotesk', sans-serif; }
  .strap {
    border-left: 3px solid var(--primary); padding: 3mm 0 3mm 5mm;
    font-size: 12pt; color: var(--ink); margin: 0 0 9mm;
  }
  .intro p { margin: 0 0 3.4mm; max-width: 155mm; }

  /* ---------- scope ---------- */
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 7mm; margin: 8mm 0 0; }
  .panel { border: 1px solid var(--hairline); border-radius: 3mm; padding: 5mm; background: #fff; }
  .panel.in { border-color: var(--secondary); background: var(--secondary-soft); }
  .panel.out { border-color: var(--hairline); }
  .panel h3 { margin: 0 0 3mm; font-size: 11pt; }
  .panel.in h3 { color: var(--secondary); }
  .panel.out h3 { color: var(--ink-soft); }
  .panel ul { margin: 0; padding-left: 4.5mm; }
  .panel li { margin-bottom: 1.8mm; }
  .scope-note { margin: 5mm 0 0; color: var(--ink-soft); font-size: 9.4pt; }

  /* ---------- scale ---------- */
  table.scale { border-collapse: collapse; width: 100%; margin: 3mm 0 0; }
  table.scale td { padding: 2mm 0; border-bottom: 1px solid var(--hairline); }
  table.scale td:last-child { text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 9.4pt; }
  .assume {
    margin: 4mm 0 0; padding: 4mm; border-radius: 2.5mm;
    background: var(--primary-soft); color: var(--ink); font-size: 9.4pt;
  }

  /* ---------- sections ---------- */
  .sec { page-break-inside: avoid; margin: 0 0 9mm; }
  h2 { font-size: 15pt; margin: 0 0 3.5mm; display: flex; align-items: baseline; gap: 4mm; }
  .num { color: var(--primary); font-size: 11pt; font-weight: 700; }
  p.body { margin: 0 0 3mm; max-width: 160mm; }

  .claim {
    border-left: 2px solid var(--hairline); padding: 0 0 0 5mm;
    margin: 0 0 4mm; page-break-inside: avoid;
  }
  .claim p { margin: 0 0 1.4mm; }
  .src {
    font-family: 'JetBrains Mono', monospace; font-size: 7.8pt;
    color: var(--ink-soft); letter-spacing: .01em;
  }

  /* ---------- checklist ---------- */
  .check { border: 1px solid var(--primary); border-radius: 3mm; padding: 6mm; background: #fff; page-break-inside: avoid; }
  .check h2 { color: var(--primary); }
  .check ol { margin: 0; padding-left: 5mm; }
  .check li { margin-bottom: 2.2mm; }

  /* ---------- footer ---------- */
  /* Kept whole. A link block split across a page boundary means half of Sam's
     accounts are on a page nobody scrolls to. */
  .links { margin: 8mm 0 0; border-top: 1px solid var(--hairline); padding-top: 5mm; page-break-inside: avoid; }
  .links h3 { font-size: 10pt; margin: 0 0 3mm; }
  .links ul { list-style: none; margin: 0; padding: 0; column-count: 2; column-gap: 8mm; }
  .links li { margin-bottom: 1.6mm; font-size: 9.2pt; break-inside: avoid; }
  .links b { font-weight: 600; }
  .links a { color: var(--primary); text-decoration: none; word-break: break-all; }
  .closing { margin: 6mm 0 0; font-size: 10pt; }
  .verified { margin: 4mm 0 0; color: var(--ink-soft); font-size: 8.6pt; }
</style>
</head>
<body>

<table class="page">
<thead><tr><th class="stamp">
  <span class="brand">${avatarDataUri ? `<img src="${avatarDataUri}" alt="">` : ''}<b>Code with Sam</b></span>
</th></tr></thead>
<tfoot><tr><td class="footmark"><div>
  <span><b>${esc(sheet.channel)}</b> &middot; <a href="${esc(sheet.siteUrl)}">${esc(
    sheet.siteUrl.replace('https://', '')
  )}</a></span>
  <span><a class="yt" href="${esc(sheet.video.url)}">${esc(sheet.video.label)}</a></span>
</div></td></tr></tfoot>
<tbody><tr><td>

<div class="cover">
  <p class="kicker">${esc(sheet.kicker)}</p>
  <h1>${esc(sheet.title)}</h1>
  <p class="sub">${esc(sheet.subtitle)}</p>
  <p class="strap">${esc(sheet.strapline)}</p>
  <div class="intro">${sheet.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</div>

  <div class="cols">
    <div class="panel in">
      <h3>${esc(sheet.scope.inTitle)}</h3>
      <ul>${sheet.scope.in.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
    <div class="panel out">
      <h3>${esc(sheet.scope.outTitle)}</h3>
      <ul>${sheet.scope.out.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  </div>
  <p class="scope-note">${esc(sheet.scope.note)}</p>

</div>

<div class="board-page">
  ${
    /*
      THE BOARD IS PER SHEET, AND OPTIONAL.

      It was hard coded, caption and all, while there was one sheet. The
      rebalancing sheet then rendered the DIGITAL WALLET architecture, with a
      transfer service and a ledger, on page two of a document about consumer
      groups. It was the wrong diagram entirely, and nothing failed.

      A sheet with no diagram is worth strictly more than a sheet with someone
      else's diagram, so a sheet that declares no board simply has no board
      page, and numbering closes up behind it.
    */
    sheet.board
      ? `<h2><span class="num">01</span>${esc(sheet.board.title)}</h2>
  <p class="body">${esc(sheet.board.lead)}</p>
  ${sheet.board.svg()}
  <p class="board-note">${esc(sheet.board.note)}</p>

  <h2 style="margin-top:9mm"><span class="num">02</span>${esc(sheet.scale.title)}</h2>`
      : `<h2><span class="num">01</span>${esc(sheet.scale.title)}</h2>`
  }
  <table class="scale">
    ${sheet.scale.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
  </table>
  <p class="assume">${esc(sheet.scale.note)}</p>
</div>

${sheet.sections.map(section).join('')}

<div class="check">
  <h2>${esc(sheet.checklist.title)}</h2>
  <ol>${sheet.checklist.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>
</div>

<div class="links">
  <h3>Everything else</h3>
  <ul>
    ${sheet.links
      .map((l) => `<li><b>${esc(l.label)}</b><br><a href="${esc(l.url)}">${esc(l.url)}</a></li>`)
      .join('')}
  </ul>
  <p class="closing">${esc(sheet.closing)}</p>
  <p class="verified">${esc(sheet.trademarks)}</p>
  <p class="verified">Technical claims verified ${esc(sheet.verifiedOn)} against the documentation named beside each one. Vendors change behaviour and defaults between versions, so check the version you are actually running before you rely on any of it.</p>
</div>

</td></tr></tbody>
</table>

</body>
</html>`;
}
