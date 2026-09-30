---
title: 'Spring to NestJS Exception Filters: 500 or Process Exit?'
youtube: 'pFFWGDgG0W8'
cover: '/covers/sn-errors.jpg'
description: 'An exception thrown inside a request becomes a response on both Spring and NestJS. A rejected promise nobody owns never reaches a filter, and on Node 22 it ends the process. Measured on both stacks, with the filter, the ControllerAdvice beside it, and the two honest fixes.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-07-errors.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 8
duration: '5:37'
draft: false
---

One line in a NestJS handler: a background write called with no `await` and no `.catch()`.
The request returns normally. Then the write fails, and the whole Node process exits with
code 1. At the time of recording, on Node 22, that is Node's default for an unhandled
rejection, and it has been since Node 15. It is not NestJS exception handling.

Everything below was measured on 30 September 2026, on Node 22, NestJS 12 and Spring Boot
4.1.1.

## Inside a request, an error becomes a response

Thrown from a handler, all three shapes became responses on both stacks, and both apps kept
serving:

| Thrown | NestJS | Spring |
|---|---|---|
| a plain error | 500, generic | 500, generic |
| a domain exception, not translated | 500, generic | 500, generic |
| a framework not found | 404, message kept | 404, message dropped |

For an error the framework does not recognise, the generic 500 is the safer default. But a
client can act on insufficient funds, so it deserves a deliberate contract.

## The filter, and the advice beside it

```ts
@Catch(InsufficientFunds)
class InsufficientFundsFilter implements ExceptionFilter<InsufficientFunds> {
  catch(exception: InsufficientFunds, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    // 409: the account's current state prevents it. Not 402, still reserved.
    res.status(HttpStatus.CONFLICT).json({
      error: 'insufficient_funds',
      shortfallInMinorUnits: exception.shortfall,
      currency: exception.currency,
    });
  }
}
```

Registered with `app.useGlobalFilters(new InsufficientFundsFilter())`, it answers 409 with
the shortfall and the currency. A `@RestControllerAdvice` with an `@ExceptionHandler` for the
same exception answers with the same status and the same body. The concept transfers almost
exactly; the difference is that Spring finds the advice by component scanning, while the
NestJS filter is registered explicitly.

## Give every promise an owner

The same failure, three ways, each one line different:

- no owner: `writeAudit();` and the process exits with code 1
- deliberately detached: `void writeAudit().catch(...)` that logs it, and the process stays up
- part of the request: `await debitAccount();` and the rejection reaches the same filter, 409

The filter was never broken. The error simply never reached it. Process-level hooks are for
last-resort logging, not the fix.

The full code for every measurement is in the repository, and the free design sheet above has
the filter, the advice and the checklist on one page.
