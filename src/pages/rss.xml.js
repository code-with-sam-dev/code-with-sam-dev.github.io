import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';

/** RSS matters more than usual here: it is how a technical audience subscribes
 *  without giving up an email address, and it feeds newsletter automation. */
export async function GET(context) {
  const posts = (await getCollection('blog', ({data}) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: 'Code with Sam',
    description:
      'Modern software engineering interview preparation for the AI era.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}/`,
    })),
  });
}
