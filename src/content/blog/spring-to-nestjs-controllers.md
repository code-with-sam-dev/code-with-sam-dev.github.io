---
title: 'Spring to NestJS Controllers: Two Silent Bugs'
youtube: 'CvlMM40YLvQ'
cover: '/covers/sn-controllers.jpg'
description: 'You port a Spring controller to NestJS line by line. It compiles, the application starts, the smoke test passes, and two things are already wrong. Nobody typed either of them.'
pubDate: 2026-09-22
sheet: '/downloads/spring-to-node-02-controllers.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 3
duration: '9:02'
draft: false
---

A faithful port is the dangerous kind. You go annotation by annotation, the
decorators line up, the parameters line up, the compiler is happy and the
application starts. Nothing in that process tells you that two parts of the HTTP
response are now decided differently.

Both of the bugs below return **200 or 201**. Neither crashes. Neither is caught
by a compiler, a linter, or a smoke test that only ever asks for a payment by
its id. Everything here was measured by running both applications on 22
September 2026, and one script reproduces all of it.

## `@Controller` does not mean what it means in Spring

Spring has two annotations where NestJS has one, and the difference is the part
that gets dropped in a port.

`@RestController` is `@Controller` with `@ResponseBody` already applied. That
second half is what makes your return value the response body. Take it away and
Spring does something completely different: a plain `@Controller` returning the
string `"hello"` hands that string to the view resolver as the **name of a
template**. The client gets an empty body.

```java
@Controller                       // note: no @ResponseBody
class PlainController {
  @GetMapping("/x")
  String hello() {
    return "hello";               // a VIEW NAME, not a response
  }
}
```

NestJS has exactly one `@Controller` decorator and it behaves like Spring's
`@RestController`:

```ts
@Controller('payments')
export class PaymentsController {
  @Get()
  hello() {
    return 'hello';               // the RESPONSE BODY
  }
}
```

Measured, on both:

```
Spring @Controller      body: (empty)
Spring @RestController  body: hello
NestJS @Controller      body: hello
```

So if you are reading Spring examples while writing Nest, which one you copy
decides whether your endpoint returns anything at all.

## The order you wrote the handlers in changes the answer

Here are two handlers. One maps to `:id`, one to the literal word `recent`, and
the parameter one is written first, because that is the order you write things
in when the general case comes to mind before the special one.

```ts
@Controller('payments')
export class PaymentsController {
  @Get(':id')
  byId(@Param('id') id: string) {
    return {handler: 'byId', id};
  }

  @Get('recent')
  recent() {
    return {handler: 'recent'};
  }
}
```

In Spring that order is irrelevant. It picks the most specific pattern, so
`/payments/recent` always reaches `recent()`. On a default NestJS setup the
handlers are tried in declaration order, `:id` matches the word `recent`, and it
wins:

```
Spring   200  {"handler":"recent"}
NestJS   200  {"handler":"byId","id":"recent"}
```

Status 200 on both. `/payments/123` still works on both. Nothing in your test
output goes red.

## And that is not a fact about NestJS

This is the part I got wrong first, and it is worth being precise about, because
"NestJS matches in declaration order" is a rule you will carry into the next
project and it is false.

**NestJS does not have a router.** It delegates to whatever HTTP library it sits
on, and the default is Express. Express keeps an ordered stack, so the first
match wins and a parameter route above a literal one swallows it. Run the exact
same controller, in the exact same order, on the Fastify adapter:

```
Express   {"handler":"byId","id":"recent"}
Fastify   {"handler":"recent"}
```

Fastify's router prefers a static segment, so it gives you the Spring answer.
Same file, same order, two different handlers, decided by an adapter choice
somebody made in `main.ts`.

The fix does not depend on knowing which adapter you are on. Declare literal
routes above parameter routes and both agree.

## The status code nobody typed

In Spring a handler returns 200 unless you say otherwise, whatever the verb. In
NestJS the default is **per verb**. A `GET` returns 200. A `POST` returns 201,
with nothing declared anywhere in your code.

```ts
@Post()
create(@Body() body: CreatePaymentDto) {
  return this.payments.create(body);   // -> 201
}
```

At the time of writing, in September 2026, that is NestJS 12. So a faithful port
silently changes the contract, and every client asserting on 200 breaks.

This is also where `ResponseEntity` went. You do not need it: return the object
and the framework serialises it. When the envelope genuinely matters, put
`@HttpCode` on the handler and say the number out loud.

```ts
@Post()
@HttpCode(200)
create(@Body() body: CreatePaymentDto) {
  return this.payments.create(body);   // -> 200
}
```

## Reproduce all of it

```bash
git clone https://github.com/code-with-sam-dev/spring-to-node
cd spring-to-node
docker compose up -d
./scripts/verify-routing.sh
```

That script runs both applications and both adapters, asserts each claim before
printing it, and fails rather than printing something plausible. Every number on
this page came out of it.
