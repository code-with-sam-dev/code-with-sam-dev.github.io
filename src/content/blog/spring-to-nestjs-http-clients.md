---
title: 'Calling APIs from NestJS, for Spring Developers: One Line, Four Traps'
cover: '/covers/sn-http-clients.jpg'
description: 'RestClient, @nestjs/axios and the new @nestjs/http-client all waited ten seconds by default. Measured: timeouts and what they do not cancel, the call that never ran, what counts as failure, and a one second timeout that took three.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-21-http-clients.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 22
duration: '4:54'
youtube: '3qKNEh1rpjU'
draft: false
---

The API you call takes ten seconds to answer. Spring's `RestClient`, the `HttpService` from
`@nestjs/axios`, and the new `HttpClient` from `@nestjs/http-client` all waited the full ten
seconds by default. Measured on 30 September 2026 against a real downstream server.

At the time of recording the Nest docs describe `@nestjs/http-client`, version 0.0.1, built on
`fetch`; `@nestjs/axios` remains available and is what most existing code uses.

## When it gives up

With a one second timeout, `RestClient` gave up after 1.2 seconds, `@nestjs/axios` after 1.0, and
the new client after 3.2 seconds with three hits at the downstream. The downstream saw the caller
hang up at one second and still finished its ten seconds of work: a timeout bounds your wait, it
does not cancel theirs.

## Whether it ran

`HttpService.get()` returns an Observable and sent nothing until converted with `firstValueFrom`;
`WebClient` without `subscribe` did the same. `RestClient` and the new `HttpClient` run when called.

## What counts as failure

All three clients turned a 500 into an error by default. Plain `fetch` resolved with `ok` false.

## Whether it tries again

The new client retries by default, and its timeout applies per attempt, which is where the three
seconds came from. A GET that always failed was sent three times, a POST once, and a PUT three
times: safe only if the endpoint really is idempotent. `RestClient` and `@nestjs/axios` tried once.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
