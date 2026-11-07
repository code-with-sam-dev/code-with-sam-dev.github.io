---
title: 'Java Classes and Objects: One Class, Many Objects (Beginner)'
description: 'Episode 16 of Complete Modern Java. Make your own type: a class with fields, objects made with new, the default values Java fills in, a constructor with this, a method on the object, an array of objects, and the same class in TypeScript.'
pubDate: 2026-12-10
cover: '/covers/complete-modern-java-16-classes-and-objects.jpg'
sheet: '/downloads/complete-modern-java-16-classes-and-objects.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 16
duration: '5:42'
youtube: '7ErTYEIrRTE'
draft: false
---

A product has a name and a price. With plain variables that is `breadName`, `breadPrice`, `milkName`, `milkPrice`:
four loose variables, and nothing says which name belongs with which price. A class is one thing that carries both.

## A class with fields

```java
class Product {
    String name;
    int priceCents;
}

void main() {
    Product bread = new Product();
    IO.println(bread.name);
    IO.println(bread.priceCents);
    bread.name = "Bread";
    bread.priceCents = 150;
    IO.println(bread.name);
}
```

It prints `null`, `0`, then `Bread`. A field that was never given a value starts with a default: `0` for a number,
and `null` for a `String`, which means the field does not refer to any text yet. That is only true for fields: a
local variable read before it has a value stops the program with `variable count might not have been initialized`.

## One class, two objects

The class is the blueprint. `new` makes an object from it, and `bread` refers to that object, which holds its own
name and price. A second object, `milk`, holds its own values: changing `bread` does not change `milk`.

## A constructor and a method

```java
class Product {
    String name;
    int priceCents;
    Product(String name, int priceCents) {
        this.name = name;
        this.priceCents = priceCents;
    }
    String label() {
        return name + ": " + priceCents + " cents";
    }
}
```

`this.name` is the field of the object being made; `name` on its own is the value passed in. Now
`new Product("Bread", 150)` makes a product in one line, and `bread.label()` prints `Bread: 150 cents`. Fields hold
the information; methods describe what the object can do. An array of products and a for-each loop add up `249`.

The fields are left open on purpose here, to see how objects work. The next episode protects them.

## TypeScript

```ts
class Product {
    name: string;
    priceCents: number;
    constructor(name: string, priceCents: number) {
        this.name = name;
        this.priceCents = priceCents;
    }
    label(): string {
        return this.name + ": " + this.priceCents + " cents";
    }
}
```

The same shape, printing `Bread: 150 cents` and `Milk: 99 cents`. The type comes after the name, and inside a
method TypeScript needs `this.` before every field: leave it off `priceCents` and `tsc` reports
`Cannot find name 'priceCents'. Did you mean the instance member 'this.priceCents'?`

## The challenge

`first` is bread at 150, `second` is milk at 99, then `first.name = "Toast";`. What do `first.label()` and
`second.label()` print? The answer is in the episode and the repository's README.
