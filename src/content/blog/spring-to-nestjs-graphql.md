---
title: 'GraphQL in NestJS, for Spring Developers: Production Mode Is Not Enough'
cover: '/covers/sn-graphql.jpg'
description: 'A resolver whose SQL fails: Spring for GraphQL masked it, NestJS with Apollo sent the client the raw Postgres error and a stack trace, and production mode only removed the stack. Measured on both stacks, with the fix.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-31-graphql.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'graphql']
series: 'Spring Boot to NestJS'
episode: 32
duration: '3:53'
draft: true
---

A GraphQL query hits a resolver whose SQL fails. Spring for GraphQL gave the client a generic internal
error and an id to look up. NestJS with Apollo gave the client the raw Postgres error and a seven
line stack trace. Measured on 1 October 2026 against one Postgres. Your GraphQL error contract depends
on more than your resolver.

## Production mode hid the stack, not the database error

With `NODE_ENV=production`, the stack trace was gone and the Postgres message was still there. A
`formatError` that masks anything GraphQL itself did not raise made it `Internal server error`.
Production mode is not an error masking policy; if the client must not see infrastructure errors,
make that policy explicit.

## The rest of the delta

N plus one is the same on both stacks: 21 statements for 20 orders, and 2 with `@BatchMapping` or a
DataLoader created per request. The same invalid query answered HTTP 200 or 400 on Spring depending
on the media type the client accepted, and 400 for both on Apollo, so test monitors and retries
during the move. Introspection answered on both until `NODE_ENV=production` on the Apollo-backed Nest
setup.

The full Spring GraphQL deep dive is on the channel. The full code for every measurement is in the
repository, and the free design sheet above has the checklist on one page.
