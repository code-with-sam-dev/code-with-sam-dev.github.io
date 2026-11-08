---
title: 'Composition or Inheritance: When Not to Use extends in Java (Beginner)'
description: 'Episode 27 of Complete Modern Java. Code that compiles but models the wrong thing, is-a against has-a, why extending ArrayList breaks a cart''s rules, how composition lets the cart choose its operations, and the catch in TypeScript private.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-27-composition.jpg'
sheet: '/downloads/complete-modern-java-27-composition.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 27
duration: '6:43'
youtube: '52CRSF59-K8'
draft: false
---

`CartAsProduct extends Product`, with `super("Cart", 0)`, compiles without a complaint. That does not make a shopping
cart a product. The compiler checks whether inheritance is legal, not whether the model makes sense.

## Is it, or does it have?

A fresh product is a product: inheritance, from Episode 26. A shopping cart has products: a different relationship.
Our cart stores its products in an `ArrayList` inside it. One object built from others is composition. The unchanged
cart from Episode 20 takes rice and a fresh milk and prints `2` and `298`.

## The tempting shortcut

```java
class Trolley extends ArrayList<Product> {}
```

The trolley inherits every list method. `trolley.add(null)` is accepted, and the size is `2`; `trolley.clear()` leaves
`0`. Nothing in `ArrayList` promised to reject null, so the cart's rule is gone. Extending a list is not always wrong;
it hands out every operation the list has, including ones you never chose.

## The cart decides

`cart.add(null)` throws `product cannot be null`. `cart.clear()` does not even compile: `cannot find symbol`. The cart
decides which operations exist; if it needs a clear method later, it gets one on purpose. Overriding `add` in the
trolley is possible, but then you must understand every way a list can change. The cart is the simpler design.

## TypeScript

The cart keeps a `private items` array and prints the same `2` and `298`. Reach in with `cart.items.length = 0` and
`tsc` refuses: the property is private. Run it with `node` anyway and the count becomes `0`: TypeScript's `private` is a
rule for the checker, not protection at run time.

## The challenge

Which relationship fits: a fresh product and a product, a shopping cart and a product, a delivery driver and a car?
Inheritance may fit the first; composition fits the other two, because a driver uses a car but is not one.
Next episode: a parent class too general to create on its own, the abstract class.
