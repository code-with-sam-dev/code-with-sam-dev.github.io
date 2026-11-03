---
title: 'Java Integer Overflow and Divide by Zero (Complete Beginner)'
description: 'Episode 9 of Complete Modern Java. Why two billion cents plus two billion cents prints a negative number: int overflow drawn as an odometer, long, Math.addExact, dividing by zero in Java, and the safe integer limit in TypeScript.'
pubDate: 2026-11-16
cover: '/covers/complete-modern-java-09-number-limits.jpg'
sheet: '/downloads/complete-modern-java-09-number-limits.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 9
duration: '5:35'
youtube: 'UMZtfJjc0Qw'
draft: false
---

Episode 8 kept money in whole cents. Here is a big total:

```java
void main() {
    int cents = 2_000_000_000;
    IO.println(cents + cents);
}
```

It prints `-294967296`. The money went negative, with no error. The underscores only make the number
easier to read; Java ignores them.

## Why an int wraps round

A car odometer with six digits counts up to 999999; one more rolls it back to 000000. An `int` stores
32 bits (a bit is a binary digit, 0 or 1), so it has a fixed range: -2,147,483,648 to 2,147,483,647. Past
the top it wraps round to the most negative value. That is overflow. `Integer.MAX_VALUE` prints
`2147483647`, and `Integer.MAX_VALUE + 1` prints `-2147483648`.

## Bigger numbers, and catching overflow

```java
long bigCents = 2_000_000_000L;
IO.println(bigCents + bigCents);       // 4000000000
IO.println(Long.MAX_VALUE);            // 9223372036854775807
```

The `L` marks a long literal. A long has a limit too, just a much larger one: for real money, both the type
and the expected range matter. When a wrong answer is worse than stopping, `Math.addExact(Integer.MAX_VALUE, 1)`
throws `ArithmeticException: integer overflow` instead of wrapping.

## Dividing by zero

`7.0 / 0` prints `Infinity` and `0.0 / 0` prints `NaN` (not a number): special double values, and the program
carries on. With ints, `10 / people` when `people` is `0` stops the program with
`ArithmeticException: / by zero` and the line it happened on.

## TypeScript

```ts
console.log(2_000_000_000 + 2_000_000_000);   // 4000000000
console.log(9007199254740991);                // the largest safe integer
console.log(9007199254740992 + 1);            // 9007199254740992
console.log(10 / 0);                          // Infinity
console.log(0 / 0);                           // NaN
```

TypeScript numbers are doubles, so there is no wrap at two billion. Their limit is exactness: past the
largest safe integer, adding one can change nothing.

## The challenge

Predict three lines: `Integer.MAX_VALUE + 1`, `2_000_000_000L + 2_000_000_000L` and `7.0 / 0`. The answers are in
the episode and in the repository's README. Next episode: decisions with if and else.
