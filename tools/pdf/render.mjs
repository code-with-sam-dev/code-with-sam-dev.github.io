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

const claim = (c) => `
  <div class="claim">
    <p>${esc(c.text)}</p>
    <span class="src">${esc(c.source)}</span>
  </div>`;

const section = (s, index) => `
  <section class="sec">
    <h2><span class="num">${String(index + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>
    ${(s.body ?? []).map((p) => `<p class="body">${esc(p)}</p>`).join('')}
    ${(s.claims ?? []).map(claim).join('')}
  </section>`;

export function renderHtml(sheet) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(sheet.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 15mm 18mm; }

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
  .links { margin: 8mm 0 0; border-top: 1px solid var(--hairline); padding-top: 5mm; }
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

  <h2 style="margin-top:9mm"><span class="num">00</span>${esc(sheet.scale.title)}</h2>
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
  <p class="verified">Technical claims verified ${esc(sheet.verifiedOn)} against the documentation named beside each one. Vendors change behaviour and defaults between versions, so check the version you are actually running before you rely on any of it.</p>
</div>

</body>
</html>`;
}
