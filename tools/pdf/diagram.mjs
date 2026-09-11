/**
 * The architecture board, drawn for print.
 *
 * The board is DEFINED once, in the video project's src/board.ts, and drawn
 * twice: by the video and by this sheet. Every lane, box, connector route and
 * label below comes from board.data.mjs, which that project generates. Nothing
 * here decides where anything goes.
 *
 * That split is the whole point. A viewer who downloads this sheet should
 * recognise the picture they just watched being assembled, and the only way to
 * guarantee that is for the two renderers to share one description rather than
 * each keep a copy that drifts.
 *
 * What this file still owns is PRINT: type sizes tuned for paper rather than a
 * 1080p frame, and class names prefixed so an inline SVG's style block cannot
 * leak into the page around it.
 */
import * as simpleIcons from 'simple-icons';

import {BOARD, GROUPS, BOXES, CONNECTORS, TYPE} from './board.data.mjs';

const C = {
  ink: '#12161F',
  inkSoft: '#5A6473',
  primary: '#7C5CFF',
  warn: '#D93A3A',
  hairline: '#D9DDE4',
  paper: '#FFFFFF',
};

/**
 * Print type, one step down from the video's.
 *
 * A reader zooms into a PDF at their own pace, so the sheet can carry smaller
 * text than a fixed resolution frame can. Same layout, different scale.
 */
