---
title: 'Spring Boot to Micronaut: What Moves to Compile Time'
youtube: '3oBRAtK73yM'
duration: '7:45'
cover: '/covers/fm-flagship.jpg'
description: 'The same payment service in Spring Boot and Micronaut, and four small mistakes that behave differently. Micronaut generates much more of the framework at compile time, but compile time generation is not compile time validation of the whole application.'
pubDate: 2026-09-24
sheet: '/downloads/spring-to-micronaut-compile-time.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-micronaut'
video: 'https://youtu.be/3oBRAtK73yM'
tags: ['micronaut', 'spring-boot', 'java', 'transactions', 'postgresql']
series: 'Spring Boot to Other Stacks'
episode: 3
draft: false
---

I put `@Transactional` on a private method. Spring Boot built it and ran it.
Micronaut refused to build it at all. And Spring running it does not mean the
transaction ran: the method saves a payment and then rejects it for being over
the limit, and in Spring the rejected payment is still sitting in the table.

This is the move from Spring Boot to Micronaut for working Spring developers.
Everything below was run on 24 September 2026 on Spring Boot 4.1.1, Micronaut
5.1.5 and Java 25, and every result is reproduced by one script in the
repository.

## Most of it reads like Spring

A controller, a service injected through the constructor, a repository.
`@GetMapping` becomes `@Get`, `@PostMapping` becomes `@Post`. The annotations
change and the architecture does not.

## Where each mistake surfaces

| Mistake | Spring Boot | Micronaut |
| --- | --- | --- |
| A typo in a derived finder | builds, then refuses to start | the build fails |
| `@Transactional` on a private method | no framework error, no transaction | the build fails |
| A `@Transactional` method called from the same class | no framework error, no transaction | intercepted, rolled back |
| A bean nobody provides | refuses to start | starts, fails on the first request |

These are the default modes: Spring's proxy based transactions on the normal
JVM, without AOT, and Micronaut's lazy singletons. Spring's AspectJ mode does
apply transactions to calls from inside the class.

## The finder typo

`findByCurrencyy`, one letter too many. Spring builds, then refuses to start:
`No property 'currencyy' found for type 'Payment'; Did you mean 'currency'`.
Micronaut Data fails the build: it cannot query `Payment` on a property that
does not exist, and lists the ones that do.

That is a check against the entity model, not your database. The Micronaut
Data documentation says it will "actively check at compile time that a
repository method can be implemented and fail compilation if it cannot".

## Two kinds of proxy

Both frameworks apply transactions through a proxy. Spring's default is a
proxy around your bean, and a class based proxy cannot override a private
method, so the advice is simply never applied. Micronaut generates a real
subclass of your service at compile time. `javap` shows it:

```text
class dev.codewithsam.payments.$PaymentService$Definition$Intercepted
    extends dev.codewithsam.payments.PaymentService
    implements io.micronaut.aop.Intercepted
  public java.lang.Long record(long, java.lang.String);
```

A subclass cannot override a private method either, so instead of quietly
skipping it the build stops: "Method annotated as executable but is declared
private. Change the method to be non-private in order for AOP advice to be
applied."

The same picture predicts the self call. In Spring, a self call does not go
back through the transaction proxy, so the advice is bypassed and the rejected
payment is written. In Micronaut the bean is the generated subclass, so
`this.record()` lands on the override and the payment is rolled back.

## The rule that breaks

After three results it looks as if Micronaut catches mistakes earlier. A
checkout that needs a gateway nobody provides breaks that. Spring refuses to
start. Micronaut starts in well under a second, and the first request fails
with a 500: no bean of type `Gateway` exists.

That is by design: "by default `@Singleton`-scoped beans are created lazily
and on-demand. This is by design to optimize startup time."
`eagerInitSingletons(true)` makes the server refuse to start instead. That
moves when you find out; it does not fix anything, and it is a trade off
rather than a setting every application needs. Providing a gateway is the fix.

**Much more of Micronaut is generated at compile time. Bean creation can still
be lazy. Compile time generation is not eager validation.**

## Run it yourself

```bash
git clone https://github.com/code-with-sam-dev/spring-to-micronaut
cd spring-to-micronaut
docker compose up -d
scripts/verify.sh
```

`verify.sh` runs both test suites, lays each mistake over a scratch copy of
the app, and fails loudly if any result above stops being true.
