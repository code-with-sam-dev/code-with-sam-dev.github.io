/**
 * Build guard: no personal email address may reach the published site.
 *
 * The support page shipped `nyabangasamson@gmail.com` as a `mailto:` link until
 * 2026-09-11. It was replaced by a form. This script exists so that fix cannot
 * quietly regress: a stray `mailto:` in a new page, a component copied from an
 * old branch, or an address pasted into an article would otherwise ship without
 * anyone noticing until a scraper found it.
 *
 * It scans the BUILT output rather than the source, because the built output is
 * what the public actually gets. Anything Astro strips at build time (server
 * frontmatter, comments) is correctly ignored.
 *
 * Two rules:
 *   1. No `mailto:` links at all.
 *   2. No bare address that looks like a personal inbox on a public mail host.
 *
 * A blocked build is the intended outcome, not an inconvenience. If a genuine
 * business address is ever wanted on the site, delete the rule deliberately in
 * this file, with a reason, rather than working around it at the call site.
 */
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

/** Text files worth scanning. Images cannot leak an address. */
const SCANNED = /\.(html|js|mjs|css|json|xml|txt|svg)$/i;

const RULES = [
  {
    name: 'mailto: link',
    pattern: /mailto:[^"'\s>)]+/gi,
  },
  {
    name: 'personal inbox address',
    pattern:
      /[A-Za-z0-9._%+-]+@(?:gmail|googlemail|outlook|hotmail|yahoo|proton(?:mail)?|icloud)\.[A-Za-z.]{2,}/gi,
  },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SCANNED.test(entry)) out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error('check-no-email: dist/ not found. Run the build first.');
  process.exit(1);
}

const leaks = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const rule of RULES) {
    for (const hit of text.match(rule.pattern) ?? []) {
      leaks.push({file: relative(DIST, file), rule: rule.name, hit});
    }
  }
}

if (leaks.length > 0) {
  console.error(
    `\ncheck-no-email: FAILED. ${leaks.length} address leak(s) in the built site.\n`
  );
  for (const leak of leaks) {
    console.error(`  ${leak.file}\n    ${leak.rule}: ${leak.hit}`);
  }
  console.error(
    '\nUse the contact form instead. See src/lib/contact.ts for why.\n'
  );
  process.exit(1);
}

console.log(`check-no-email: OK. ${files.length} files scanned, no addresses.`);
