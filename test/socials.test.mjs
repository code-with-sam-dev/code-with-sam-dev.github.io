import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

/**
 * THE "ELSEWHERE" LINKS CARRY THEIR PLATFORM'S ICON. Sam, 2026-09-23: "I thought
 * we agreed to update the site and have icons for the other platforms like
 * facebook, instagram etc". He had asked for it once already, marked "for
 * later", and it was never done. A viewer finds a platform by its mark before
 * reading its name, the same reason the YouTube mark is YouTube red.
 *
 * And the channel's support page, opened the same day.
 */
const channel = await readFile('src/lib/channel.ts', 'utf8');
const icon = await readFile('src/components/SocialIcon.astro', 'utf8');
const links = await readFile('src/components/SocialLinks.astro', 'utf8');

const socials = channel.slice(channel.indexOf('export const SOCIALS'), channel.indexOf('] as const'));
const iconsDeclared = [...socials.matchAll(/icon:\s*'([a-z]+)'/g)].map((m) => m[1]);
const entries = (socials.match(/label:/g) ?? []).length;

test('every link declares an icon', () => {
  assert.ok(entries >= 8, `only ${entries} links`);
  assert.equal(iconsDeclared.length, entries, 'a link has no icon');
});

test('every declared icon is one SocialIcon can draw', () => {
  for (const name of iconsDeclared) {
    assert.match(icon, new RegExp(`'${name}'`), `SocialIcon has no drawing for ${name}`);
  }
});

test('the cards actually render the icon', () => {
  assert.match(links, /<SocialIcon/);
});

test('the support page is listed, with its full url', () => {
  assert.match(socials, /https:\/\/buymeacoffee\.com\/codewithsam/);
});

test('the YouTube icon keeps YouTube red, per the existing rule', () => {
  assert.match(icon, /youtube[\s\S]{0,200}#FF0000/i);
});

/*
  Sam, 2026-09-23: "buy me coffee should be on top of buy me sadza", and "i need
  buy me coffee and buy me sadza on the site as well". Two ways to say thanks,
  in that order, both going to the one support page.
*/
test('buy me a coffee sits directly above buy me sadza', () => {
  const coffee = socials.indexOf("label: 'Buy me a coffee'");
  const sadza = socials.indexOf("label: 'Buy me sadza'");
  assert.ok(coffee > 0, 'no coffee card');
  assert.ok(sadza > coffee, 'sadza must come after coffee');
  assert.doesNotMatch(socials.slice(coffee, sadza), /label:[\s\S]*label:/, 'something sits between them');
});

test('the sadza card uses the sadza artwork, sized for the web', async () => {
  assert.match(icon, /'sadza'/);
  assert.match(icon, /\/support\/sadza-/);
  const {stat} = await import('node:fs/promises');
  const s = await stat('public/support/sadza-96.png');
  assert.ok(s.size < 60_000, `sadza icon is ${s.size} bytes, too heavy for a footer`);
});

test('the support cards are their own stacked section, not tiles in the grid', () => {
  assert.match(links, /support-heading/);
  assert.match(links, /ul\.support\s*\{\s*grid-template-columns:\s*minmax\(0, 22rem\)/);
  assert.equal((socials.match(/support: true/g) ?? []).length, 2);
});
