import {defineCollection, z} from 'astro:content';

/**
 * Article schema. Everything an article needs to render, be found in search,
 * and link back to its video and code is declared here - so a post that is
 * missing its description or date fails the build rather than shipping broken.
 */
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** YouTube video id, embedded near the top of the article. */
    youtube: z.string().optional(),
    /** Full URL of the companion GitHub repo, if the article has one. */
    repo: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),

    /**
     * Series membership. An article that belongs to a playlist declares which
     * one and where it sits, so series pages order themselves and every article
     * can offer the next episode without any per-article wiring.
     */
    series: z.string().optional(),
    episode: z.number().optional(),

    /**
     * Local poster for this article's video, e.g. '/covers/kafka-ordering.jpg'.
     *
     * Deliberately NOT a YouTube thumbnail URL. The poster is a still we
     * rendered ourselves, so the preview works before the video is uploaded,
     * does not break if a video is ever replaced or made private, and does not
     * call Google on a page the reader has not asked to watch anything on.
     * A sibling '<name>-card.jpg' at 640x360 is used for list cards.
     */
    cover: z.string().optional(),

    /** Runtime, e.g. '4:18'. Shown on the poster badge. */
    duration: z.string().optional(),

    /** Optional hero terminal snippet, used when this is the newest article. */
    terminal: z
      .object({
        path: z.string(),
        lines: z.array(z.string()),
      })
      .optional(),
  }),
});

export const collections = {blog};
