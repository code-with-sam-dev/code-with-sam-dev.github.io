---
title: 'Graceful Shutdown in NestJS, for Spring Developers: Payment Killed'
cover: '/covers/sn-shutdown.jpg'
description: 'A stop signal half a second into a payment: NestJS as created was gone in milliseconds, Spring Boot 4.1 finished the payment and drained. Measured on both: Actuator and Terminus, shutdown hooks, and the readiness flip.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-37-shutdown.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'kubernetes']
series: 'Spring Boot to NestJS'
episode: 38
duration: '3:18'
youtube: 'yxDzpYqNyBE'
draft: false
---

A deploy sends a stop signal to a NestJS service half a second into a three second payment. With Nest
as created, the process was gone milliseconds later and the payment got a connection reset. Measured on
1 October 2026. Graceful shutdown has three separate jobs: stop advertising readiness, finish the work in
flight, then exit. One shutdown hook is not the whole protocol.

## Each stack as it comes

Spring Boot 4.1 with Actuator and nothing configured: `server.shutdown` is graceful and the health probes
are on by default. The payment finished with 200, readiness answered 503 while new requests were still
served, then connections were refused.

On Nest, `enableShutdownHooks()` finished the payment, but new requests were reset at once: no window for
traffic to move.

## The drain on Nest

A readiness check that reports 503 from `beforeApplicationShutdown`, and
`TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 2000 })`: the payment finished, readiness said 503
while new requests were still served, then connections were refused. The same shape as Spring.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
