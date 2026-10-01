---
title: 'Application Events in NestJS, for Spring Developers: Rolled Back, Receipt Sent'
cover: '/covers/sn-events.jpg'
description: 'A declined payment rolled back, and the receipt email had already gone, on Spring Boot with a plain @EventListener and on NestJS with @OnEvent. Measured: who waits, who hears a failure, and how to emit only after the commit.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-28-events.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'events']
series: 'Spring Boot to NestJS'
episode: 29
duration: '3:49'
draft: true
---

A payment is declined and the transaction rolls back. The payment is not in the database, and the
customer still got a receipt email. That happened on Spring Boot with a plain `@EventListener` and
on NestJS with `@OnEvent`, measured on 1 October 2026 against Postgres. Publishing inside a
transaction does not make the event transactional.

## Who hears a failure

A Spring listener that throws threw straight back to `publishEvent`. A Nest listener that throws,
sync or async, was caught and logged, and `emit()` did not throw. With `suppressErrors: false`, an
async listener's error was not caught at all: the process exited, 18 ms in.

## Who waits

With a 300 ms listener, Spring's `publishEvent` returned after 303 ms, and after 1 ms with `@Async`.
Nest's `emit()` returned at 7 ms while the listener ran to 307 ms; `emitAsync()` waited 302 ms. Only
`emitAsync` with `suppressErrors: false` handed the listener's error back to the publisher.

## The transaction

Spring's `@TransactionalEventListener` did not run on rollback and ran after the commit when it
committed. Nest's `@OnEvent` ran inside the open transaction. The fix on Nest is to emit after the
commit, and to use an outbox when the event must survive a crash between the two.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
