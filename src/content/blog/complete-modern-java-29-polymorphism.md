---
title: 'Java Polymorphism: One Method Call, Different Behaviour (Beginner)'
description: 'Episode 29 of Complete Modern Java. A checkout that asks what kind of payment it has, the same job done by letting each payment object answer, adding a voucher without changing the checkout, one variable with two objects, and the same in TypeScript.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-29-polymorphism.jpg'
sheet: '/downloads/complete-modern-java-29-polymorphism.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 29
duration: '6:52'
youtube: 'jtBaGUe6Y8I'
draft: false
---

The shop takes card and cash, and now vouchers too. Does checkout need another `if` every time a payment type is added?

## Asking what kind of payment it is

```java
int totalFor(String type, int priceCents) {
    if (type.equals("card")) {
        return priceCents + priceCents * 2 / 100;
    }
    if (type.equals("cash")) {
        return priceCents;
    }
    throw new IllegalArgumentException("unknown payment type: " + type);
}
```

Card and cash print `1020` and `1000`; voucher throws `unknown payment type: voucher`. An if statement is not wrong, and
for two fixed types it may be the simplest thing. But every new payment type means editing this method.

## Letting the object answer

```java
int totalFor(PaymentMethod method, int priceCents) {
    return method.totalCents(priceCents);
}
```

The same job, the same answer: `1020` and `1000`. Last episode's `VoucherPayment` (a fixed 50 cent fee) gives `1050`.
We still created the class and passed it in, but the checkout calculation did not change.

## One variable, two objects

A `PaymentMethod` variable holding a card prints `1020`; given a cash payment, the identical call prints `1000`. The
variable is still a PaymentMethod; the object changed. Every payment uses the same inherited `totalCents`, and inside
it Java calls the `feeCents` belonging to the actual object. That is polymorphism: the same call through a shared type,
different objects, different behaviour.

## TypeScript

The same abstract class, three payment types and a `totalFor` function print `1020`, `1000` and `1050`.

## The challenge

Add a fourth payment type, with any fee, without changing `totalFor`. Next episode: records, a class whose only job is
to hold data.
