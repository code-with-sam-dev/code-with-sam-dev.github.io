---
title: 'Spring to NestJS Modules: Registered Is Not Visible'
youtube: 'WNAgcT3acsw'
cover: '/covers/sn-modules.jpg'
description: 'A service that exists, that Nest built, and that the module next door still cannot inject. Nothing is misspelled. The provider is private to its module.'
pubDate: 2026-09-23
sheet: '/downloads/spring-to-node-03-modules.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 4
duration: '6:02'
draft: false
---

In a typical Spring Boot application with one application context, a component
that scanning discovers can be injected anywhere in that context. Packages
organise your code, but they do not create a boundary for dependency injection.

NestJS is different, and it is the first thing that bites when you split a Nest
app into modules. Everything below was measured by running both stacks on 23
September 2026, on NestJS 12 and Spring Boot 4.1.1, and one script reproduces
all of it.

## It exists, and it is still refused

The payment service below is correct, and Nest builds it. Start its module on
its own and ask whether `pay_1` has been paid, and it answers `true`.

```ts
@Injectable()
export class PaymentsService {
  private readonly paid = new Set<string>(['pay_1']);

  isPaid(id: string) {
    return this.paid.has(id);
  }
}

@Module({ providers: [PaymentsService] })
export class PaymentsModule {}
```

Now a receipts service in its own module asks for it through the constructor,
and the container refuses:

```text
Nest can't resolve dependencies of the ReceiptsService (?).
Please make sure that the argument PaymentsService at index [0]
is available in the ReceiptsModule module.
```

Not missing. **Not available there.** The NestJS documentation says it almost
word for word: a module encapsulates its providers.

## Open both doors

A provider has to pass through two doors. The module that owns it **exports**
it, and the module that wants it **imports** that module.

```ts
@Module({
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

@Module({
  imports: [PaymentsModule],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
```

With both lines, the same classes answer `receipt for pay_1`. With only one of
them, you get exactly the same refusal as with neither. Importing a module only
gives you what that module exports.

## Two errors that look the same

When **no name** appears where the dependency should be, the parameter's type
was erased, usually because it was an interface. Give it a token.

```text
...the argument at index [0] is available in the current module.
```

When **the class is named**, Nest knows exactly what you asked for, and the
problem is visibility. Check the doors.

```text
...the argument PaymentsService at index [0] is available in the ReceiptsModule module.
```

One honest limit: a missing import, a missing export and both missing print the
identical message. The name tells you to look at the doors, not which door is
shut.

## The token is the identity

Two gateways, built from the same class, each by a factory that reads the same
configuration. A factory provider is the nearest thing Nest has to a `@Bean`
method, and because each is registered under its own token, the consumer asks
for each one by token. In Spring you would reach for `@Qualifier`.

```ts
{
  provide: PRIMARY_GATEWAY,
  useFactory: (cfg: { host: string; timeoutMs: number }) =>
    new Gateway(`https://${cfg.host}/v2`, cfg.timeoutMs),
  inject: [CONFIG],
},
{
  provide: FALLBACK_GATEWAY,
  useFactory: (cfg: { host: string; timeoutMs: number }) =>
    new Gateway(`https://${cfg.host}/v1`, cfg.timeoutMs * 2),
  inject: [CONFIG],
},
```

## Transient is not quite prototype

The default matches Spring: one instance for the application. Transient sounds
like Spring's prototype, and mostly behaves like it, but not in one shape:

| | Nest transient | Spring prototype |
|---|---|---|
| two different consumers | 1 and 2 | 1 and 2 |
| one consumer, injected twice | **3 and 3** | **3 and 4** |

Transient is one instance per consumer. Prototype is one per injection point.
And `get()` refuses a transient provider outright; use `resolve()`.

## The escape hatch

`@Global()` makes a module's exports visible everywhere without an import, and
it is useful for genuinely cross cutting things like configuration. The NestJS
documentation's own warning is the right note to end on: making everything
global is not a recommended design practice. Do not use it to erase the
boundary you just learned.

The full code for every episode is in the
[repository](https://github.com/code-with-sam-dev/spring-to-node), and the
[design sheet](/downloads/spring-to-node-03-modules.pdf) carries every snippet
above on one page.
