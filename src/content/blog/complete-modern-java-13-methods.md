---
title: 'Java Methods: void, Parameters and return (Complete Beginner)'
description: 'Episode 13 of Complete Modern Java. Name a set of instructions once and use it again: a void method, what happens when it is called, parameters and arguments, return and a result, and the same three as TypeScript functions.'
pubDate: 2026-11-30
cover: '/covers/complete-modern-java-13-methods.jpg'
sheet: '/downloads/complete-modern-java-13-methods.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 13
duration: '4:31'
youtube: '5JI0aIr3O9g'
draft: false
---

A receipt with a dashed line above and below the title prints the same line twice. Change the line and you change
it in two places; in a bigger program, twenty. A method gives the instructions a name.

## Your first method

```java
void main() {
    printLine();
    IO.println("Sarah's groceries");
    printLine();
}

void printLine() {
    IO.println("----------");
}
```

Java starts in `main`. When it reaches `printLine()`, it runs that method's instructions, then carries on in main
right after the call. `void` means the method gives nothing back to its caller; it can still print. `main` is a
method too, sitting side by side with `printLine`.

## Passing a value in

`void printCustomLine(String symbol) { IO.println(symbol); }` prints whatever it is given:
`printCustomLine("==========")` and `printCustomLine("**********")` print two different lines. `symbol` is the
parameter, the name inside the method; the text in the call is the argument, the actual value.

## Getting a result back

```java
int lineTotal(int quantity, int priceCents) {
    return quantity * priceCents;
}
```

`int breadTotal = lineTotal(2, 150);` stores `300`, and adding `lineTotal(1, 99)` gives `399`. `return` sends a value
back, and the `int` before the name says what kind.

## TypeScript

The same three are functions: `function lineTotal(quantity: number, priceCents: number): number`. The return type
goes after the brackets, where Java puts it before the name.

## The challenge

What does `lineTotal(3, 150) + lineTotal(2, 99)` print? The answer is in the episode and the repository's README.
Next episode: arrays.
