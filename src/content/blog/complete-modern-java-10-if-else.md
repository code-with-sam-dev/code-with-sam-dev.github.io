---
title: 'Java if and else: Make Your Program Decide (Complete Beginner)'
description: 'Episode 10 of Complete Modern Java. Free delivery from $50: a comparison gives a boolean, if and else choose exactly one branch, the six comparison operators, > against >= at the boundary, the = versus == trap, and === in TypeScript.'
pubDate: 2026-11-19
cover: '/covers/complete-modern-java-10-if-else.jpg'
sheet: '/downloads/complete-modern-java-10-if-else.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 10
duration: '4:52'
youtube: '02Yf0kvZrZA'
draft: false
---

The shop gives free delivery from $50, and Sarah's basket comes to $52.40. Until now every line ran, top to
bottom. Now the program chooses.

## A comparison is a boolean

Money stays in whole cents, from Episode 8: `int totalCents = 5240;`. Then `IO.println(totalCents >= 5000);`
prints `true`. A comparison gives a boolean, the type from Episode 6.

## if and else

```java
if (totalCents >= 5000) {
    IO.println("Free delivery");
} else {
    IO.println("Delivery: $4.99");
}
IO.println("Thank you, Sarah");
```

Java works out the condition. If it is true, the first block runs; if false, the else block. Exactly one of them,
never both, and then the program carries on, which is why "Thank you, Sarah" prints either way. With 4240 cents it
prints `false`, `Delivery: $4.99`, `Thank you, Sarah`. Because the sign is `>=`, exactly $50 qualifies.

## The six comparison operators

With `items = 3`: `==` true, `!=` false, `< 5` true, `> 5` false, `<= 3` true, `>= 4` false. At the boundary,
`5000 > 5000` is false but `5000 >= 5000` is true: one character decides the rule.

## One equals sign, or two

`if (items = 5)` does not compile: `incompatible types: int cannot be converted to boolean`. One `=` assigns a
value; two `==` compare two values. An if needs a boolean.

## TypeScript

The same decision works the same way. Use `===` for equal and `!==` for not equal: JavaScript's `==` can convert
values before comparing them, and `===` never does.

## The challenge

Predict the delivery for 4999, 5000 and 5001 cents. The answers are in the episode and the repository's README.
Next episode: and, or, not, and else if.
