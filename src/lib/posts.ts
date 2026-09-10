import {getCollection, type CollectionEntry} from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Every published article, newest first. Drafts never ship. */
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({data}) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Articles grouped by series, each in episode order.
 *
 * Series pages and "next episode" links both read from this, so adding an
 * article to a playlist is a two-line frontmatter change and nothing else has
 * to be touched.
 */
export async function seriesMap(): Promise<Map<string, Post[]>> {
  const map = new Map<string, Post[]>();
  for (const post of await allPosts()) {
    const name = post.data.series;
    if (!name) continue;
    const list = map.get(name) ?? [];
    list.push(post);
    map.set(name, list);
  }
  for (const [name, list] of map) {
    map.set(name, list.sort((a, b) => (a.data.episode ?? 0) - (b.data.episode ?? 0)));
  }
  return map;
}

/** The next episode in the same series, if there is one. */
export async function nextInSeries(post: Post): Promise<Post | undefined> {
  if (!post.data.series) return undefined;
  const list = (await seriesMap()).get(post.data.series) ?? [];
  const i = list.findIndex((p) => p.slug === post.slug);
  return i >= 0 ? list[i + 1] : undefined;
}

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});

/**
 * Responsive sources for a poster.
 *
 * Convention: `cover` names the 1280x720 poster, and a 640x360 variant sits
 * beside it as `<name>-card.jpg`. Card lists pull the small one, so an archive
 * page of ten articles costs ~400KB of imagery rather than ~1.2MB.
 */
export function poster(cover: string) {
  const card = cover.replace(/(\.[a-z]+)$/i, '-card$1');
  return {src: card, srcset: `${card} 640w, ${cover} 1280w`, full: cover};
}
