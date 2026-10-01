---
title: 'Kafka with NestJS, for Spring Developers: Same Group, Twice'
cover: '/covers/sn-kafka.jpg'
description: 'A Spring and a NestJS consumer both given the group payments handled ten messages twenty times. Measured against a real broker: the group suffix, a group the stacks could not share, a poison message, and the type header that made Spring refuse Nest''s JSON.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-26-kafka.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'kafka']
series: 'Spring Boot to NestJS'
episode: 27
duration: '4:37'
draft: true
---

Moving a payments consumer from Spring to NestJS one service at a time: the Spring consumer uses
the group `payments`, and the Nest consumer is given `payments` too. Ten payments arrived; they were
handled twenty times. Measured on 1 October 2026 against Kafka 4.2 with real processes.

## The group

Nest's Kafka transport appends `-server` to the group id, so the broker had two groups, each with all
three partitions. With `postfixId: ''` the names matched, and the Spring consumer logged
`InconsistentGroupProtocolException` and never joined: kafkajs names its assignor
`RoundRobinAssigner`, the Java client `roundrobin`. With Spring Kafka 4.1 and kafkajs 2.2.4, cut a
group over as a unit rather than mixing the two inside it.

## The poison message

A message that always throws, then five good ones on the same key: Spring's default error handler
tried ten times, skipped it and handled all five. Nest's event handler kept redelivering it for the
whole 30 second run, and none of the five ran. Messages on other partitions kept flowing: the
roadblock is partition-local.

## The wire contract

Spring's JSON serializer adds a `__TypeId__` header with the Java class name; Nest sends plain JSON.
Nest read both. Spring's typed deserializer refused Nest's message, and read both once told to ignore
type headers and use a default type.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
