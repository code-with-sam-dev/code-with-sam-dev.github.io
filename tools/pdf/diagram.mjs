/**
 * The architecture board, as inline SVG.
 *
 * Inline and vector, not a screenshot: it prints sharp at any zoom, it uses
 * the same tokens as the videos, and there is no binary asset to keep in sync
 * with the design. It is also the same board the video builds up lane by lane,
 * so the sheet and the episode cannot drift apart.
 *
 * EVERY coordinate is computed from the lane and column helpers rather than
 * typed in. Episode 2 shipped a cold open where the arrows pointed at the wrong
 * row because the coordinates were hand guessed, and it was caught by eye
 * rather than by anything structural. Deriving positions means an arrow cannot
 * disagree with the box it points at.
 */

const C = {
  ink: '#12161F',
  inkSoft: '#5A6473',
  primary: '#7C5CFF',
  primarySoft: '#E8E3FF',
  secondary: '#12A87A',
  secondarySoft: '#D6F2E8',
  warn: '#D93A3A',
  warnSoft: '#FBE6E6',
  hairline: '#D9DDE4',
  paper: '#FFFFFF',
};

const W = 1000;
const PAD = 14;
const LANE_LABEL = 18;

/** Lanes stack top to bottom; each one knows its own vertical band. */
function lanes(defs) {
  let y = 0;
  return defs.map((d) => {
    const band = {...d, y, height: d.height};
    y += d.height + 16;
    return band;
  });
}

const LANES = lanes([
  {id: 'clients', label: 'CLIENTS', height: 96, tint: C.secondarySoft, edge: C.secondary},
  {id: 'edge', label: 'EDGE AND SECURITY', height: 96, tint: C.primarySoft, edge: C.primary},
  {id: 'core', label: 'CORE WALLET PLATFORM', height: 208, tint: '#FFFFFF', edge: C.ink},
  {id: 'async', label: 'ASYNC SERVICES', height: 96, tint: C.primarySoft, edge: C.primary},
  {id: 'fail', label: 'FAILURE MODES', height: 108, tint: C.warnSoft, edge: C.warn},
]);

const lane = (id) => LANES.find((l) => l.id === id);
const HEIGHT = LANES.at(-1).y + LANES.at(-1).height;

