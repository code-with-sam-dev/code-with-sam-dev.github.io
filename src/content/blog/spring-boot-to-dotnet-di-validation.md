---
title: 'Spring Boot to .NET 10: The DI Validation Trap'
youtube: 'erxnj9cU-8Q'
duration: '6:32'
cover: '/covers/fd-flagship.jpg'
description: 'The same payment service in Spring Boot and ASP.NET Core. It refused to start in Development and started in Production, and nothing changed but the environment. Four mistakes a Spring developer brings to .NET, each measured on both.'
pubDate: 2026-09-24
sheet: '/downloads/spring-to-dotnet-di-validation.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-dotnet'
video: 'https://youtu.be/erxnj9cU-8Q'
tags: ['dotnet', 'aspnet-core', 'spring-boot', 'java', 'dependency-injection', 'ef-core']
series: 'Spring Boot to Other Stacks'
episode: 2
draft: false
---

This ASP.NET Core app refused to start in the Development environment. I ran
exactly the same build as Production. It started, and then request two was
given request one's ID. Nothing changed in the code. Only the environment
changed.

Everything below was run on 24 September 2026 on Spring Boot 4.1.1 and .NET
10 LTS, using ASP.NET Core's built-in dependency injection container with the
normal host defaults. Every result is reproduced by one script in the
repository.

## The move, in one table

| Spring instinct | ASP.NET Core | Consequence |
| --- | --- | --- |
| A missing bean stops startup | Production starts | 500 on the first request |
| Request scope finds the request | A singleton captures a scoped service | The first request's ID, every time |
| Two candidates is an error | The last registration wins | Registration order is behaviour |
| Change it inside a transaction | Tracking is not saving | Call SaveChanges |

## Failed in Development, started in Production

Checkout needs a payment gateway and none is registered. In Development the
app refuses to start: `Unable to resolve service for type IPaymentGateway`.
Switch the same build to Production and it starts; the first request to
checkout returns 500. The generic host documentation is explicit: it "enables
scope validation and dependency validation when the environment is
Development". Outside Development, with these defaults, both checks are off.

## Same ID, every request

`AuditLog` is registered as a singleton and depends on `RequestContext`, which
is scoped. Built once, the singleton captures the scoped context it was given,
so later requests keep seeing that captured instance:

```text
audit log sees a5e8233b-c621-4bc2-8423-a562a8f3e995,
  this request is 503119e1-d2f1-46f5-9097-fd3700ac22f1
audit log sees a5e8233b-c621-4bc2-8423-a562a8f3e995,
  this request is 012755b8-1fbd-4683-b470-1fe8307cced7
```

Spring's request scope annotation uses a scoped proxy by default, so each call
finds the current request. To be fair, Spring can capture shorter lived beans
in other setups; this compares ASP.NET Core scoped with Spring request scope.

## Validation fixes detection, not the graph

```csharp
builder.Host.UseDefaultServiceProvider(options =>
{
    options.ValidateScopes = true;
    options.ValidateOnBuild = true;
});
```

With both on, Production refuses to start for both mistakes, like
Development. That moves when you find out. Registering the gateway, and
correcting the lifetime relationship, are the fixes.

## Stripe, then PayPal

Register two gateways and inject one: you get PayPal, the last registered. Ask
for the list and you get both. It still starts with validation on, because
two registrations are valid in the built-in container. In the Spring app, the
equivalent single bean injection refuses to start, "required a single bean,
but 2 were found", and you choose with `@Primary` or a qualifier.

## Tracking is not saving

In Spring, inside a transaction, you can change a loaded entity and never call
save: JPA and Hibernate write it at commit. Translate that line for line to EF
Core and commit without `SaveChanges`, and the database still has the old
amount. EF Core can track and detect the change; it only reaches the database
through `SaveChanges`.

## Run it yourself

```bash
git clone https://github.com/code-with-sam-dev/spring-to-dotnet
cd spring-to-dotnet
docker compose up -d
scripts/verify.sh
```

Nothing to install for .NET: the SDK runs in Microsoft's official container.
