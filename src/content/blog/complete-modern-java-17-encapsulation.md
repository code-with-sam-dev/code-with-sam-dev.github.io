---
title: 'Java Encapsulation: Private Fields, Getters and Setters (Beginner)'
description: 'Episode 17 of Complete Modern Java. Make an object refuse bad data: give the class its own file, make its fields private, read them with getters, change the price with a setter that checks, and see how TypeScript private differs.'
pubDate: 2026-12-14
cover: '/covers/complete-modern-java-17-encapsulation.jpg'
sheet: '/downloads/complete-modern-java-17-encapsulation.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 17
duration: '6:17'
youtube: 'uKlIqdL1NQc'
draft: false
---

With last episode's open fields, `bread.priceCents = -5;` runs and prints `-5`: a price below zero, and nothing
stops it. This episode makes the object refuse bad data.

## Private fields, in their own file

As programs grow, each class gets its own file. `Product.java` holds the class, with `private` before each field,
and `Store.java` holds `main`. `java src/Store.java` finds `Product.java` in the same folder. Now
`bread.priceCents = -5;` in `main` does not compile: `error: priceCents has private access in Product`.

Why the separate file matters: declared in the same compact file as `main`, `Product` is nested inside the file's
own class, and Java's access rules let that class reach the private members of a class nested in it. The same line
then prints `-5`.

## Getters and a setter that checks

```java
class Product {
    private String name;
    private int priceCents;

    Product(String name, int priceCents) {
        this.name = name;
        setPriceCents(priceCents);
    }

    String getName() {
        return name;
    }

    int getPriceCents() {
        return priceCents;
    }

    void setPriceCents(int newPriceCents) {
        if (newPriceCents < 0) {
            throw new IllegalArgumentException("price cannot be negative");
        }
        priceCents = newPriceCents;
    }
}
```

Getters read the private fields. A setter with no check would accept `-500` and protect nothing, so this one checks
first: a negative price throws `IllegalArgumentException: price cannot be negative`, which stops the current
operation (the next episode handles it). The constructor calls the same setter, so `new Product("Eggs", -5)` is
refused too, and the rule lives in one place. `name` has a getter but no setter, so it cannot change after the
product is made. `private` controls who can reach the fields; the check enforces the rule. You need both.

## TypeScript

```ts
class Product {
    private priceCents: number;

    constructor(priceCents: number) {
        this.priceCents = priceCents;
    }

    getPriceCents(): number {
        return this.priceCents;
    }
}

const bread = new Product(150);
console.log(bread.getPriceCents());
console.log(bread.priceCents);
```

`npx tsc --noEmit` reports `Property 'priceCents' is private and only accessible within class 'Product'`. But
`node product.ts` does not check types and prints `150` twice: TypeScript's `private` is a rule for the checker,
not a wall at run time. JavaScript's own `#private` fields are enforced when the code runs.

## The challenge

Which line compiles: `bread.setPriceCents(300);` or `bread.priceCents = 300;`? The answer is in the episode and the
repository's README. Next episode: exceptions, and how to keep going when an object says no.