/** Evenly spaced columns inside the board's usable width. */
function columns(count, {inset = 26} = {}) {
  const usable = W - inset * 2;
  const gap = 18;
  const width = (usable - gap * (count - 1)) / count;
  return Array.from({length: count}, (_, i) => ({
    x: inset + i * (width + gap),
    width,
  }));
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function laneRect(l) {
  return `
    <rect x="4" y="${l.y}" width="${W - 8}" height="${l.height}" rx="10"
          fill="${l.tint}" stroke="${l.edge}" stroke-width="1.2" opacity="0.95"/>
    <text x="16" y="${l.y + LANE_LABEL}" class="bd-lane">${esc(l.label)}</text>`;
}

/** A box, vertically centred in the space below its lane label. */
function box(laneId, col, label, sub, {fill = C.paper, stroke = C.ink, row = 0, rows = 1} = {}) {
  const l = lane(laneId);
  const top = l.y + LANE_LABEL + 8;
  const avail = l.height - LANE_LABEL - 16;
  const h = rows > 1 ? (avail - 10) / rows : avail;
  const y = top + row * (h + 10);
  const cy = y + h / 2;
  return {
    x: col.x,
    y,
    width: col.width,
    height: h,
    cx: col.x + col.width / 2,
    cy,
    top: y,
    bottom: y + h,
    svg: `
    <rect x="${col.x}" y="${y}" width="${col.width}" height="${h}" rx="8"
          fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
    <text x="${col.x + col.width / 2}" y="${sub ? cy - 4 : cy + 5}" class="bd-box">${esc(label)}</text>
    ${sub ? `<text x="${col.x + col.width / 2}" y="${cy + 13}" class="bd-sub">${esc(sub)}</text>` : ''}`,
  };
}

/**
 * Connectors, routed orthogonally.
 *
 * The first version drew a straight line between any two boxes. Where the boxes
 * were not aligned that produced long diagonals slicing across three lanes, and
 * the board became unreadable. Every connector here is either a straight hop
 * between aligned boxes or a Z shaped elbow: down, across, down. Nothing cuts
 * a lane it does not belong to.
 */
const badge = (x, y, step) => `
    <circle cx="${x}" cy="${y}" r="8.5" fill="${C.primary}" stroke="#fff" stroke-width="1.5"/>
    <text x="${x}" y="${y + 3.2}" class="bd-step">${step}</text>`;

/** Left to right between two boxes sitting on the same row. */
function across(from, to, step) {
  const x1 = from.x + from.width;
  const x2 = to.x;
  const y = from.cy;
  return `
    <line x1="${x1}" y1="${y}" x2="${x2 - 3}" y2="${y}"
          stroke="${C.ink}" stroke-width="1.5" marker-end="url(#head)"/>
    ${badge((x1 + x2) / 2, y, step)}`;
}

/** Top to bottom. Straight when the columns line up, an elbow when they do not. */
function down(from, to, step) {
  const x1 = from.cx;
  const x2 = to.cx;
  const y1 = from.bottom;
  const y2 = to.top - 3;
  const aligned = Math.abs(x1 - x2) < 2;

  if (aligned) {
    return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${C.ink}" stroke-width="1.5" marker-end="url(#head)"/>
    ${badge(x1, (y1 + y2) / 2, step)}`;
  }

  const my = (y1 + y2) / 2;
  return `
    <path d="M ${x1} ${y1} V ${my} H ${x2} V ${y2}" fill="none"
          stroke="${C.ink}" stroke-width="1.5" marker-end="url(#head)"/>
    ${badge((x1 + x2) / 2, my, step)}`;
}

export function architectureSvg() {
  const two = columns(2, {inset: 200});
  const edge = columns(2, {inset: 200});
  const core3 = columns(3, {inset: 26});
  const async3 = columns(3, {inset: 26});
  const fail4 = columns(4, {inset: 26});

  const sender = box('clients', two[0], 'Sender app', null, {stroke: C.secondary});
  const receiver = box('clients', two[1], 'Receiver app', 'notified, never asks', {stroke: C.secondary});

  const lb = box('edge', edge[0], 'Load balancer', null, {stroke: C.primary});
  const gw = box('edge', edge[1], 'API gateway', 'auth, rate limit, correlation id', {stroke: C.primary});

  const transfer = box('core', core3[0], 'Transfer service', 'owns the lifecycle', {rows: 2, row: 0});
  const idem = box('core', core3[1], 'Idempotency store', 'key, request hash, result', {rows: 2, row: 0});
  const ledger = box('core', core3[2], 'Ledger', 'append only, double entry', {rows: 2, row: 0, stroke: C.primary});

  const db = box('core', core3[0], 'Financial database', 'one transaction, one commit', {rows: 2, row: 1});
  const outbox = box('core', core3[1], 'Outbox table', 'written in the SAME transaction', {rows: 2, row: 1, stroke: C.primary});
  const balance = box('core', core3[2], 'Balance', 'derived, never edited', {rows: 2, row: 1});

  const publisher = box('async', async3[0], 'Outbox publisher', 'at least once', {stroke: C.primary});
  const broker = box('async', async3[1], 'Message broker', 'consumers must be idempotent', {stroke: C.primary});
  const notify = box('async', async3[2], 'Notification service', null, {stroke: C.primary});

  const failures = [
    ['The retry', 'same key, same result'],
    ['Two at once', 'lost update'],
    ['Crash mid transfer', 'money nowhere'],
    ['Publish uncertainty', 'sent twice'],
  ].map(([t, s], i) => box('fail', fail4[i], t, s, {fill: C.paper, stroke: C.warn}));

  return `
<svg viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" class="board" role="img"
     aria-label="Digital wallet transfer architecture, by lane">
  <defs>
    <marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.ink}"/>
    </marker>
  </defs>
  <style>
    /* Namespaced. An inline SVG's style block is NOT scoped to the SVG in an
       HTML document: it leaks into the page. The first version used .sub and
       .box, which silently overrode the cover subtitle's type and shrank it to
       10px. Prefixing is the whole fix. */
    .bd-lane { font: 700 11px 'Space Grotesk', sans-serif; letter-spacing: .12em; fill: ${C.inkSoft}; }
    .bd-box  { font: 600 13px 'IBM Plex Sans', sans-serif; fill: ${C.ink}; text-anchor: middle; }
    .bd-sub  { font: 400 10px 'IBM Plex Sans', sans-serif; fill: ${C.inkSoft}; text-anchor: middle; }
    .bd-step { font: 700 10px 'IBM Plex Sans', sans-serif; fill: #fff; text-anchor: middle; }
  </style>

  ${LANES.map(laneRect).join('')}

  ${sender.svg}${receiver.svg}
  ${lb.svg}${gw.svg}
  ${transfer.svg}${idem.svg}${ledger.svg}
  ${db.svg}${outbox.svg}${balance.svg}
  ${publisher.svg}${broker.svg}${notify.svg}
  ${failures.map((f) => f.svg).join('')}

  ${down(sender, lb, 1)}
  ${across(lb, gw, 2)}
  ${down(gw, transfer, 3)}
  ${across(transfer, idem, 4)}
  ${across(idem, ledger, 5)}
  ${down(transfer, db, 6)}
  ${across(db, outbox, 7)}
  ${down(outbox, publisher, 8)}
  ${across(publisher, broker, 9)}
  ${across(broker, notify, 10)}

</svg>`;
}

export const boardGeometry = {width: W, height: HEIGHT, lanes: LANES.map((l) => l.id)};