const PRINT = {
  groupLabel: 11,
  label: 12.5,
  sub: 9.5,
  bullet: 9.5,
  badge: 9.5,
  edge: 9,
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const iconOf = (slug) =>
  simpleIcons[`si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`] ??
  Object.values(simpleIcons).find((i) => i && i.slug === slug);

/** A product mark, in its own brand colour, at the size the box allows. */
const mark = (slug, x, y, size) => {
  const icon = iconOf(slug);
  if (!icon) return '';
  return `<g transform="translate(${x} ${y}) scale(${size / 24})">
      <path d="${icon.path}" fill="#${icon.hex}"/>
    </g>`;
};

/** A small cylinder, used as a glyph rather than as the shape of a whole box. */
const storeGlyph = (spot, stroke) => {
  const w = spot.size;
  const h = spot.size * 0.86;
  const lip = h * 0.2;
  return `<g transform="translate(${spot.x} ${spot.y})">
      <path d="M 0 ${lip} a ${w / 2} ${lip} 0 0 1 ${w} 0 v ${h - lip * 2}
               a ${w / 2} ${lip} 0 0 1 ${-w} 0 z"
            fill="#fff" stroke="${stroke}" stroke-width="1.2"/>
      <path d="M 0 ${lip} a ${w / 2} ${lip} 0 0 0 ${w} 0"
            fill="none" stroke="${stroke}" stroke-width="1.2"/>
    </g>`;
};

const groupSvg = (g) => `
    <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" rx="18"
          fill="${g.tint}" stroke="${g.edge}" stroke-width="1.6" opacity="0.92"/>
    <text x="${g.x + g.width / 2}" y="${g.y + TYPE.groupLabel}" class="bd-lane"
          style="font-size:${PRINT.groupLabel}px; fill:${g.labelColor}">${esc(g.label)}</text>`;

const boxSvg = (b) => {
  const r = b.rect;
  const stroke = b.stroke ?? C.ink;
  const fill = b.tone === 'bad' ? '#F6D2D2' : b.tone === 'good' ? '#D6F2E8' : C.paper;
  const hasMark = Boolean(b.tech && iconOf(b.tech));
  const markSize = 18;
  const bulleted = Boolean(b.bullets?.length);

  const titleY = bulleted ? r.y + 30 : b.sub ? r.cy - 3 : r.cy + 4;
  const titleX = bulleted ? r.x + 14 + (hasMark ? markSize + 8 : 0) : r.cx + (hasMark ? 11 : 0);

  const shape =
    b.drawnShape === 'terminal'
      ? `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.height / 2}"
               fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`
      : `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="10"
               fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`;

  return `
    ${shape}
    ${b.glyph === 'store' ? storeGlyph(b.glyphSpot, C.inkSoft) : ''}
    ${hasMark ? mark(b.tech, bulleted ? r.x + 14 : titleX - markSize - 6 - b.label.length * 3, titleY - markSize + 3, markSize) : ''}
    <text x="${titleX}" y="${titleY}" class="bd-box"
          style="text-anchor:${bulleted ? 'start' : 'middle'}">${esc(b.label)}</text>
    ${
      b.sub
        ? `<text x="${bulleted ? r.x + 14 : r.cx}" y="${bulleted ? r.y + 30 + PRINT.sub + 6 : r.cy + PRINT.sub + 4}"
                 class="bd-sub" style="text-anchor:${bulleted ? 'start' : 'middle'}">${esc(b.sub)}</text>`
        : ''
    }
    ${(b.bullets ?? [])
      .map(
        (line, i) => `
    <circle cx="${r.x + 20}" cy="${r.y + 52 + i * 17 - 3}" r="2" fill="${C.inkSoft}"/>
    <text x="${r.x + 29}" y="${r.y + 52 + i * 17}" class="bd-bullet">${esc(line)}</text>`,
      )
      .join('')}`;
};

/** A numbered step: the solid path the money takes. */
const stepSvg = (c) => `
    <path d="${c.d}" fill="none" stroke="${C.ink}" stroke-width="1.5"
          stroke-linejoin="round" marker-end="url(#head)"/>
    ${
      c.note
        ? `<rect x="${c.label.x - (c.anchor === 'start' ? 4 : (c.note.length * PRINT.edge * 0.54 + 8) / 2)}"
                 y="${c.label.y - PRINT.edge - 1}"
                 width="${c.note.length * PRINT.edge * 0.54 + 8}" height="${PRINT.edge + 5}"
                 rx="2" fill="${C.paper}" stroke="${C.hairline}" stroke-width="0.6"/>
           <text x="${c.label.x}" y="${c.label.y}" class="bd-edge"
                 style="text-anchor:${c.anchor}">${esc(c.note)}</text>`
        : ''
    }
    <circle cx="${c.badge.x}" cy="${c.badge.y}" r="9" fill="${C.primary}" stroke="#fff" stroke-width="1.5"/>
    <text x="${c.badge.x}" y="${c.badge.y + 3.2}" class="bd-step">${c.step}</text>`;

/**
 * An observability tap: dashed and deliberately UNNUMBERED.
 *
 * Observability is not a step the money passes through, it is the thing
 * watching every step. Giving it a number would teach exactly the wrong model.
 */
const tapSvg = (c) => `
    <path d="${c.d}" fill="none" stroke="${C.inkSoft}" stroke-width="1.1"
          stroke-dasharray="4 4" opacity="0.8"/>
    <text x="${c.label.x}" y="${c.label.y}" class="bd-edge"
          style="text-anchor:${c.anchor}">${esc(c.note)}</text>`;

export function architectureSvg() {
  const steps = CONNECTORS.filter((c) => c.kind === 'step');
  const taps = CONNECTORS.filter((c) => c.kind === 'tap');

  return `
<svg viewBox="0 0 ${BOARD.width} ${BOARD.height}" xmlns="http://www.w3.org/2000/svg" class="board" role="img"
     aria-label="Digital wallet transfer architecture, by group">
  <defs>
    <marker id="head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.ink}"/>
    </marker>
    <pattern id="bd-grid-sm" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ECEEF2" stroke-width="1"/>
    </pattern>
    <pattern id="bd-grid" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="url(#bd-grid-sm)"/>
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#E2E6EC" stroke-width="1.2"/>
    </pattern>
  </defs>
  <style>
    /* Namespaced. An inline SVG's style block is NOT scoped to the SVG in an
       HTML document: it leaks into the page. The first version used .sub and
       .box, which silently overrode the cover subtitle and shrank it to 10px.
       Prefixing is the whole fix. */
    .bd-lane   { font: 700 ${PRINT.groupLabel}px 'Space Grotesk', sans-serif; letter-spacing: .12em; text-anchor: middle; }
    .bd-box    { font: 600 ${PRINT.label}px 'IBM Plex Sans', sans-serif; fill: ${C.ink}; }
    .bd-sub    { font: 400 ${PRINT.sub}px 'IBM Plex Sans', sans-serif; fill: ${C.inkSoft}; }
    .bd-bullet { font: 400 ${PRINT.bullet}px 'IBM Plex Sans', sans-serif; fill: ${C.ink}; }
    .bd-edge   { font: 400 ${PRINT.edge}px 'IBM Plex Sans', sans-serif; fill: ${C.inkSoft}; }
    .bd-step   { font: 700 ${PRINT.badge}px 'IBM Plex Sans', sans-serif; fill: #fff; text-anchor: middle; }
  </style>

  <rect x="0" y="0" width="${BOARD.width}" height="${BOARD.height}" fill="#FCFCFD"/>
  <rect x="0" y="0" width="${BOARD.width}" height="${BOARD.height}" fill="url(#bd-grid)"/>

  ${GROUPS.map(groupSvg).join('')}
  ${taps.map(tapSvg).join('')}
  ${steps.map(stepSvg).join('')}
  ${BOXES.map(boxSvg).join('')}
</svg>`;
}

/** Kept for the tests and for anything that wants the board's shape. */
export const boardGeometry = {
  width: BOARD.width,
  height: BOARD.height,
  lanes: GROUPS.map((g) => g.id),
};

/** Marks actually used, so the sheet can carry the trademark note honestly. */
export const technologies = [...new Set(BOXES.map((b) => b.tech).filter(Boolean))].map((slug) => ({
  slug,
  title: iconOf(slug)?.title ?? slug,
}));
