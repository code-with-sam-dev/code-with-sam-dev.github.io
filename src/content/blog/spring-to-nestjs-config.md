---
title: 'Spring to NestJS Configuration: It Started Broken'
youtube: 'JWVWArwHdfQ'
cover: '/covers/sn-config.jpg'
description: 'A required Spring @Value refuses to start when its property is missing. NestJS starts cleanly and hands you undefined, and the first payment fails. How to buy the startup failure back, and the boolean trap inside the obvious fix.'
pubDate: 2026-09-29
sheet: '/downloads/spring-to-node-05-config.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 6
duration: '5:21'
draft: false
---

In Spring, a constructor that asks for `${payment.gateway.url}` through a required
`@Value` refuses to start when the property is missing:

    Could not resolve placeholder 'payment.gateway.url' in value "${payment.gateway.url}"

On your machine, at startup, with the key named. In NestJS the same omission starts
cleanly, and the first payment fails in front of a customer:

    TypeError: Failed to parse URL from undefined/charges

Everything below was measured on 29 September 2026, on Node 22, NestJS 12, Zod 4 and
Spring Boot 4.1.1, and one script reproduces all of it.

## Spring does not fail fast on everything

That refusal belongs to the required `@Value`. Bind the same setting through
`@ConfigurationProperties` with no validation, and Spring starts too, with the URL set
to `null`. Add `@Validated` and `@NotNull`, and it refuses again.

## Every value is a string

The NestJS documentation says it directly: "Environment variables always arrive as
strings". So `FEATURE_ENABLED=false` turns the feature on, because any non-empty string
is truthy, and `PORT + 1` is `"30001"`.

## The fix, and the trap inside it

```ts
const schema = z.object({
  PAYMENT_GATEWAY_URL: z.url(),
  PORT: z.coerce.number().int(),
  FEATURE_ENABLED: z.stringbool(),
});

ConfigModule.forRoot({ validationSchema: schema });
```

Now the missing URL stops startup: `PAYMENT_GATEWAY_URL: Invalid input: expected
string, received undefined`. And use `z.stringbool()` for flags: `z.coerce.boolean()`
follows JavaScript's `Boolean()`, so it turns the string `"false"` into `true`.

Two traps while wiring it: `ConfigModule.forRoot` reads the environment when the module
is declared, so set variables first; and if the application exits with no message, turn
the logger back on.

The full code for every measurement is in the repository, and the free design sheet
above has the schema, the Spring comparison and the checklist on one page.
