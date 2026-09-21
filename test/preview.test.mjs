import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';

/*
  EVERY ARTICLE HAS A PREVIEW, AND THE PREVIEW IS THE ONLY ROUTE TO THE VIDEO.

  Sam, 2026-09-21: "On the site remember every episode needs a preview."

  WHY IT IS A TEST AND NOT A NOTE. The player block on an article is gated on
  the cover image:

      const art = post.data.cover ? poster(post.data.cover) : undefined;
      ... art && (<figure class="video-preview"> ... )

  So an article with no cover renders with no poster, NO PLAY BUTTON, and no
  "Watch on YouTube" link. It is not a missing picture, it is a dead end: the
  only remaining route to the episode is the channel link in the footer.

  Three were found live in one sweep on 2026-09-21. The handoffs and install
  articles had a youtube id and no cover, so their videos were unreachable. The
  "while the AI writes the code" article had NEITHER, while its episode had been
  public at EHkYB8duwdE since 2026-09-15.

  Nothing caught any of it, because everything builds fine. Astro does not care
  that a conditional was false, and the page looks deliberate rather than broken.

  WHAT THIS CHECKS, for every non-draft article:
    1. a cover is declared
    2. the file it names exists, and so does the -card variant the poster
       helper derives, because poster() builds that path by string replacement
       and a missing card is a broken srcset rather than an error
    3. if the article declares a youtube id, it is the right shape, since the id
       is free text and any eleven characters render a real but wrong video
*/

const DIR = 'src/content/blog';
const frontmatter = (file) => readFileSync(`${DIR}/${file}`, 'utf8').split('\n---\n')[0];
const field = (fm, name) => (fm.match(new RegExp(`^${name}: '([^']*)'`, 'm')) || [])[1];
const isDraft = (fm) => /^draft:\s*true\s*$/m.test(fm);

const articles = readdirSync(DIR).filter((f) => f.endsWith('.md'));

test('every published article declares a cover', () => {
  const missing = articles
    .map((f) => [f, frontmatter(f)])
    .filter(([, fm]) => !isDraft(fm) && !field(fm, 'cover'))
    .map(([f]) => f);
  assert.deepEqual(missing, [], `articles with no preview image: ${missing.join(', ')}`);
});

test('every declared cover exists on disk, with its card variant', () => {
  const broken = [];
  for (const f of articles) {
    const cover = field(frontmatter(f), 'cover');
    if (!cover) continue;
    const card = cover.replace(/(\.[a-z]+)$/i, '-card$1');
    if (!existsSync(`public${cover}`)) broken.push(`${f}: ${cover}`);
    if (!existsSync(`public${card}`)) broken.push(`${f}: ${card}`);
  }
  assert.deepEqual(broken, [], `covers named but not on disk: ${broken.join(', ')}`);
});

test('a declared youtube id is eleven url-safe characters', () => {
  const wrong = [];
  for (const f of articles) {
    const id = field(frontmatter(f), 'youtube');
    if (id && !/^[A-Za-z0-9_-]{11}$/.test(id)) wrong.push(`${f}: ${id}`);
  }
  assert.deepEqual(wrong, [], `malformed youtube ids: ${wrong.join(', ')}`);
});
