---
title: 'Unit Testing NestJS with Vitest for JUnit Developers: Two Calls, Not One'
cover: '/covers/sn-vitest.jpg'
description: 'A mock shared by two tests carried its calls into the second test in a project nest new created today. Measured against Mockito: mock lifecycle on Vitest 4 and 5, clearMocks against mockReset, strict stubs, and vi.mock hoisting.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-16-vitest.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'testing']
series: 'Spring Boot to NestJS'
episode: 17
duration: '4:03'
draft: true
---

A NestJS project created today with `nest new`, one `vi.fn()` shared by two tests, each
calling it once. The second test saw two calls. The same two tests with a Mockito `@Mock`
field saw one call each. Measured on 30 September 2026.

## Which Vitest you are on

Vitest 4 keeps a mock's call history between tests unless `clearMocks` is set. Vitest 5
changed that default, and the same test reported one call each. But `@nestjs/schematics`
12.0.6 still pins `"vitest": "^4.1.2"`, and that range never reaches 5. On the generated
setup, set `clearMocks: true`, or upgrade to Vitest 5 deliberately after its migration notes.

## Three reset settings

With a stub and a spy created once at describe scope: `clearMocks` cleared the history and
kept both, the closest match to Mockito. `mockReset` destroyed the stub before the first test
ran, so the balance came back `undefined`. `restoreMocks` put the spy back to the real method.
Create shared stubs in `beforeEach`.

## Strictness and hoisting

Mockito's strict stubs fail a test that stubs something it never uses. The same unused stub
passes in Vitest. And because `vi.mock` is hoisted to the top of the file, a factory that
reads a file constant fails with "Cannot access 'greeting' before initialization". In NestJS,
`overrideProvider` on the testing module is often the cleaner seam, the counterpart of
`@MockitoBean` (at the time of recording, `@MockBean` is gone in Spring Boot 4).

The full code for every measurement is in the repository, and the free design sheet above
has the checklist on one page.
