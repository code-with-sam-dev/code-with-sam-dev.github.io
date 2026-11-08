---
title: 'Java Inheritance Explained: extends and super (Beginner)'
description: 'Episode 26 of Complete Modern Java. The is-a test, a FreshProduct that extends Product, super in the constructor, inherited methods, @Override with super.describe(), one shelf where each object uses its own version, and the same in TypeScript.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-26-inheritance.jpg'
sheet: '/downloads/complete-modern-java-26-inheritance.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 26
duration: '8:08'
youtube: 'xMI6vZaHyV0'
draft: false
---

Rice sits in the cupboard for months; milk goes off. A fresh product is still a product, with a name, a price and the
price check, plus the days it has left. Writing all of Product again would mean fixing every bug twice.

## The test first

Is every fresh product a product? Yes. Is every product a fresh product? No: rice is not. Inheritance is for one kind
of thing that really is a more specific kind of another.

## extends and super

```java
class FreshProduct extends Product {
    private int daysLeft;

    FreshProduct(String name, int priceCents, int daysLeft) {
        super(name, priceCents);
        this.daysLeft = daysLeft;
    }

    int getDaysLeft() {
        return daysLeft;
    }
}
```

`super(name, priceCents)` runs Product's constructor, so the price check still runs. `daysLeft` is just a number given
to the object, not an expiry system. A fresh milk prints `Milk`, `99` and `3`: two of those methods FreshProduct never
wrote. The milk object does hold a name and a price, but they are private to Product, so FreshProduct uses the methods
Product gives it.

## Override

```java
@Override
String describe() {
    return super.describe() + ", " + daysLeft + " days left";
}
```

`Milk: 99, 3 days left`. The annotation asks Java to check that the method really replaces one in the parent: with a
typo in the name, Java says `method does not override or implement a method from a supertype`. Here `super.describe()`
calls the parent's method, while in the constructor `super(...)` ran the parent's constructor.

## One shelf

An `ArrayList<Product>` holds rice and the milk, and the same `describe()` call prints `Rice: 199` and `Milk: 99, 3
days left`. Both are treated as Product, but the milk really is a FreshProduct, so its own version runs. That is
polymorphism.

## TypeScript

`extends`, `super(name, priceCents)` before `this`, and the `override` keyword print the same two lines. Set
`this.daysLeft` before `super` and the checker says super must be called before accessing this in the constructor of a
derived class.

## The challenge

Make a FreshProduct cheese at 350 cents with 5 days left, add it to the shelf, print its name with the inherited
getter, and predict the loop's new line: `Cheese: 350, 5 days left`.
Next episode: a shopping cart holds products but is not a product. Should it use inheritance too?
