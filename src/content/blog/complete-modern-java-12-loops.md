---
title: 'Java Loops: while and for (Complete Beginner)'
description: 'Episode 12 of Complete Modern Java. Stop copying lines: the while loop and its three parts, the loop that never ends and Ctrl+C, the for loop and i++, why 0 to < 3 prints 0 1 2, a running total with +=, and the same loops in TypeScript.'
pubDate: 2026-11-26
cover: '/covers/complete-modern-java-12-loops.jpg'
sheet: '/downloads/complete-modern-java-12-loops.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 12
duration: '4:52'
youtube: 'RHooQajVtJA'
draft: false
---

A countdown by hand is four lines: print 3, 2, 1, Go!. From a hundred it would be a hundred and one. Programs
repeat work with a loop instead.

## while

```java
int count = 3;
while (count > 0) {
    IO.println(count);
    count = count - 1;
}
IO.println("Go!");
```

It prints `3 2 1 Go!`. Three moving parts: the start (count begins at 3), the check (is count greater than 0?
asked before every repetition), and the update (take one away). When the check is false the loop ends and the
program carries on. If it is false at the very start, the body never runs.

## The loop that never ends

Leave the update out and count is always 3, so the check is always true: the program never finishes. In the
terminal, Ctrl+C stops it. Every loop needs something that moves it towards the end.

## for

```java
for (int i = 1; i <= 3; i++) {
    IO.println("Item " + i);
}
```

The same three parts on one line: start at 1, keep going while `i <= 3`, and `i++` adds one after each
repetition. It prints `Item 1`, `Item 2`, `Item 3`. With `int i = 0; i < 3` it prints `0 1 2`: starting at 0 is a
choice, and `< 3` stops before 3.

## A running total

`totalCents` starts at 0, and a loop adds 150 cents three times with `totalCents += breadPriceCents;`. It prints
`450`. `+=` adds to the variable.

## TypeScript

The same countdown and for loop work in TypeScript, with `number` instead of `int` and `let` because the counter
changes.

## The challenge

What does `for (int i = 2; i <= 6; i += 2)` print? The answer is in the episode and the repository's README. Next
episode: methods.
