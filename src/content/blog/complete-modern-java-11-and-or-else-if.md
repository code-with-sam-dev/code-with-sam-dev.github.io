---
title: 'Java and, or, not and else if (Complete Beginner)'
description: 'Episode 11 of Complete Modern Java. A shop with three rules: && and || and ! with truth tables, else if where the first true condition decides, why branch order matters, how && skips a division by zero, and the same rules in TypeScript.'
pubDate: 2026-11-23
cover: '/covers/complete-modern-java-11-and-or-else-if.jpg'
sheet: '/downloads/complete-modern-java-11-and-or-else-if.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 11
duration: '5:34'
youtube: 'jtiTcGDwlaM'
draft: false
---

The shop's rules have grown. A basket of $100 or more gets a free gift. $50 or more gets free delivery, but only
for members. Everyone else pays $4.99. One if and else checks one condition and picks one of two, so it cannot say
that. This example picks one message, not every benefit a customer could get.

## and, or, not

```java
int totalCents = 5240;
boolean member = true;
IO.println(totalCents >= 5000 && member);    // true
IO.println(totalCents >= 10000 || member);   // true
IO.println(!member);                         // false
```

`&&` is true only when both sides are true. `||` is true when at least one side is true, including both. `!`
flips a boolean.

## else if

```java
if (totalCents >= 10000) {
    IO.println("Free gift");
} else if (totalCents >= 5000 && member) {
    IO.println("Free delivery");
} else {
    IO.println("Delivery: $4.99");
}
```

Java checks the conditions in order. The first one that is true decides which branch runs, and the rest are not
checked. If none is true, the else runs. With 5240 cents and a member it prints `Free delivery`; with
`member = false`, `Delivery: $4.99`; with 12000 cents, `Free gift`, because the first branch does not check
membership.

## Order matters

Check free delivery first and the gift second, and a member spending $120 gets `Free delivery`: the gift is
skipped, because the first true condition already decided. Put the bigger reward first.

## && can skip a division

With `items = 0`, `if (items > 0 && totalCents / items > 1000)` prints the else branch and no error. `&&` stops at
the first false, so the division by zero from Episode 9 never runs. `||` stops at the first true. When you mix
them, `&&` goes first, so use brackets to show the grouping you mean.

## TypeScript

`&&`, `||`, `!` and else if work the same way: `rules.ts` prints `Free delivery`.

## The challenge

Three customers: 12000 cents and a member; 6000 cents and not a member; 6000 cents and a member. The answers are
in the episode and the repository's README. Next episode: loops.
