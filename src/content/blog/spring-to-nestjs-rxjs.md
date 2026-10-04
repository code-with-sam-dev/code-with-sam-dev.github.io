---
title: 'RxJS for Spring Developers: The Customer Left, the Card Was Charged'
cover: '/covers/sn-rxjs.jpg'
description: 'Reactor and RxJS share operators, not runtime contracts. Measured on Spring WebFlux and NestJS: what a handler returning a stream sends, the default concurrency of flatMap and mergeMap, and what happens to the work when the client disconnects.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-33-rxjs.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'rxjs']
series: 'Spring Boot to NestJS'
episode: 34
duration: '3:40'
youtube: 'l4AP75udGcQ'
draft: false
---

A customer closes the tab half a second into a two second charge. On Spring WebFlux, the cancellation
reached the publisher and nothing was charged. On our NestJS on Express route, the returned Observable
kept running and the card was charged. Measured on 1 October 2026. RxJS and Reactor share operators,
not runtime contracts.

## Three differences behind the same names

- **The returned value.** WebFlux encoded `Flux.just(1, 2, 3)` as `[1,2,3]`. A Nest controller
  returning `of(1, 2, 3)` answered `3`: Nest waits for completion and sends the last value.
- **Concurrency.** A thousand 200 ms tasks with no concurrency argument: Reactor's `flatMap` ran about
  256 at once, RxJS `mergeMap` all 1000. With `mergeMap(work, 256)`, the peak was 256.
- **Cancellation.** WebFlux cancelled on disconnect. Our Nest route needed the response close wired in
  with `takeUntil`; then nothing was charged. Keep the charge idempotent anyway.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
