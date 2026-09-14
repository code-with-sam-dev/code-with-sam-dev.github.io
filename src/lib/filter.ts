/**
 * The filtering rules, and nothing that can only run on a server.
 *
 * SPLIT OUT OF searchIndex.ts ON PURPOSE. That module reads the content
 * collection, which is server only, and the browser needs exactly these
 * functions. Importing the whole thing into a client script pulled
 * `astro:content` into the bundle and failed the build, which is the right
 * failure: the boundary is real and this file is where it sits.
 *
 * Everything here is pure, so the tests exercise the same code the browser
 * runs rather than a copy of it.
 */

export type IndexedPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  series?: string;
  episode?: number;
  year: number;
  date: string;
  duration?: string;
  cover?: string;
  hasSheet: boolean;
  hasRepo: boolean;
  hasVideo: boolean;
  /** Lowercased haystack, so the browser does not lowercase on every keystroke. */
  haystack: string;
};

/**
 * The facets, derived from the articles rather than hard coded.
 *
 * Sam asked for the dropdowns to be DYNAMIC, and this is what that has to mean
 * to be worth anything: publishing an article with a new tag makes the tag
 * appear, and removing the last article with a tag makes it disappear. A hand
 * maintained list would be wrong within two episodes and nobody would notice
 * until a reader filtered by something that returns nothing.
 */
export type Facet = {key: string; label: string; options: {value: string; count: number}[]};

export function facetsFor(posts: IndexedPost[]): Facet[] {
  const count = (values: (p: IndexedPost) => string[]) => {
    const tally = new Map<string, number>();
    for (const post of posts) {
      for (const value of values(post)) {
        if (value) tally.set(value, (tally.get(value) ?? 0) + 1);
      }
    }
    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([value, n]) => ({value, count: n}));
  };

  return [
    {key: 'series', label: 'Series', options: count((p) => (p.series ? [p.series] : []))},
    {key: 'tags', label: 'Topic', options: count((p) => p.tags)},
    {key: 'year', label: 'Year', options: count((p) => [String(p.year)])},
    {
      key: 'has',
      label: 'Includes',
      options: count((p) => [
        ...(p.hasVideo ? ['Video'] : []),
        ...(p.hasRepo ? ['Code'] : []),
        ...(p.hasSheet ? ['Design sheet'] : []),
      ]),
    },
  ].filter((facet) => facet.options.length > 1);
  // A facet with one option filters nothing and is just furniture.
}

/**
 * The matcher, shared by the tests and the browser.
 *
 * Exported as a pure function on purpose: the filtering rules are the part
 * worth testing, and testing them through a DOM would test the DOM.
 */
export type Query = {text: string; selected: Record<string, string[]>};

export function matches(post: IndexedPost, query: Query): boolean {
  const text = query.text.trim().toLowerCase();
  if (text) {
    // Every word must appear somewhere. AND rather than OR, because two words
    // typed together are a narrowing, and an OR search gets wider as the
    // reader tries harder to be specific, which feels broken.
    const words = text.split(/\s+/);
    if (!words.every((word) => post.haystack.includes(word))) return false;
  }

  for (const [key, values] of Object.entries(query.selected)) {
    if (values.length === 0) continue;
    const has = valuesOf(post, key);
    // Within one dropdown the values are OR: picking Kafka and Java means
    // either. Across dropdowns they are AND: Kafka AND 2026.
    if (!values.some((value) => has.includes(value))) return false;
  }
  return true;
}

export function valuesOf(post: IndexedPost, key: string): string[] {
  switch (key) {
    case 'series':
      return post.series ? [post.series] : [];
    case 'tags':
      return post.tags;
    case 'year':
      return [String(post.year)];
    case 'has':
      return [
        ...(post.hasVideo ? ['Video'] : []),
        ...(post.hasRepo ? ['Code'] : []),
        ...(post.hasSheet ? ['Design sheet'] : []),
      ];
    default:
      return [];
  }
}
