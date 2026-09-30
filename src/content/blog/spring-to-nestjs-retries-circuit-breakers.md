---
title: 'Retries and Circuit Breakers in NestJS, for Spring Developers: One Request, Nine Calls'
cover: '/covers/sn-resilience.jpg'
description: 'One request while the payments API was down became nine calls on Spring Boot and NestJS. Measured: Spring 7 @Retryable and Resilience4j against the new @nestjs/resilience, nested retries, what gets retried, and a breaker that refused fifteen of twenty.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-22-resilience.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 23
duration: '5:13'
draft: true
---

One request to the service while the payments API was down, and the payments API received nine
calls, on Spring Boot and on NestJS. Nobody wrote a loop: two retry layers of three attempts each.
Measured on 30 September 2026.

At the time of recording Spring Framework 7 has its own `@Retryable`, enabled by
`@EnableResilientMethods`, and Resilience4j is the usual circuit breaker. Nest has a new first party
`@nestjs/resilience`, version 0.0.1, with `@Retry` and `@CircuitBreaker`.

## Count carefully

Spring's `maxRetries` counts retries after the first call; Nest's `attempts` counts every call. So
`maxRetries = 2` and `attempts: 3` are both three calls. `@Retryable` with no settings made four
calls, a second apart.

## One retry layer

A `@Retry` on a Nest handler over the new HTTP client's own retries made nine calls; with the
client's retries off, three. Spring's `@Retryable` over another `@Retryable`: nine. The Nest docs:
retry at the entrypoint or in the service policy, not both, and turn off retries underneath.

## What gets retried, and where

Spring retried a method that POSTs three times. Nest retried a POST handler once, and three times
with `idempotent: true`. Nest's decorator on an ordinary service method did not wrap it, and the
package warned at boot. Spring's `@Retryable` called through `this` ran once.

## Stop new calls once failure is established

Twenty callers with three attempts each made sixty calls. A circuit breaker with the same settings
on Resilience4j and on Nest's `@CircuitBreaker` let five calls through and refused fifteen, then let
one trial call through after a second and closed again.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
