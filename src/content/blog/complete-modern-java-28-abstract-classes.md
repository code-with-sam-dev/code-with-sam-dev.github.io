---
title: 'Java Abstract Classes: Share Code, Require Methods (Beginner)'
description: 'Episode 28 of Complete Modern Java. An abstract PaymentMethod whose finished totalCents calls an unfinished feeCents, card and cash filling in the fee, why you cannot create the parent, interface or abstract class, and what TypeScript abstract does at run time.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-28-abstract-classes.jpg'
sheet: '/downloads/complete-modern-java-28-abstract-classes.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 28
duration: '7:28'
youtube: 'TPd7fipyTXE'
draft: false
---

Checkout takes card or cash. Card adds a two percent fee, cash adds nothing, and both work out a total the same way:
the price plus the fee. Can the shared calculation be written once, with the fee left to each payment type?

## The abstract parent

```java
abstract class PaymentMethod {
    private String name;

    PaymentMethod(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }

    abstract int feeCents(int priceCents);

    int totalCents(int priceCents) {
        return priceCents + feeCents(priceCents);
    }
}
```

`feeCents` has no body: it is left unfinished. `totalCents` is finished, and it calls the unfinished one. Abstract
describes an incomplete class; not every method in it is abstract.

## The children fill the gap

`CardPayment` calls `super("Card")` and returns `priceCents * 2 / 100`; `CashPayment` calls `super("Cash")` and returns
0. In our little shop each payment type decides its own fee; real payment systems have more rules, and here any fraction
of a cent is dropped. These are ordinary, finished classes, so Java requires each to fill in `feeCents`.

A `PaymentMethod` variable holding a card payment prints `1020`: Java uses the card's fee. A list of both prints
`Card: 1020` and `Cash: 1000`. `totalCents` was written once; each object supplied its own fee.

`new PaymentMethod("Voucher")` does not compile: `PaymentMethod is abstract; cannot be instantiated`. It is
unfinished, so you make objects of the classes that finish it.

## Interface or abstract class?

An interface describes what an object promises to do. An abstract class can provide some of the work and leave the rest
to its subclasses. Java interfaces can have method bodies too; the difference here is that our abstract class has a field
and a constructor, and a class can extend only one class.

## TypeScript

The same abstract class prints the same two lines. `new PaymentMethod("Voucher")` makes the checker say it cannot create
an instance of an abstract class. Run it with `node` anyway and the voucher is created; calling `totalCents` then fails
with `this.feeCents is not a function`. In TypeScript, abstract is a rule for the checker.

## The challenge

Add a `VoucherPayment` named Voucher with a fixed 50 cent fee, without changing `PaymentMethod`. For 1000 cents it
prints `Voucher: 1050`. Next episode: polymorphism, the same method call behaving differently for each object.
