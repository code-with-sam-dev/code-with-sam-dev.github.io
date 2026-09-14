import {allPosts, type Post} from './posts';


export * from './filter';
import type {IndexedPost} from './filter';

/**
 * The search index, built at build time and shipped with the page.
 *
 * NO SEARCH SERVICE, DELIBERATELY. This site is a static build on GitHub
 * Pages and the whole archive is a few dozen articles, so the index is smaller
 * than one poster image. The honest engineering answer is to send it and
 * search in the browser: no third party, no API key, no request per keystroke,
 * nothing recorded about what a reader typed, and it keeps working offline
 * once the page has loaded.
 *
 * WHAT GOES IN, AND WHAT DOES NOT. Title, description, tags, series and a
 * trimmed slice of body text. Not the whole article: full text would multiply
 * the payload for matches a reader cannot see in a result card anyway, and a
 * search that returns a hit you cannot then locate is worse than one that
 * misses it.
 */

/** How much body text is worth indexing. Enough for topic words, not the whole essay. */
const BODY_CHARS = 1200;

const bodyExcerpt = (post: Post): string =>
  post.body
    // Strip code fences first: variable names and imports match everything and
    // would make a search for "spring" return every article that imports it.
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, BODY_CHARS);

export const toIndexed = (post: Post): IndexedPost => {
  const d = post.data;
  const haystack = [d.title, d.description, d.series ?? '', d.tags.join(' '), bodyExcerpt(post)]
    .join(' ')
    .toLowerCase();

  return {
    slug: post.slug,
    title: d.title,
    description: d.description,
    tags: d.tags,
    series: d.series,
    episode: d.episode,
    year: d.pubDate.getUTCFullYear(),
    date: d.pubDate.toISOString().slice(0, 10),
    duration: d.duration,
    cover: d.cover,
    hasSheet: Boolean(d.sheet),
    hasRepo: Boolean(d.repo),
    hasVideo: Boolean(d.youtube),
    haystack,
  };
};

export async function searchIndex(): Promise<IndexedPost[]> {
  return (await allPosts()).map(toIndexed);
}
