---
title: 'Java HashMap: Find a Product by Name (Beginner)'
description: 'Episode 22 of Complete Modern Java. A HashMap links each key to a value: put and get, one value per key, remove, what a missing key gives back and how to check first, and the same idea with a TypeScript Map.'
pubDate: 2026-12-31
cover: '/covers/complete-modern-java-22-hashmap.jpg'
sheet: '/downloads/complete-modern-java-22-hashmap.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 22
duration: '5:37'
youtube: 'ZWWgpr9__JE'
draft: false
---

Last episode, `removeByName` checked each product until the name matched. A list keeps items in positions; a map
links each key to a value.

## Key and value

```java
HashMap<String, Product> catalog = new HashMap<>();
catalog.put("Bread", new Product("Bread", 150));
catalog.put("Milk", new Product("Milk", 99));
catalog.put("Eggs", new Product("Eggs", 250));
IO.println(catalog.size());
Product milk = catalog.get("Milk");
IO.println(milk.getPriceCents());
```

It prints `3` and `99`. The first type is the key, a name; the second the value, a product. `get` finds the value by
its key without a search loop (Java does some work behind the scenes we do not need yet). A `HashMap` does not
promise to keep the order you added things in.

`put("Milk", new Product("Milk", 120))` again prints `120`, and the size stays `3`: a key links to one value, and
it now points to a different product. `remove("Eggs")` leaves `2`.

## A name that is not there

`containsKey("Rice")` is `false`, `get("Rice")` is `null`, and asking that null for its price throws a
`NullPointerException`. So check first:

```java
if (catalog.containsKey("Rice")) {
    Product rice = catalog.get("Rice");
    IO.println(rice.getPriceCents());
} else {
    IO.println("Rice is not in the catalog");
}
```

## TypeScript

A `Map<string, Product>` does the same job: `set`, `get`, `has`, `delete`, and `size` as a property. A missing key
gives `undefined` instead of `null`, so check `milk !== undefined` before reading its price. It prints `3`, `99`,
`false` and `undefined`.

## The challenge

Add Coffee at 350, read its price by name, then look up Tea without crashing. One answer is in the repository.
Next episode: looping through a map, its keys and its values.
