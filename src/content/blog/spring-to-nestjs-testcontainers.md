---
title: 'Testcontainers for NestJS, for Spring Developers: Fresh Database, Still Two'
cover: '/covers/sn-testcontainers.jpg'
description: 'A Postgres container per run gave 1 then 2 on every run, on Spring and on NestJS: clean runs, shared tests. Measured: a container per class or file against one for the whole run, and why the order starts to decide.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-18-testcontainers.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'testing']
series: 'Spring Boot to NestJS'
episode: 19
duration: '3:18'
draft: true
---

Last episode the same two tests counted 1 and 2, then 3 and 4 on the next run. With a Postgres
container from Testcontainers, every run counted 1 and 2, on Spring and on NestJS. The old rows are
gone, but the second test still sees the first test's row. Measured on 30 September 2026.

## Per run, not per test

The container lives for the class or the file, so every run starts empty and the tests inside it
share. On this machine, with the image cached, a container started in a little over a second.

## Where you own the container

Three Spring classes with their own static `@Container` started three containers, and each class
saw only its own row. Three Nest files that each start one cost about four seconds of starts and
stops. One container for the run, a base class in Spring or a Vitest `globalSetup` that hands the
URI over with `provide` and `inject`, starts once, and then the classes and files saw 1, 2 and 3 in
whatever order they ran. Share the container, and the database is shared too.

## Container for the run, reset for the test

One container per run, plus episode 18's truncate before each test.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
