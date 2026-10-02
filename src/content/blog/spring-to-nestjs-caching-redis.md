---
title: 'Caching in NestJS with Redis, for Spring Developers: Bob Saw Alice'
cover: '/covers/sn-caching.jpg'
description: 'A cached account endpoint served Alice''s balance to Bob on Spring Boot and NestJS. Measured: the key, the lifetime and the fill policy, including when @Cacheable(sync = true) helps on Redis and when it does not.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-23-caching.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'redis']
series: 'Spring Boot to NestJS'
episode: 24
duration: '4:26'
youtube: 'd_Vqui40gHk'
draft: false
---

Alice opened her account page: 1200. Bob opened his: 1200, with Alice's name on it. On Spring Boot
and on NestJS, with an ordinary cache in front of an ordinary endpoint. Measured on 30 September
2026, in memory and on Redis.

## The key

Nest's `CacheInterceptor` keys GET responses by URL, and `/me` is the same URL for everyone.
Spring's `@Cacheable` method took no arguments, because it read the user from the request, so every
caller shared one key. Put the verified user in the key: override `trackBy` in Nest, give
`@Cacheable` a `key` in Spring. Bob got his own balance on both.

## The lifetime

A write left the old copy on both stacks until it was evicted (`@CacheEvict`; `cache.del` of the
URL key in Nest). With no time to live, a Redis entry never expires on either stack; with one
second, it was reloaded after it expired.

## The fill policy

Twenty concurrent requests for a key not yet cached loaded it twenty times. `@Cacheable(sync = true)`
loaded once in memory, twenty times on Redis with the default cache writer, and once with the
locking writer, even across two replicas. In Nest, sharing the in-flight load made it once per
process, twice across two replicas: Redis shared the value, not the promise.

## Misses

Twenty requests for a payment that does not exist: Spring on Redis cached the null and loaded once;
Nest's interceptor did not cache this miss and loaded twenty times. Whether to cache a miss is a
policy decision.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
