---
title: 'Java Arrays: Indexes and Out of Bounds (Complete Beginner)'
description: 'Episode 14 of Complete Modern Java. Keep many values under one name: a first array, indexes that start at 0, changing one value, the out of bounds exception, printing with Arrays.toString, and the same array in TypeScript.'
pubDate: 2026-12-03
cover: '/covers/complete-modern-java-14-arrays.jpg'
sheet: '/downloads/complete-modern-java-14-arrays.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 14
duration: '4:34'
youtube: '2OOqyMPHGrQ'
draft: false
---

Three prices are three variables: bread 150 cents, milk 99, eggs 250. That works for three. If Sarah buys a hundred
things, that is a hundred variables, each with its own name. An array keeps many values under one name.

## Your first array

```java
void main() {
    int[] prices = {150, 99, 250};
    IO.println(prices[0]);
    IO.println(prices[2]);
    IO.println(prices.length);
    prices[1] = 120;
    IO.println(prices[1]);
}
```

The square brackets after `int` mean an array of ints. It prints `150`, `250`, `3`, then `120`.

## Indexes start at 0

Picture a row of numbered boxes. The numbers are indexes, and they start at 0: `prices[0]` is the first price,
`prices[2]` the third. Three values, so the length is `3` and the valid indexes are 0, 1 and 2.

`prices[1] = 120;` changes one box and leaves the others alone. A Java array has a fixed length: you can change
what is in a box, but not add a fourth box.

## One past the end

```java
void main() {
    int[] prices = {150, 99, 250};
    IO.println(prices[3]);
}
```

Java stops with `ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`. The message says exactly
what went wrong: three boxes, 0 to 2, and we asked for number 3. The last index is always `length - 1`.

## Printing the whole array

```java
import java.util.Arrays;

void main() {
    int[] prices = {150, 120, 250};
    IO.println(prices);
    IO.println(Arrays.toString(prices));
}
```

Printing the array directly shows a code such as `[I@768b970c`, not the prices. `Arrays.toString(prices)` prints
`[150, 120, 250]`.

## TypeScript

```ts
const prices: number[] = [150, 99, 250];
console.log(prices[0]);
console.log(prices.length);
prices[1] = 120;
console.log(prices[3]);
console.log(prices);
```

It prints `150`, `3`, then `undefined` for `prices[3]` with no error, and `[ 150, 120, 250 ]`. Two differences
from Java: reading past the end gives `undefined` instead of stopping the program, and a JavaScript array can grow.
`const` stops you replacing the array, not changing what is in it.

## The challenge

`int[] prices = {100, 200, 300, 400};` What are `prices[2]` and `prices.length`? The answer is in the episode and
the repository's README. Next episode: adding up every price in an array, without a line for each one.
