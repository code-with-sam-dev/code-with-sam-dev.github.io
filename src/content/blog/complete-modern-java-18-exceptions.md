---
title: 'Java Exceptions: Try, Catch and Keep Going (Beginner)'
description: 'Episode 18 of Complete Modern Java. One bad value stopped the whole program: read the stack trace, catch the exception with try and catch, see both paths, catch a NumberFormatException, and handle errors in TypeScript.'
pubDate: 2026-12-17
cover: '/covers/complete-modern-java-18-exceptions.jpg'
sheet: '/downloads/complete-modern-java-18-exceptions.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 18
duration: '6:25'
youtube: 'Xi7nXIocbLo'
draft: false
---

Last episode the product learned to refuse a negative price. But when it refuses, the program stops: make eggs at
-5, and nothing after that line runs.

## Read the stack trace

```
Exception in thread "main" java.lang.IllegalArgumentException: price cannot be negative
	at Product.setPriceCents(Product.java:20)
	at Product.<init>(Product.java:7)
	at Checkout.main(Checkout.java:2)
```

The first line is the kind of problem and the message. The top `at` line is where it was thrown; the lines below
show how the program got there: `main`, on line 2, called the constructor, which called `setPriceCents`.

## Catch it and keep going

```java
void main() {
    try {
        Product eggs = new Product("Eggs", -5);
        IO.println("Added " + eggs.getName());
    } catch (IllegalArgumentException e) {
        IO.println("Could not add eggs: " + e.getMessage());
    }
    IO.println("Checkout continues");
}
```

It prints `Could not add eggs: price cannot be negative` and `Checkout continues`. `Added Eggs` never prints: at the
throw, Java leaves the try block, runs the matching catch, and carries on after it, never back at the line that
failed. Catching does not make the bad value good; it lets you decide what happens next. With a price of 30,
nothing is thrown, the catch is skipped, and both lines print.

Java's own methods throw too: `Integer.parseInt("two")` throws a `NumberFormatException`, caught here to print
`Not a number: two`; with `"2"` it prints `Quantity: 2`.

## TypeScript

```ts
try {
    const eggs = new Product("Eggs", -5);
    console.log("Added " + eggs.name);
} catch (e) {
    if (e instanceof Error) {
        console.log("Could not add eggs: " + e.message);
    }
}
console.log("Checkout continues");
```

JavaScript lets you throw anything, so the caught value is `unknown`: reading `e.message` straight away is error
TS18046. Checking `e instanceof Error` first fixes it. And JavaScript's `parseInt("two")` does not throw at all: it
returns `NaN`.

## The challenge

Inside a try: print One, `Integer.parseInt("two")`, print Two. The catch prints Caught; after it, print Three. What
prints? The answer is in the episode and the repository's README. Next episode: ArrayList, a list that can grow.
