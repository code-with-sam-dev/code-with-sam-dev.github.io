---
title: 'Spring to NestJS Middleware and Interceptors: Filter ≠ Middleware'
youtube: 'LzQq1S7sV5U'
cover: '/covers/sn-middleware.jpg'
description: 'A Spring filter catches downstream errors with a try block around chain.doFilter. The same try block around next() in NestJS middleware catches nothing. Measured on both stacks, with the interceptor that does see the error, one map() that reshapes every response, and the Spring hook whose name misleads.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-08-middleware.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 9
duration: '4:37'
draft: false
---

Every Spring developer has wrapped `chain.doFilter` in a try block. When the handler throws,
the exception travels back up through that call and the filter catches it. Here it caught a
`ServletException` wrapping the original `IllegalStateException`.

The same instinct in NestJS middleware catches nothing. Measured on 30 September 2026, on
Node 22, NestJS 12 and Spring Boot 4.1.1:

```
GET /plain -> 500
  middleware: calling next()
  handler: throwing
  middleware: next() returned, headersSent=false
  middleware: finish, status 500
```

The handler runs inside `next()` and throws. `next()` still returns normally, and the 500
has not even been written yet. NestJS handles the exception inside its own route execution
and writes the response afterwards. Awaiting `next()` changes nothing.

## The hook that sees the error

One request, measured: middleware, guard, interceptor, pipe, handler, then back out through
the interceptor. The exception filter is the escape path, taken only on a throw. An
interceptor receives the handler result as a stream from `next.handle()`, so both the return
value and the error flow through it:

```ts
return next.handle().pipe(
  map((data) => ({
    data,
    meta: {
      path: `${method} ${url}`,
      tookMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6),
    },
  })),
);
```

## The Spring name that misleads

`HandlerInterceptor.postHandle` looks like the after half. Measured, `ResponseBodyAdvice`
ran first, and `postHandle` was handed no model at all. Spring's own documentation points to
`ResponseBodyAdvice` for reshaping a REST body, and it produced the same envelope as the
NestJS interceptor. There is no single Spring class that maps to a NestJS interceptor: map
capabilities, not names.

The full code for every measurement is in the repository, and the free design sheet above
has the interceptor, the advice and the "which hook" checklist on one page.
