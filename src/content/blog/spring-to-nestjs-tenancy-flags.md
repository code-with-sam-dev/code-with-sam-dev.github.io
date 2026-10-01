---
title: 'Multi Tenancy and Feature Flags, Spring to NestJS: Tenant A Saw Tenant B'
cover: '/covers/sn-tenancy.jpg'
description: 'The last episode of the series. Two requests in flight, and one tenant read the other\'s id. Measured on both stacks: ThreadLocal and AsyncLocalStorage, the cost of request scope, and a rollout that 791 users saw differently.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-39-tenancy-flags.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'feature-flags']
series: 'Spring Boot to NestJS'
episode: 40
duration: '4:15'
draft: true
---

Two customers call a NestJS payment service at almost the same moment, and acme's request answers with
globex's tenant id. Measured on 1 October 2026, in the last episode of the series. Request context must
be scoped to the request, and rollout decisions must agree across stacks.

## The current tenant

On Spring, a deliberately broken filter set a `ThreadLocal` and never cleared it: Tomcat reused the
thread, and the next request, with no tenant at all, saw acme. Clearing it in `finally` fixed it.

On Nest, the same habit as a module-level variable is worse: two requests in flight overwrote each other.
`AsyncLocalStorage`, and a request-scoped provider, kept them apart. But a singleton that injected a
request-scoped tenant was promoted into request scope: 100 requests, 100 instances.

## One rollout, two stacks

A 20% rollout, bucketing ported mechanically from Java to JavaScript: Spring enabled it for 208 users,
Nest for 999, and 791 users got a different answer from the two stacks. With OpenFeature and the flagd
provider reading one `flags.json` on both, none did. Share the evaluation contract, not just the
percentage.

Forty episodes, and the theme held to the end: the syntax often transfers, the runtime contracts do not.
The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
