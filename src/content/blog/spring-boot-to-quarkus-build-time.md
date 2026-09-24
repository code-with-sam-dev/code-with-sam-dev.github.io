---
title: 'Spring Boot to Quarkus: What Changes at Build Time'
youtube: 'B-E-KUi7Lb8'
duration: '6:57'
cover: '/covers/fq-flagship.jpg'
description: 'The same payment service in Spring Boot and Quarkus. Controllers, injection and configuration translate almost line for line. Two things do not: who owns the transaction when you save, and which of your settings are decided before the application starts.'
pubDate: 2026-09-23
sheet: '/downloads/spring-to-quarkus-build-time.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-quarkus'
video: 'https://youtu.be/B-E-KUi7Lb8'
tags: ['quarkus', 'spring-boot', 'java', 'transactions', 'postgresql']
series: 'Spring Boot to Other Stacks'
episode: 1
draft: false
---

Two payment services, one Spring Boot and one Quarkus. Both have a fraud check,
and both switch it on with the same property. I built each one with fraud
checks turned off, then started them with the property set to true. Spring
turned fraud checks on. Quarkus did not.

It is not a bug. It is the one idea that makes Quarkus different from
everything you know in Spring, and everything else, as it turns out, you can
read on day one.

Everything below was run on 23 September 2026 on Spring Boot 4.1.1, Quarkus
3.39.5 and Java 25, and every result is reproduced by the repository.

## The move, in one table

| Spring habit | Quarkus | Verdict |
| --- | --- | --- |
| `@RestController`, `@GetMapping` | `@Path`, `@GET` | transfers |
| `@Service`, constructor injection | `@ApplicationScoped`, same constructor | transfers |
| `@Value("${...}")` | `@ConfigProperty(name = ...)` | transfers |
| `save()` is transactional by default | `persist()` needs `@Transactional` | rewired |
| `@ConditionalOnProperty`, read at start | `@IfBuildProperty`, decided at build | bites |

## save() owned the transaction. persist() does not.

The Spring service has no `@Transactional` anywhere and still writes the row,
because Spring Data's `save()` opens its own transaction. Translate it line for
line to Panache and `persist()` throws:

```text
TransactionRequiredException: Transaction is not active, consider adding
@Transactional to your method to automatically activate one.
```

Add `@Transactional` to the service method and the row is written. To be fair
to Quarkus, that error names its own fix. The next surprise does not.

## True. Still off.

```java
// Spring: read at start
@ConditionalOnProperty(name = "payments.fraud-check.enabled", havingValue = "true")

// Quarkus: decided at build
@IfBuildProperty(name = "payments.fraud-check.enabled", stringValue = "true")
```

Built with `false` and started with `true`:

```text
Spring   GET /fraud-check  {"fraudCheck":"present"}
Quarkus  GET /fraud-check  {"fraudCheck":"absent"}
```

Spring reads the environment when the application starts. Quarkus made the
decision during the build: built with false, the bean was removed before the
application ever ran. The Quarkus CDI reference says it directly: "Properties
set at runtime have absolutely no effect on the bean resolution using
@IfBuildProperty".

## What the warning catches, and what it misses

Quarkus does check for this in its own configuration. Change
`quarkus.application.name` at runtime and it warns at startup that a build time
property cannot be changed at runtime. Set
`quarkus.config.build-time-mismatch-at-runtime=fail` and start the service with
your property set to true: it starts normally, prints no warning, and the fraud
check is still absent. The check protects Quarkus settings. It does not protect
a property you used in `@IfBuildProperty`.

## Spring does this too, if you ask

With Spring's ahead of time processing, conditions are evaluated at build time
as well: "Environment properties that impact the presence of a bean
(@Conditional) are only considered at build time." So this is not Quarkus being
strange. Default Spring decides at start up. Quarkus moves many framework
decisions to build time, all the time.

**Quarkus did not ignore your setting. It had already used it, at build time.
Know which of your settings are decided before the application starts.**

## Run it yourself

```bash
git clone https://github.com/code-with-sam-dev/spring-to-quarkus
cd spring-to-quarkus
docker compose up -d
scripts/verify-hook.sh
```
