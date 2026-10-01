---
title: 'NestJS Rate Limiting for Spring Developers: The Wrong User Blocked'
cover: '/covers/sn-rate-limiting.jpg'
description: 'Behind a proxy, client two''s first request got 429 on Spring Boot and NestJS. Measured: how far to trust X-Forwarded-For, keying by a verified user, in-memory counts against Redis, and a window edge where the two stacks disagreed.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-20-rate-limiting.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'security']
series: 'Spring Boot to NestJS'
episode: 21
duration: '4:57'
youtube: '4cO-54kSLIc'
draft: false
---

Three requests a minute per client. Behind a proxy, client one used its three and client two's very
first request got 429, on Spring Boot with Bucket4j and on NestJS with the throttler. Both were keyed
on the proxy's address. Measured on 30 September 2026.

## How far to trust the proxy

Express with `trust proxy` set to one hop, and Spring with `server.forward-headers-strategy=native`,
took the address the proxy appended. With `trust proxy` set to `true`, or Spring's `framework`
strategy, the key was the leftmost `X-Forwarded-For` entry, which the client writes: a client that
sent its own header passed six requests out of six. Trust the proxy path you control, and strip
client-supplied forwarded headers at the edge.

## Which identity

Two signed-in users behind one office address: keyed by address, the second was refused; keyed by
the verified user, established by authentication, each had a budget.

## Where the count lives

Two instances counting in memory allowed six requests against a limit of three, and a restart reset
the count. A counter in Redis allowed three and survived the restart, on both stacks.

## The edge of the window

Three per two seconds, a refusal at one second, then a request at 2.2 seconds: Bucket4j allowed it,
Nest refused it, because the throttler's `blockDuration` defaults to the `ttl`. Three every two
seconds is not one algorithm.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
