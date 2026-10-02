---
title: 'Scheduled Jobs in NestJS, for Spring Developers: Every Job Twice'
cover: '/covers/sn-scheduling.jpg'
description: 'Two instances ran every scheduled tick twice on Spring Boot and NestJS. Measured: ShedLock against the new @nestjs/locks, a lock store that did not lock, overlapping runs, one thread and one event loop, and a real crash of the lock holder.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-24-scheduling.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 25
duration: '4:45'
youtube: 'AFcCQK9Slyc'
draft: false
---

A job that settles payments every second. The service scales to two instances, and every tick ran
twice, on Spring Boot and on NestJS. Each process runs its own scheduler. Measured on 30 September
2026.

## One instance per tick

ShedLock on Redis and Nest's new `@OnOneInstance` from `@nestjs/locks` (0.0.1 at the time of
recording) with a Redis lock store both gave three runs in three seconds, none twice. With Nest's
default lock store it was six again: that store lives in memory, per process. A lock gives at most
one run while the lease holds, not exactly one.

## Overlap and capacity

A 2.5 second job on a plain Nest `@Cron` every second had three copies running at once;
`waitForCompletion` held it to one in the process, `@WithoutOverlapping` through the lock. This
Spring `@Scheduled` method did not overlap itself, even with a pool of four. Boot's default
scheduler has one thread, and a heartbeat beside a slow job waited over 900 ms; in Node, a job that
awaits left the heartbeat alone, and one that held the event loop blocked it for a second.

## The crash

Killed one second into a four second job, the other instance took over in about four seconds under
Nest's renewed three second lease, and in nearly ten under ShedLock's ten second `lockAtMostFor`.
That followed the configured policy, not framework speed. Missed ticks are not caught up.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
