// @ts-check
import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The site currently lives on a github.io subdomain. When codewithsam.com is
// registered, change `site` and `base` here and redeploy — nothing else in the
// project references the domain, so the switch is a two-line change.
const GITHUB_USER = 'samsonnyabanga';
const REPO = 'codewithsam-site';

export default defineConfig({
  site: `https://${GITHUB_USER}.github.io`,
  base: `/${REPO}`,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {format: 'directory'},
});
