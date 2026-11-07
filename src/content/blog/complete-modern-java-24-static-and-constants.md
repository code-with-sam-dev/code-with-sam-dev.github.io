---
title: 'Java static and Constants: Values That Belong to the Class (Beginner)'
description: 'Episode 24 of Complete Modern Java. A static counter shared by every product, a static final constant, a static method, the two compiler errors static invites, and static readonly in TypeScript.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-24-static-and-constants.jpg'
sheet: '/downloads/complete-modern-java-24-static-and-constants.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 24
duration: '5:59'
youtube: 'x6VRtFNPd_E'
draft: false
---

Every product has its own name and its own price. But how many products have we made, and what is the most a price
can be? Those belong to no single product. They belong to the class.

## One counter for the class

```java
private static int createdCount = 0;

Product(String name, int priceCents) {
    this.name = name;
    setPriceCents(priceCents);
    createdCount++;
}

static int getCreatedCount() {
    return createdCount;
}
```

`static` means one for the whole class, not one per object. Ask the class: `Product.getCreatedCount()` prints `0`,
then `2` after making bread and milk. Because the count goes up after the price is checked, it counts products
successfully made while the program runs. Shared state is shared by everyone, so use it with care.

## A constant

```java
static final int MAX_PRICE_CENTS = 100_000;

static boolean isValidPrice(int priceCents) {
    return priceCents >= 0 && priceCents <= MAX_PRICE_CENTS;
}
```

`final` means it can never be given another value; the underscore only makes the number easier to read. Constants are
written in capitals with underscores. The setter now calls `isValidPrice` and throws `price out of range` otherwise.
`Product.isValidPrice(150)` is `true`, `Product.isValidPrice(150_000)` is `false`.

## Two things the compiler refuses

`Product.MAX_PRICE_CENTS = 5;` gives `cannot assign a value to static final variable MAX_PRICE_CENTS`.

`Product.getName()` gives `non-static method getName() cannot be referenced from a static context`. There might be
hundreds of products: which one's name? Ask an object: `bread.getName()`.

## TypeScript

```ts
class Product {
    static readonly MAX_PRICE_CENTS = 100_000;
    static createdCount = 0;
    // the constructor adds one: Product.createdCount++;
}
```

It prints `0`, `2` and `100000`. `readonly` is TypeScript's version of `final`: assigning it makes `tsc` report
TS2540, but that is a rule for the checker, and `node` still runs the assignment.

## The challenge

Make a product at 150_000 cents inside a `try`, catch the exception, then print `getCreatedCount()`. With no other
products made, it prints `0`: the constructor threw before the count went up.
Next episode: interfaces, a promise a class makes about what it can do.
