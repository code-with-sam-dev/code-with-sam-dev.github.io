---
title: 'Java List of Objects: A Shopping Cart That Adds Itself Up (Beginner)'
description: 'Episode 20 of Complete Modern Java. A list of Product objects, then a ShoppingCart class that owns the list and works out its own total: the import a class file needs, add, count and totalCents, refusing null, and the same cart in TypeScript.'
pubDate: 2026-12-24
cover: '/covers/complete-modern-java-20-shopping-cart.jpg'
sheet: '/downloads/complete-modern-java-20-shopping-cart.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 20
duration: '6:14'
youtube: 'kUalXaHGdBw'
draft: false
---

Last episode's basket held names, and a list of names cannot add up a price. A list of `Product` objects can:
an `ArrayList<Product>` and a for-each over `getPriceCents()` print `499`. But if five parts of a program need the
total, each would copy that loop.

## A class that owns the list

```java
import java.util.ArrayList;

class ShoppingCart {
    private ArrayList<Product> items = new ArrayList<>();

    void add(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("product cannot be null");
        }
        items.add(product);
    }

    int count() {
        return items.size();
    }

    int totalCents() {
        int total = 0;
        for (Product product : items) {
            total += product.getPriceCents();
        }
        return total;
    }
}
```

A normal class file needs `import java.util.ArrayList;`; the compact files so far got it without one. `Product`
needs no import: it is our own class in the same folder. `ShoppingCart` has no `main`; it only describes what a cart
can do.

```java
void main() {
    ShoppingCart cart = new ShoppingCart();
    IO.println(cart.totalCents());
    cart.add(new Product("Bread", 150));
    cart.add(new Product("Milk", 99));
    cart.add(new Product("Eggs", 250));
    IO.println(cart.count());
    IO.println(cart.totalCents());
}
```

It prints `0`, `3` and `499`. Before, `main` did all the work; now it asks the cart. And `private` alone does not stop
bad data: without the check in `add`, `cart.add(null)` is accepted and the program fails later with a
`NullPointerException` inside `totalCents`. With it, the cart refuses null at the door.

## TypeScript

The same cart, with `private items: Product[] = []`, `push`, `length` and a `for...of` total, prints `2` and `249`.
There, `cart.add(null)` never runs: the checker reports `Argument of type 'null' is not assignable to parameter of type
'Product'`.

## The challenge

Add a fourth product at 199 cents. What are the count and the total? The answer is in the episode and the
repository's README. Next episode: removing products, and what makes two products the same.
