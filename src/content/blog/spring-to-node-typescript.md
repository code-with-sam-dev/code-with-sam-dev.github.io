---
title: 'TypeScript for Java Developers: The 20% That Bites'
youtube: 'IF5k1e3m4dQ'
cover: '/covers/sn-typescript.jpg'
description: 'Your Java instincts read TypeScript correctly about eighty percent of the time. The other twenty percent looks identical and behaves completely differently, and that is where NestJS will bite you.'
pubDate: 2026-09-22
sheet: '/downloads/spring-to-node-01-typescript.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['typescript', 'nodejs', 'nestjs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 2
duration: '14:44'
draft: false
---

You can nearly read a NestJS file already. There is a class, a decorator that
looks like an annotation, a constructor taking a dependency, and a method mapped
to a route. Your instincts serve you well, right up until they do not.

This episode is about the part where they do not. Everything below was run on a
real machine on 22 September 2026, and one command reproduces all of it.

## The container will not build, and the reason is one line

Here is the most ordinary piece of code in a Spring codebase, written in NestJS:

```ts
@Injectable()
class PaymentsService {
  constructor(private readonly gateway: PaymentGateway) {}
}
```

`PaymentGateway` is an interface. This compiles with no errors, and then the
application does not start:

```
Nest can't resolve dependencies of the PaymentsService (?). Please make sure
that the argument at index [0] is available in the current module.
```

The module is fine. The provider is registered. The reason is in the compiled
output:

```js
__metadata("design:paramtypes", [Object])
```

When you decorate a class, the compiler records what the constructor takes so
the container can read it back. After erasure there is no interface left to
record, so it records `Object`, and `Object` is not something the container has
a provider for. Search the compiled file for the interface name and you get
**zero** results.

## The fix changes one thing, and recovers nothing

```ts
const PAYMENT_GATEWAY = Symbol('PaymentGateway');

@Injectable()
class PaymentsService {
  constructor(
    @Inject(PAYMENT_GATEWAY)
    private readonly gateway: PaymentGateway,
  ) {}
}

@Module({
  providers: [
    {provide: PAYMENT_GATEWAY, useClass: StripeGateway},
    PaymentsService,
  ],
})
class AppModule {}
```

The interface is still erased, exactly as erased as it was. The constructor
simply stopped asking for a type and started asking for a value that exists at
runtime. That is why every NestJS codebase is full of tokens, and it is not
ceremony. It is the price of a type system that goes home at compile time.

## The one that is dangerous rather than annoying

A field declared `amountInMinorUnits: number`, sent by a client as a string.
Nothing binds, so the string arrives untouched:

```
typeof amount : string
amount + 1    : 100001
amount * 2    : 20000
```

Same field, two adjacent lines, one of them wrong. It is broken by **operator**.
Every test that multiplies passes. The one place you add a fee quietly grows a
digit, and nothing throws.

## Reproduce all of it

```
git clone https://github.com/code-with-sam-dev/spring-to-node
cd spring-to-node && ./scripts/verify-di-tokens.sh
```

Both demos assert their own claim before printing it, so a wrong sentence in
this article fails the script rather than reaching you.

Measured on TypeScript 6.0.3, Node 22.22.2 and NestJS 12.0.3. The decorator
behaviour in particular has changed across TypeScript versions, so check the
date on anything else you read about it.
