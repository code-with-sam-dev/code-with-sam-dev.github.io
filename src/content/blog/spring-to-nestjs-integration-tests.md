---
title: 'NestJS Integration Tests with PostgreSQL for Spring Developers: Two Rows, Not One'
cover: '/covers/sn-integration.jpg'
description: 'Two integration tests against a real Postgres: 1 and 1 under @DataJpaTest, 1 and 2 in NestJS, 3 and 4 on the next run. Where the rollback really comes from, where a test transaction stops, and the reset that works for requests too.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-17-integration.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'testing']
series: 'Spring Boot to NestJS'
episode: 18
duration: '3:39'
draft: true
---

Two integration tests against a real PostgreSQL, each inserting one row and counting. Under
Spring's `@DataJpaTest`: 1 and 1. In a Nest testing module with TypeORM: 1, then 2, and on the
next run 3, then 4. Measured on 30 September 2026.

## Where the rollback came from

Not from Spring in general. `@DataJpaTest` wraps each test in a transaction and rolls it back. A
plain `@SpringBootTest` without `@Transactional` counted 1, then 2, exactly like Nest. A Nest
testing module gives you the application, not database isolation: you choose that yourself.

## Where a test transaction stops

A `QueryRunner` transaction started in `beforeEach` and rolled back in `afterEach` kept the row
written through the injected repository; only the write through `runner.manager` was rolled back.
A supertest request's write survived too. Spring has the same edge: MockMvc runs on the test's
thread and was rolled back, but a real HTTP request to the running server kept its row. The
Spring Boot reference says it plainly: separate threads, separate transactions.

## The reset that works for requests too

Truncating the table before each test gave 1 and 1, whichever connection wrote. With foreign keys,
truncate related tables together or cascade, and do not let parallel test files share one database.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
