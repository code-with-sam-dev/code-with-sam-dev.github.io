---
title: 'Java Same Values, Two Objects: Removing From the Cart (Beginner)'
description: 'Episode 21 of Complete Modern Java. Java said Milk was not in the cart: two objects with the same values, == and equals on objects, removing the same object, a removeByName rule of our own, and the same idea in TypeScript.'
pubDate: 2026-12-28
cover: '/covers/complete-modern-java-21-remove-from-the-cart.jpg'
sheet: '/downloads/complete-modern-java-21-remove-from-the-cart.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 21
duration: '5:53'
youtube: 'oALd6MIQNOE'
draft: false
---

The customer puts the milk back. The cart prints Bread, Milk, Eggs, then `cart.remove(new Product("Milk", 99))`
prints `false`, and the count is still `3`. Milk is right there, and Java says no.

## Same values, two objects

Every `new` makes a new object. The Milk in the cart and the Milk we just made have the same name and price, but
they are two different objects. `remove` asks each item whether it is equal, and our `Product` has never said what
equal means, so Java uses its default rule: only the very same object counts.

```java
Product first = new Product("Milk", 99);
Product second = new Product("Milk", 99);
IO.println(first == second);          // false
IO.println(first.equals(second));     // false
IO.println("Milk".equals("Milk"));    // true
```

Strings do have a rule (same text, equal), which is why removing `"Milk"` from a list of strings worked in Episode 19.

## Remove the same object, or by a rule you choose

Keeping the variable we added, `cart.remove(milk)` prints `true`, and the cart drops to `2` items and `400` cents.
But a customer says "milk", not an object, so the cart gets a rule of its own:

```java
boolean removeByName(String name) {
    for (int i = 0; i < items.size(); i++) {
        if (items.get(i).getName().equals(name)) {
            items.remove(i);
            return true;
        }
    }
    return false;
}
```

`removeByName("Eggs")` is `true`, `removeByName("Rice")` is `false`, and the total is `150`. It removes the first
match only, and the match is exact. Real shops identify products by a code; for this small cart, the name is the
rule we chose.

## TypeScript

`first === second` is `false`, and `items.indexOf(second)` is `-1`: `===` on objects only matches the very same
object. A `removeByName` function compares the name with `===` and removes the item with `splice(i, 1)`.

## The challenge

A cart with Milk, Eggs, Milk and Bread. `removeByName("Milk")` once. What names are left? The answer is in the episode
and the repository's README. Next episode: HashMap, finding a product by name without searching the whole list.
