---
title: 'GraphQL with Spring Boot: What the Server Pays'
youtube: '7VgEcSodl6Q'
duration: '27:08'
cover: '/covers/gq-flagship.jpg'
description: 'Twenty one REST calls became one GraphQL request. Then that one request ran eighty SQL queries. Everything a Spring Boot GraphQL server has to get right, built and measured.'
pubDate: 2026-09-26
sheet: '/downloads/graphql-spring-boot.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-graphql-in-depth'
video: 'https://youtu.be/7VgEcSodl6Q'
tags: ['graphql', 'spring-boot', 'java', 'n-plus-one', 'api-design']
draft: false
---

Twenty one REST calls became one GraphQL request. Same screen, one round trip.
Then I counted the database queries behind that one request: eighty.

The client's simplicity was real. So was the server's work. Everything below was
run on 26 September 2026 on Spring Boot 4.1.1, Spring for GraphQL 2.0.5 and
Postgres 17, and every result is reproduced by one script in the repository.

## What was measured

| Question | Result |
| --- | --- |
| The order list screen | REST 21 requests and 2,410 bytes; GraphQL 1 request and 1,608 bytes |
| Nested fields with `@SchemaMapping` | 20 customer, 20 order line and 40 product selects for one request |
| The same request with `@BatchMapping` | 1, 1 and 1 |
| An exception nobody maps | `INTERNAL_ERROR`, message hidden; an exception resolver makes it `NOT_FOUND` |
| The same broken query, two response types | 200 under `application/json`, 400 under `application/graphql-response+json` |
| `@PreAuthorize` on one field | anonymous `UNAUTHORIZED`, clerk `FORBIDDEN`, admin sees it, the name always arrives |
| 60 aliases at depth two | a depth limit let them through and 60 selects ran; a complexity limit rejected them at 120 over 100 |
| A schema field nobody resolves | null with no error; the startup schema inspection report names it |
| A deprecated field, then removed | still answers; then a 400 validation error |

## From Spring MVC, annotation by annotation

| Job | Spring MVC | Spring for GraphQL |
| --- | --- | --- |
| Read | `@GetMapping` on a URL | `@QueryMapping` on a field |
| Write | `@PostMapping` | `@MutationMapping` |
| Stream | server sent events or WebSocket by hand | `@SubscriptionMapping` returning a `Flux` |
| A nested field | another endpoint | `@SchemaMapping`, or `@BatchMapping` for one query per field |
| Map an exception | `@ExceptionHandler` | a `DataFetcherExceptionResolver` |

The full code, the interview questions and a production checklist are in the
free design sheet above.
