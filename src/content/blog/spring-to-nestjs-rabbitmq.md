---
title: 'RabbitMQ with NestJS, for Spring Developers: 19,000 Redeliveries'
cover: '/covers/sn-rabbitmq.jpg'
description: 'One payment that always fails: Spring Boot redelivered it over 19,000 times in ten seconds, NestJS delivered it once and lost it. Measured against a real broker: acknowledgement, dead letter queues, and the envelope that made Nest drop Spring''s message.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-27-rabbitmq.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'rabbitmq']
series: 'Spring Boot to NestJS'
episode: 28
duration: '4:24'
youtube: 'r33i1WN2I6Q'
draft: false
---

One payment that can never be settled, sent to a queue. Spring Boot's listener container, with its
defaults, redelivered it over 19,000 times in ten seconds, and it was still in the queue. NestJS,
with its defaults, delivered it once, and the queue was empty afterwards. Measured on 1 October 2026
against RabbitMQ 4.1 with real processes.

## Acknowledgement is the contract

Spring's container rejects a message whose listener throws and asks for a requeue by default: a
Spring default, not RabbitMQ's. Nest's RabbitMQ consumer defaults to `noAck: true`, so RabbitMQ had
already been told no acknowledgement was needed, and had nothing to redeliver.

## Acknowledge yourself, and decide where failures go

With `noAck: false` and `channel.ack` after success, the failing message stayed unacknowledged and
came back after a restart. With a dead letter queue, and requeue off in Spring or a nack without
requeue in Nest, both stacks tried it once and parked it.

## The envelope

Nest publishes `{ "pattern": ..., "data": ... }`; Spring's JSON converter publishes the bare object
with a `__TypeId__` header. Spring read Nest's message; Nest found no pattern in Spring's and dropped
it. Agree the envelope before two stacks share a queue.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
