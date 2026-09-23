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

/*
  A CODE BLOCK, because a sheet for a practical course that carries no code is
  the wrong artefact.

  Sam's rule: "also include code snippets in the pdf sheet". The sheet is what a
  viewer pins next to their editor, and for a coding episode the thing they want
  to keep is the code, not a paragraph describing it. The repository is the full
  runnable truth; this is the one page.

  It is DELIBERATELY not syntax highlighted. A sheet printed in grayscale has to
  stay readable, and colour that survives neither printing nor a screenshot is
  decoration rather than information.
*/
/*
  DRAWN AS A TERMINAL WINDOW, like the site's code blocks. Sam, 2026-09-23: "i
  expected to see things like [a dark terminal block] in the pdf sheet for code
  snippets or installation commands". The text stays real text, so it can be
  selected and copied out of any PDF reader, which is the job a Copy button does
  on the site.
*/
const codeBlock = (c) => `
  <figure class="code term">
    <div class="bar"><span class="dots"><i></i><i></i><i></i></span>${c.caption ? `<figcaption>${esc(c.caption)}</figcaption>` : ''}</div>
    <pre>${c.lines.map(esc).join('\n')}</pre>
    ${c.note ? `<p class="codenote">${esc(c.note)}</p>` : ''}
  </figure>`;

/*
  ONE GLYPH PER CHANNEL LINK, the same drawings as SocialIcon.astro on the site,
  so a reader finds a platform by its mark. Sam, 2026-09-23: "documents don't
  have icons like on the site". Links with no platform (a docs page, a download)
  get none rather than a generic one.
*/
const SADZA_PNG = 'data:image/png;base64,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';
const ICONS = {
  'YouTube': '<rect x="1.5" y="5" width="21" height="14" rx="4" fill="#FF0000"/><path d="M10 9l5 3-5 3z" fill="#fff"/>',
  'LinkedIn': '<rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2"/><circle cx="7.5" cy="7.5" r="1.6" fill="#fff"/><rect x="6" y="10" width="3" height="8" fill="#fff"/><path d="M11 10h2.8v1.2c.5-.8 1.5-1.4 2.8-1.4 2 0 3.4 1.2 3.4 3.8V18h-3v-4c0-1.1-.5-1.8-1.5-1.8S14 13 14 14v4h-3z" fill="#fff"/>',
  'X': '<path d="M4 4l16 16M20 4L4 20" stroke="#111" stroke-width="2.6" stroke-linecap="round" fill="none"/>',
  'TikTok': '<path d="M13 3h3c.3 2.2 1.7 3.6 4 3.9v3c-1.5 0-2.9-.5-4-1.3V15a6 6 0 1 1-6-6v3.1A3 3 0 1 0 13 15z" fill="#111"/>',
  'Instagram': '<g fill="none" stroke="#E4405F" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></g><circle cx="17.3" cy="6.7" r="0.9" fill="#E4405F"/>',
  'Facebook': '<circle cx="12" cy="12" r="10.5" fill="#1877F2"/><path d="M13.2 21v-6.8h2.3l.4-2.7h-2.7V9.8c0-.8.3-1.3 1.4-1.3H16V6.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.4 1.3-3.4 3.6v1.9H8v2.7h2.4V21z" fill="#fff"/>',
  'GitHub': '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  'Buy me a coffee': '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#FFDD00" stroke="#111" stroke-width="1.6"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="#111" stroke-width="1.6"/>',
  'Site': '<circle cx="12" cy="12" r="9.5" fill="none" stroke="#7c5cff" stroke-width="2"/><path d="M2.5 12h19M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19" fill="none" stroke="#7c5cff" stroke-width="1.6"/>',
};
const linkIcon = (label) => {
  const key = label.replace(/^\u2615\s*/, '');
  if (key === 'Buy me sadza') return `<img class="li-icon" src="${SADZA_PNG}" alt="">`;
  const g = ICONS[key];
  return g ? `<svg class="li-icon" viewBox="0 0 24 24" aria-hidden="true">${g}</svg>` : '<span class="li-icon"></span>';
};

const section = (s, index) => `
  <section class="sec">
    <h2><span class="num">${String(index + 3).padStart(2, '0')}</span>${esc(s.title)}</h2>
    ${(s.body ?? []).map((p) => `<p class="body">${esc(p)}</p>`).join('')}
    ${(s.code ?? []).map(codeBlock).join('')}
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

  /* ---------- code ---------- */
  /* Kept whole. A snippet split across a page boundary is a snippet nobody can
     retype, which is the only thing it is for. */
  .code {
    margin: 0 0 4.5mm; page-break-inside: avoid;
    border-radius: 2.5mm; background: #0f1115; overflow: hidden;
    border: 1px solid #262a33;
  }
  .code .bar {
    display: flex; align-items: center; gap: 3mm;
    padding: 2.2mm 4mm; background: #1a1d24; border-bottom: 1px solid #262a33;
  }
  .code .dots { display: inline-flex; gap: 1.4mm; }
  .code .dots i { width: 2.4mm; height: 2.4mm; border-radius: 50%; display: block; background: #ff5f57; }
  .code .dots i:nth-child(2) { background: #febc2e; }
  .code .dots i:nth-child(3) { background: #28c840; }
  .code figcaption {
    font-family: 'JetBrains Mono', monospace; font-size: 7.8pt;
    color: #9aa3b2; margin: 0;
  }
  .code pre {
    font-family: 'JetBrains Mono', monospace; font-size: 8.4pt; line-height: 1.5;
    margin: 0; padding: 3.5mm 5mm 4mm; white-space: pre-wrap; word-break: break-word; color: #e6e8ee;
  }
  .code .codenote { margin: 0; padding: 0 5mm 3.5mm; font-size: 8.6pt; color: #9aa3b2; }

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
  .links li { margin-bottom: 1.6mm; font-size: 9.2pt; break-inside: avoid; display: flex; gap: 2.4mm; align-items: flex-start; }
  .links .li-icon { width: 4.6mm; height: 4.6mm; flex: none; margin-top: 0.4mm; display: inline-block; }
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
      .map((l) => `<li>${linkIcon(l.label)}<span><b>${esc(l.label.replace(/^\u2615\s*/, ''))}</b><br><a href="${esc(l.url)}">${esc(l.url)}</a></span></li>`)
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
