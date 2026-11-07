---
title: 'Java Interfaces: A Promise a Class Makes (Beginner)'
description: 'Episode 25 of Complete Modern Java. An interface, two classes that implement it, why public is needed, one variable with three objects, a method that never changes, and TypeScript interfaces that disappear at run time.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-25-interfaces.jpg'
sheet: '/downloads/complete-modern-java-25-interfaces.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 25
duration: '8:02'
youtube: '61WvHNZ6XKI'
draft: false
---

The shop wants offers: no discount, ten percent off, half price. The checkout should not care which one it has. It
only needs to ask one question: what does this price become?

## The promise

```java
interface Discount {
    int apply(int priceCents);
}
```

In this example the interface only declares the method. It says what a discount must be able to do and leaves how to
each class. On its own it does nothing: `new Discount()` gives `Discount is abstract; cannot be instantiated`.

## Keeping it

```java
class PercentOff implements Discount {
    private int percent;

    PercentOff(int percent) {
        this.percent = percent;
    }

    public int apply(int priceCents) {
        return priceCents - priceCents * percent / 100;
    }
}
```

`implements` is the promise. `NoDiscount` keeps it too, giving the price back unchanged. Leave out `public` and Java
says `attempting to assign weaker access privileges; was public`: a method like this in an interface is public
automatically, and a class cannot make it less available. Delete `apply` and Java says the class `does not override
abstract method apply(int) in Discount`.

These are whole numbers, so the division drops the fraction: 499 times 10 is 4990, divided by 100 is 49, and 499 at
ten percent off is 450.

## One variable, three objects

A `Discount` variable holds a `NoDiscount`, then a `PercentOff(10)`, then a `PercentOff(50)`, and the same
`offer.apply(1000)` prints `1000`, `900` and `500`. The variable says what the object must be able to do. The object
decides how.

## Code that never changes

```java
void printTotal(int priceCents, Discount discount) {
    IO.println("Total: " + discount.apply(priceCents));
}
```

Called with 499 cents and each of the three offers, it prints `Total: 499`, `Total: 450` and `Total: 250`.
`printTotal` never changed. A new kind of discount tomorrow would not change it either.

## TypeScript

The same `interface Discount`, the same `implements`, with `Math.floor` to keep whole cents, prints the same totals.
Delete `apply` from a class and `tsc` reports that it incorrectly implements the interface. `node` does not check
interfaces: it starts and fails only at the call, `discount.apply is not a function`. The interface disappears when
TypeScript becomes JavaScript, which is why we check first. TypeScript also accepts a class that has the right method
without saying `implements`; Java needs the word.

## The challenge

Write `FixedOff`, which implements `Discount` and removes a fixed number of cents, using an `if` so a price never goes
below zero. With 100 cents off, 1000 becomes 900 and 50 becomes 0, and `printTotal` does not change.
Next episode: inheritance, when two classes need to share some of the same code.
