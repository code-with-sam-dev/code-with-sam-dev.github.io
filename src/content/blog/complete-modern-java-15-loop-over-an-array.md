---
title: 'Loop Over a Java Array: The One Character That Crashes It'
description: 'Episode 15 of Complete Modern Java. Add up every value in an array with one loop: the index loop, why it stops before the length, the one character that crashes it, the for-each loop, an empty array, and the same loops in TypeScript, where the mistake gives NaN.'
pubDate: 2026-12-07
cover: '/covers/complete-modern-java-15-loop-over-an-array.jpg'
sheet: '/downloads/complete-modern-java-15-loop-over-an-array.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 15
duration: '5:27'
youtube: '6ofWfpH6iC0'
draft: false
---

Three prices are easy to add by hand: `prices[0] + prices[1] + prices[2]` is `499`. A hundred prices would be a
hundred additions. One loop adds up an array of any length.

## The loop with an index

```java
void main() {
    int[] prices = {150, 99, 250};
    int total = 0;
    for (int i = 0; i < prices.length; i++) {
        total += prices[i];
    }
    IO.println(total);
}
```

It prints `499`. The `for` loop and `+=` are from Episode 12; the only new idea is that `i` is used as the index.

| i | i < 3 | prices[i] | total |
|---|---|---|---|
| | | | 0 |
| 0 | true | 150 | 150 |
| 1 | true | 99 | 249 |
| 2 | true | 250 | 499 |
| 3 | false | not read | 499 |

The check comes before every pass, so `prices[3]` is never read. Less than the length means the valid indexes, 0 to 2.

## The one character

Change `<` to `<=` and Java stops with `ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3`. The
condition lets `i` reach 3, and the body reads `prices[3]`, a box that does not exist.

## For each price in prices

```java
int sum = 0;
for (int price : prices) {
    sum += price;
}
IO.println(sum);
```

It prints `499` too. There is no index, so there is no boundary to get wrong. If you just want every value, this
is simpler; if you need the position, use the loop with the index. With an empty array, `int[] prices = {};`, both
loops run zero times and print `0`.

## TypeScript

```ts
const prices: number[] = [150, 99, 250];
let total = 0;
for (let i = 0; i < prices.length; i++) {
    total += prices[i];
}
console.log(total);
let sum = 0;
for (const price of prices) {
    sum += price;
}
console.log(sum);
```

Both print `499`. TypeScript's value loop is `for...of`. Make the same `<=` mistake and `npx tsc --noEmit` is still
quiet, but the run prints `NaN`: `prices[3]` is `undefined`, and adding `undefined` to a number gives NaN, not a
number. Java stops the program; TypeScript carries on with a wrong answer.

## The challenge

`int[] prices = {100, 200, 300, 400};` and a loop that starts at `i = 1`. Does it print 1000 or 900? The answer is
in the episode and the repository's README. Next episode: classes and objects.
