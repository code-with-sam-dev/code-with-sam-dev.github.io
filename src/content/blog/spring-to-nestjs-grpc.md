---
title: 'gRPC in NestJS, for Spring Developers: 1999 Plus 1 Is "19991"'
cover: '/covers/sn-grpc.jpg'
description: 'One proto served by Spring Boot and NestJS. An int64 amount plus one: 2000 on Spring, "19991" on Nest with the default loader. Measured on both: the int64 mapping, a throwing handler, and why a missed deadline did not stop the charge.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-32-grpc.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'grpc']
series: 'Spring Boot to NestJS'
episode: 33
duration: '3:45'
draft: true
---

One `payments.proto`, served by Spring Boot and by NestJS. A payment of 1999 cents arrives and the
handler adds one: 2000 on Spring, `"19991"` on Nest. Measured on 1 October 2026. Same proto, different
runtime types.

## The 64 bit integer

Java mapped `int64` to a `long`. Nest passes its loader options straight to `@grpc/proto-loader`, and
with none the amount arrived as a Long object: `typeof` object, zero not equal to `0`, and plus one
joined strings. With `longs: Number` it was a number again, but a value just past 2^53 arrived one
lower. That is JavaScript numbers, not gRPC. Pick the representation deliberately.

## Errors and deadlines

A handler that threw was masked on both stacks: `UNKNOWN`, with a generic description. A client that
set a 300 ms deadline on a one second charge got `DEADLINE_EXCEEDED` on both, and the server completed
the charge anyway on both. A deadline stops the waiting, not the work: check for cancellation before
the step with the side effect, and make that step idempotent.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
