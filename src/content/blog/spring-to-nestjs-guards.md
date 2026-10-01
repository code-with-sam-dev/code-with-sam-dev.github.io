---
title: 'NestJS Guards for Spring Developers: The Route You Forgot'
cover: '/covers/sn-guards.jpg'
description: 'A refunds route added beside a guarded payments controller answered 401 in Spring Boot and 200 in NestJS. Measured: global guards with a public marker, 401 against 403, and why @PreAuthorize and a Nest role guard protect different things.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-19-guards.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'security']
series: 'Spring Boot to NestJS'
episode: 20
duration: '4:10'
youtube: 'AVfNH8f-Qpw'
draft: false
---

A payments API with a guard on the payments controller. Someone adds a refunds endpoint and writes
no security code for it. An anonymous request to the new route answered 401 in Spring Boot and 200
in NestJS. Measured on 30 September 2026.

## The difference is scope

With Spring Security on the classpath, Spring Boot secures web applications by default: the filter
chain sits in front of every route. A Nest guard protects exactly what it is bound to, a handler, a
controller, or the whole application if you register it that way. The refunds controller was never
bound, so no guard ran.

## Make it global

Register the guard as `APP_GUARD` and mark the routes that really are open with a `@Public()`
decorator the guard reads through the `Reflector`. Payments 401, refunds 401, health 200. Now
forgetting protects the route instead of exposing it.

## 401 or 403

A guard that returns `false` gives 403. A missing or invalid token is unauthenticated, which is a 401, so
throw `UnauthorizedException` for it and keep 403 for a caller who is known but not allowed.

## Method authorization

`@PreAuthorize("hasRole('ADMIN')")` did nothing until `@EnableMethodSecurity` was on: a plain user
got 200 and a direct call ran. With it, 403, and the direct call was refused. A Nest `@Roles` guard
refused a user through the route, but the service called directly still ran. This guard protects
entry through the route, not the method.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
