---
title: 'Spring to NestJS Request Validation: Spring Accepted This?'
youtube: 'Uw30SC3YD3g'
cover: '/covers/sn-validation.jpg'
description: 'Spring accepted a payment amount sent as a string and an extra isAdmin field. NestJS, with its validation pipe switched on, rejected both. Validation is really three jobs, and the two stacks put them in different places.'
pubDate: 2026-09-29
sheet: '/downloads/spring-to-node-06-validation.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 7
duration: '5:54'
draft: false
---

Send a payment amount as the string `"10000"`. Spring answers 201 and quietly converts it.
NestJS answers 400. Add an extra `"isAdmin": true` to a valid payment: Spring answers 201
and the field is gone; NestJS answers 400, "property isAdmin should not exist".

The catch: the NestJS side has its `ValidationPipe` switched on. Without it, the decorators
on your request class describe rules and nothing checks them at the boundary. Everything
below was measured on 29 September 2026, on NestJS 12 and Spring Boot 4.1.1 with Jackson 3.

## Three jobs hiding in one word

1. **Convert types.** Is `"10000"` a number? In Spring, Jackson does it by default.
2. **Unknown fields.** Drop, keep or reject? Jackson drops them by default.
3. **Check rules.** Amount at least 1, a known currency. Bean Validation and
   class-validator both reject a negative amount.

## The pipe, setting by setting

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

`transform` turns plain JSON into your class, `whitelist` removes undeclared properties, and
`forbidNonWhitelisted` rejects the request instead. Measured through a real request with
`transform` on and `whitelist` off, the handler received `isAdmin` and `role`; with
`whitelist` on, only the declared fields arrived. Whether that is a security problem depends
on what your code does next.

## Making Spring strict

Both Jackson behaviours can be switched off: disable string coercion and it refuses
`"10000"`; enable `FAIL_ON_UNKNOWN_PROPERTIES` and it refuses `isAdmin` by name. In Spring
Boot the switches live under `spring.jackson.deserialization.*`. At the time of recording,
Spring Boot 4.1.1 ships Jackson 3, and the imports moved to `tools.jackson.databind`.

The full code for every measurement is in the repository, and the free design sheet above
has the pipe, both request classes and the checklist on one page.
