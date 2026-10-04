---
title: 'Logging in NestJS, for Spring Developers: Four Lines, Two Ids'
cover: '/covers/sn-logging.jpg'
description: 'One request logs from four places. On Spring Boot with ECS JSON, two lines carried the request id; on NestJS with its built in logger, none. Measured on both: JSON logs, the MDC and threads, and AsyncLocalStorage through nestjs-pino.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-35-logging.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'logging']
series: 'Spring Boot to NestJS'
episode: 36
duration: '3:52'
youtube: 'SLWsnQt14UM'
draft: false
---

One payment request logs from four places: the controller, a service, and two places that run later.
Search the logs for its request id. Measured on 1 October 2026: structured logs tell you what happened,
request context tells you which execution it belonged to.

## JSON is one switch on both

Spring Boot: `logging.structured.format.console=ecs`. Nest: `new ConsoleLogger({ json: true })`. Both
produced clean JSON. Neither switch invents a request id.

## The request id

On Spring, a filter put it in the MDC. The default text pattern does not print the MDC at all. In ECS
JSON the controller and service lines carried it; a `CompletableFuture` and an `@Async` method did not,
because the MDC is thread local by default. A `TaskDecorator` fixed `@Async`; the common pool still had
nothing.

On Nest, the built in logger carried it nowhere. With `nestjs-pino` taking it from the header, all four
lines carried it, including after an `await` and inside a `setTimeout` callback: AsyncLocalStorage.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
