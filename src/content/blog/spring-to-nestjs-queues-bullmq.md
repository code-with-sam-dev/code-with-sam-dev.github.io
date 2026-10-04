---
title: 'Background Jobs in NestJS with BullMQ, for Spring Developers: Crashed, Nothing Sent'
cover: '/covers/sn-queues.jpg'
description: 'Five receipts handed to @Async or an unawaited promise, then a crash: zero sent. Measured with real processes: what a BullMQ queue keeps, the charge that ran twice, the defaults, and the payment whose receipt never reached the queue.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-25-queues.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'redis']
series: 'Spring Boot to NestJS'
episode: 26
duration: '4:39'
youtube: '2zFbjqqpkpg'
draft: false
---

Five receipt emails handed to the background so the request could answer fast. It answered in 12
milliseconds. One second later the process was killed and restarted: zero receipts sent, on Spring
Boot with `@Async` and on NestJS with a promise nobody awaited. Measured on 1 October 2026 with real
processes and SIGKILL.

## A queue keeps what was waiting

With the receipts in a BullMQ queue, four were sent within twelve seconds of the restart. The fifth,
running when the process died, came back 62 seconds later, once its lock expired and it was
treated as stalled: this setup's defaults, not a fixed recovery time.

## At least once

A job that recorded a charge and died before completing ran again: charged twice. The queue did
what it promises; the side effect has to be idempotent.

## Defaults and the gap

BullMQ's default is one attempt and one job at a time; set attempts, backoff and concurrency. And a
payment committed to Postgres before a crash never got its receipt job: a durable queue protects
work after it enters the queue, not the write that puts it there. That is what an outbox is for.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
