---
title: 'Java ArrayList: A List That Can Grow (Beginner)'
description: 'Episode 19 of Complete Modern Java. An array keeps its length; an ArrayList grows and shrinks. Add, get, size, remove and contains, why a list of int does not compile, an index out of bounds, and the same list in TypeScript.'
pubDate: 2026-12-21
cover: '/covers/complete-modern-java-19-arraylist.jpg'
sheet: '/downloads/complete-modern-java-19-arraylist.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 19
duration: '5:12'
youtube: 'Tkx6jsPYv9o'
draft: false
---

An array of three strings has room for three: `basket[3] = "Rice"` stops with
`ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`. A basket keeps filling up, so it needs a list
that can grow.

## ArrayList

```java
void main() {
    ArrayList<String> basket = new ArrayList<>();
    basket.add("Bread");
    basket.add("Milk");
    basket.add("Eggs");
    IO.println(basket);
    IO.println(basket.size());
    IO.println(basket.get(0));
}
```

It prints `[Bread, Milk, Eggs]`, `3` and `Bread`. `String` between the angle brackets says what the list holds; the
empty angle brackets on the right let Java work it out from the left (that feature, generics, gets its own episode).
In a compact source file no import is needed; a normal class file needs `import java.util.ArrayList;`.

`length` becomes `size()`, and `[0]` becomes `get(0)`. `basket.remove("Milk")` leaves `[Bread, Eggs]`,
`basket.contains("Milk")` is `false`, and a for-each works exactly as it does on an array. `basket.get(5)` on two
items throws `IndexOutOfBoundsException: Index 5 out of bounds for length 2`.

## Numbers need Integer

`ArrayList<int>` does not compile: `unexpected type, required: reference, found: int`. A list holds objects, and
`Integer` is the object version of `int`: `ArrayList<Integer>` with 150 and 99 prints `[150, 99]`.

## TypeScript

```ts
const basket: string[] = [];
basket.push("Bread");
basket.push("Milk");
basket.push("Eggs");
const index = basket.indexOf("Milk");
if (index !== -1) {
    basket.splice(index, 1);
}
console.log(basket);
console.log(basket[5]);
```

TypeScript arrays already grow. To remove by value, find the index first and check it: `indexOf` returns `-1` for
a missing item, and `splice(-1, 1)` would remove the last item. `basket[5]` is `undefined`, where Java's `get(5)`
throws.

## The challenge

Add Bread, Milk and Eggs; remove Milk; add Rice. What are `size()` and `get(1)`? The answer is in the episode and the
repository's README. Next episode: a list of products.
