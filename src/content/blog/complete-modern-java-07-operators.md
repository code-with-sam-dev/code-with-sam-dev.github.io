---
title: 'Java Operators and Integer Division (Complete Beginner)'
description: 'Episode 7 of Complete Modern Java. Why Java says a $10 bill split four ways is 2 each: expressions, the five arithmetic operators, integer division and the remainder, one double for decimals, operator order and the left to right trap, and TypeScript''s one number type.'
pubDate: 2026-11-09
cover: '/covers/complete-modern-java-07-operators.jpg'
sheet: '/downloads/complete-modern-java-07-operators.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 7
duration: '5:47'
draft: false
youtube: 'lF_tuIvM2mc'
---

Four friends split a $10 bill:

```java
void main() {
    int total = 10;
    int people = 4;
    IO.println(total / people);
}
```

It prints `2`. Each person owes $2.50. Java has not lost any money: it did exactly what we asked.

## Expressions

An expression is a piece of code that produces a value. `total / people` is an expression, and so is
`total` on its own. `int total = 10;` is a statement: it creates a variable and stores a value.

## The five arithmetic operators

On `7` and `2`: `7 + 2` is `9`, `7 - 2` is `5`, `7 * 2` is `14`, `7 / 2` is `3`, and `7 % 2` is `1`.

Share seven sweets between two people: three each, one left over. When both numbers are ints, `/`
gives the whole part only. It does not round; the rest is dropped. `%` is the remainder operator: what
was left over. Ten shared between four is two each, two left over, so `10 / 4` in ints is `2`: the bill.

## Getting $2.50

When one number in a division is a double, Java does decimal division: `10.0 / people` is `2.5`. Or
keep the money in a double from the start: `double totalMoney = 10.0;` and `totalMoney / people` is
`2.5`. A double is fine for this lesson, but it is not how real systems keep money; Episode 8 shows why.

## Order

`2 + 3 * 4` is `14`: `*` and `/` go before `+` and `-`. `(2 + 3) * 4` is `20`: brackets go first.

Operators with the same priority run left to right, and that is a trap:

| Expression | Prints | Steps |
|---|---|---|
| `10 / 4 * 1.0` | `2.0` | `10 / 4` is `2` in ints, then `2 * 1.0` |
| `10 * 1.0 / 4` | `2.5` | `10 * 1.0` is `10.0`, then `/ 4` |
| `(10 / 4)` | `2` | brackets change the order, never the types |

## TypeScript

```ts
console.log(7 / 2);
console.log(10 / 4);
console.log(2 + 3 * 4);
console.log(Math.floor(10 / 4));
```

It prints `3.5`, `2.5`, `14` and `2`. Both languages divide correctly; they differ in the types of the
numbers. TypeScript has one number type, so the decimal stays. `Math.floor` rounds down to the whole
number below, and the result is still a number.

## The challenge

Predict five lines before you run them: `9 / 2`, `9 % 2`, `9 / 2.0`, `2 + 3 * 4` and `10 / 4 * 1.0`.
The answers are in the episode and in the repository's README. Next episode: numbers and precision.
