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
  }),
});

export const collections = {blog};
