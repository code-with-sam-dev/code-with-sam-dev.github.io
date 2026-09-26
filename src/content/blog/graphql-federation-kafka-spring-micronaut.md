---
title: 'GraphQL Federation and Kafka, with Spring Boot and Micronaut'
youtube: 'oyaep6Gri78'
duration: '29:09'
cover: '/covers/fk-flagship.jpg'
description: 'One checkout split the way real teams split it: orders in Spring Boot, payments in Micronaut, composed by the Apollo Router, with Kafka between them. Every failure a senior interviewer asks about, built and measured.'
pubDate: 2026-09-25
sheet: '/downloads/graphql-federation-kafka.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-micronaut-federation'
video: 'https://youtu.be/oyaep6Gri78'
tags: ['graphql', 'federation', 'kafka', 'micronaut', 'spring-boot', 'java', 'outbox']
draft: false
---

Kafka was down. I placed an order anyway. One version of this checkout made the
customer wait about sixty seconds, and then said no. The other said yes in a
fraction of a second. Then I killed the service that said yes, before it could
tell anyone. When everything came back, that order was paid.

Everything below was run on 25 September 2026 on Spring Boot 4.1.1, Micronaut
5.1.5, Apollo Router 2.17.0, Kafka 4.2.1 and Postgres 17. Every result is
reproduced by one script in the repository.

## The system

Orders is a Spring Boot subgraph. Payments is a Micronaut subgraph. Each owns
its database and publishes its slice of one GraphQL schema. The Apollo Router
composes them into one endpoint, and Kafka carries `order-placed` and
`payment-captured` between them.

## What was measured

| Question | Result |
| --- | --- |
| Does the router fix N plus one? | It sent one `_entities` call for 20 orders. The databases ran 20 and 20 selects until `@BatchMapping` and a DataLoader made it 1 and 1 |
| A subgraph is down | HTTP 200, the total present, `payment: null`, an error tagged with the service |
| The payment field made non-null | the whole order comes back null |
| Kafka down, publish inside the request | refused after about 60 seconds, the producer's `max.block.ms` default, and rolled back |
| Kafka down, transactional outbox | accepted, survived the service being killed, paid after the restart |
| A crash before the offset commit | 2 payment rows without a unique key, 1 with it |
| A message that always fails | Spring's default retried 10 times; Micronaut's deprecated default skipped two good records in the same poll |
| One team changes `Order.id` to `String!` | composition refuses before anything is deployed |

## Spring and Micronaut, job by job

| Job | Spring Boot | Micronaut |
| --- | --- | --- |
| Resolve a field | `@QueryMapping`, `@SchemaMapping` | a data fetcher in a factory |
| Batch a field | `@BatchMapping` | a DataLoader, registered per request |
| Resolve an entity | `@EntityMapping`, `idList` | `Federation.transform`, `fetchEntities` |
| Consume Kafka | `@KafkaListener(topics, groupId)` | `@KafkaListener(groupId)` with `@Topic` |
| Publish to Kafka | `KafkaTemplate` | a `@KafkaClient` interface the compiler implements |
| A listener throws | 10 attempts, then logged | `NONE`: deprecated, skips the rest of the poll |

The full code, both configuration files key by key, the federation directives
and the interview questions are in the free design sheet above.
