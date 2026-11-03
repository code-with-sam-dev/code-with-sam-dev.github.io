---
title: 'Java double vs BigDecimal: Why 0.1 + 0.2 Isn''t 0.3'
description: 'Episode 8 of Complete Modern Java. Why 1.10 + 2.20 prints 3.3000000000000003: doubles store binary, where one tenth never ends. The proof with BigDecimal, then two ways to keep money exact, whole cents and BigDecimal from text, in Java and TypeScript.'
pubDate: 2026-11-12
cover: '/covers/complete-modern-java-08-decimals.jpg'
sheet: '/downloads/complete-modern-java-08-decimals.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 8
duration: '5:31'
youtube: 'DsC-TyiC4SQ'
draft: false
---

Bread $1.10, milk $2.20:

```java
void main() {
    IO.println(1.10 + 2.20);
    IO.println(0.1 + 0.2 == 0.3);
}
```

It prints `3.3000000000000003` and `false`. Mathematically the total is $3.30. Java is not bad at
maths: a `double` works with a limited binary version of these numbers.

## Why

Write one third as a decimal: 0.333..., and the threes never end. You stop somewhere and keep the
nearest value. A double stores numbers in binary, and in binary one tenth repeats forever in the same
way, so Java stores the nearest double it can. Add two of those tiny gaps and the gap shows in the
answer. That is also why comparing decimal calculations with `==` needs care.

## The proof

```java
import java.math.BigDecimal;
...
IO.println(0.1);                       // 0.1
IO.println(new BigDecimal(0.1));       // 0.1000000000000000055511151231257827021181583404541015625
IO.println(new BigDecimal("0.1"));     // 0.1
```

Printing `0.1` shows `0.1`: Java prints the shortest decimal that identifies the stored double.
Giving that double to `BigDecimal` shows its exact value. BigDecimal did not cause the tail; made from
the text `"0.1"`, it holds exactly 0.1. The `import` line tells Java where to find BigDecimal.

## Money fix 1: whole cents

```java
int breadCents = 110;
int milkCents = 220;
int totalCents = breadCents + milkCents;   // 330
```

Whole numbers are stored exactly. Dividing, rounding and the `int` limit still need care; the limit
is the next episode.

## Money fix 2: BigDecimal from text

```java
BigDecimal bread = new BigDecimal("1.10");
BigDecimal milk = new BigDecimal("2.20");
BigDecimal total = bread.add(milk);        // 3.30
```

Make it from text, not from a double, and add with `.add`, not `+`.

## TypeScript

`number` is the same kind of binary double: `0.1 + 0.2` prints `0.30000000000000004` and `1.10 + 2.20`
prints `3.3000000000000003`. Whole cents work the same way: `110 + 220` is `330`. TypeScript has no
built-in decimal type; real projects keep money in whole cents or use a decimal library.

## The challenge

Predict three lines: `0.1 + 0.2`, `new BigDecimal("0.1").add(new BigDecimal("0.2"))` and `110 + 220`.
The answers are in the episode and in the repository's README. Next episode: number limits.
