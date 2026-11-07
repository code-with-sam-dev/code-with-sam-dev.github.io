---
title: 'Loop Through a Java HashMap: Keys and Values (Beginner)'
description: 'Episode 23 of Complete Modern Java. Three ways through a map, keySet, values and entrySet, why a HashMap prints in its own order, and the same loop over a TypeScript Map, which keeps insertion order.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-23-loop-through-a-map.jpg'
sheet: '/downloads/complete-modern-java-23-loop-through-a-map.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 23
duration: '5:03'
youtube: 'WRrOqI0dd7g'
draft: false
---

Bread, Milk, Eggs and Rice go into a `HashMap` in that order. Print every name and this run gave `Eggs`, `Bread`,
`Milk`, `Rice`. A `HashMap` does not promise to keep the order you added things in. On another computer the order
may differ, and both are correct.

There are three questions you can ask a map: only the names, only the products, or both together.

## Only the names: keySet()

```java
for (String name : catalog.keySet()) {
    Product product = catalog.get(name);
    IO.println(name + ": " + product.getPriceCents());
}
```

It prints `Eggs: 250`, `Bread: 150`, `Milk: 99` and `Rice: 199`. It works, but for every name we ask the map again.

## Only the products: values()

```java
int totalCents = 0;
for (Product product : catalog.values()) {
    totalCents += product.getPriceCents();
}
IO.println(totalCents);
```

It prints `698`, the total of one of each product in the catalog.

## Both at once: entrySet()

```java
for (Map.Entry<String, Product> entry : catalog.entrySet()) {
    IO.println(entry.getKey() + " costs " + entry.getValue().getPriceCents());
}
```

`Map.Entry` is the name Java gives one key with its value. `getKey` and `getValue` give both, without calling `get`
again. In a compact source file no import is needed. If you need the order things were added in, Java has
`LinkedHashMap`, which gets its own moment later.

## TypeScript

```ts
for (const entry of catalog) {
    const name = entry[0];
    const product = entry[1];
    console.log(name + ": " + product.priceCents);
}
```

It prints `Bread: 150`, `Milk: 99`, `Eggs: 250` and `Rice: 199`: a TypeScript `Map` keeps the order you set things in.

## The challenge

Add Sugar at 180. What does the `values()` loop add up to? The answer is 878, whatever order the names come out in.
Next episode: values that belong to the class itself, not to each object. That is `static`, and constants.
