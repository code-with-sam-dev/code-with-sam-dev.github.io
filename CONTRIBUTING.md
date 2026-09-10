# Contributing

Corrections are genuinely welcome, particularly technical ones. If an article
says something that is wrong, misleading, or was true once and is not any more,
please open an issue or a pull request.

## What is welcome

- Factual and technical corrections in articles
- Broken links, broken builds, rendering problems
- Accessibility problems: contrast, focus order, screen reader behaviour
- Typos and grammar

## What will probably be declined

- Rewrites of an article's voice or structure. The writing is the point of the
  site, and it is deliberate
- New articles. This is a personal publication, not a group blog
- Redesigns

None of that is a comment on the quality of the suggestion.

## Running it

```bash
npm install
npm run dev
```

Before opening a pull request, check that `npm run build` succeeds. The build
validates article frontmatter against a schema, so a broken field fails there
rather than silently rendering an empty page.

## Licence on contributions

Code contributions are under MIT, the same as the repository. Article text
remains all rights reserved, which is why article rewrites are declined rather
than merged.
