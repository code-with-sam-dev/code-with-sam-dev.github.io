---
title: 'Your First Java Program, Explained: From Code to Result'
description: 'The first episode of Complete Modern Java, for complete beginners. One small grocery receipt program, typed line by line and run in Java and in TypeScript: what source code is, what a compiler and a runtime do, the terminal and the IDE. Then one tiny change: Java refuses to compile, and TypeScript reports the same mistake but still produces a program that prints "Items: 2one" and "Total: $NaN".'
pubDate: 2026-10-19
cover: '/covers/complete-modern-java-01-first-program.jpg'
sheet: '/downloads/complete-modern-java-01-first-program.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 1
duration: '10:08'
draft: false
youtube: 'kVCc-XGgtJc'
---

Sarah buys two loaves of bread and one carton of milk. Three items, three
dollars ninety nine. This program printed something else:

```text
Sarah's groceries
Items: 2one
Total: $NaN
```

One tiny change caused it, and Java catches the same mistake before anything
prints at all. This is the first episode of **Complete Modern Java**, a course
that starts with your very first program and goes all the way to writing,
testing and shipping real Java, covering every topic on the Java SE 25
certification exam along the way. Every Java lesson has a TypeScript companion,
because most jobs touch both, and seeing them side by side shows what is Java
and what is simply programming.

## A program is a list of instructions

A cashier with a written list counts the items, looks up each price, adds it
up and prints the receipt. They do not guess what you meant, and neither does a
computer. The instructions we write are called **source code**: text that both
people and tools can read.

A **terminal** is a place where we type instructions telling the computer
which tool to run. An **IDE** is an editor built for code; this course uses
IntelliJ IDEA.

## The receipt in Java

At the time of recording, Java 25 lets a first program be this short, with no
class around it:

```java
void main() {
    int bread = 2;
    int milk = 1;
    double breadPrice = 1.50;
    double milkPrice = 0.99;

    double total = bread * breadPrice + milk * milkPrice;

    IO.println("Sarah's groceries");
    IO.println("Items: " + (bread + milk));
    IO.println("Total: $" + total);
}
```

`int` holds a whole number and `double` a number with a decimal point. Real
money needs something more careful than `double`, which the course covers
later; for this example it is fine.

```sh
javac GroceryReceipt.java
java GroceryReceipt
```

`javac`, the Java compiler, checks the code and writes `GroceryReceipt.class`,
full of **bytecode**: instructions for the Java virtual machine, the JVM.
`java` starts the JVM, which loads the bytecode and runs it:

```text
Sarah's groceries
Items: 3
Total: $3.99
```

`java GroceryReceipt.java` does both steps in one command.

## The same receipt in TypeScript

```ts
const bread: number = 2;
const milk: number = 1;
const breadPrice: number = 1.50;
const milkPrice: number = 0.99;

const total: number = bread * breadPrice + milk * milkPrice;

console.log("Sarah's groceries");
console.log("Items: " + (bread + milk));
console.log("Total: $" + total);
```

```sh
npx tsc groceryReceipt.ts
node groceryReceipt.js
```

`tsc` checks the types and writes plain JavaScript with the types removed, and
Node runs it. Same receipt. At the time of recording, Node can also run the
`.ts` file directly, by removing the types without checking them.

## The mistake

Change `milk` from the number `1` to the word `"one"` in both.

Java refuses:

```text
GroceryReceipt.java:3: error: incompatible types: String cannot be converted to int
```

No `.class` file is written, so there is nothing to run.

TypeScript finds the same mistake:

```text
groceryReceipt.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.
```

But with its default settings, `tsc` still writes `groceryReceipt.js`, and
`node` runs it: `Items: 2one`, `Total: $NaN`. Adding a number to text joins
them as text, so 2 and "one" become "2one", and multiplying text by a price is
NaN, "not a number".

Both compilers found the mistake. One setup still let it run. That is not a
flaw in TypeScript: checking the code, producing a file and running it are
three separate steps.

## Three things to take away

1. You write instructions as source code.
2. Tools check those instructions, and run them.
3. A program can run, and still be wrong.

**A small challenge:** if `milk` goes from 1 to 2, what prints? Both languages
answer `Items: 4`, `Total: $4.98`.

The full code, with the command for every output above, is in the repository,
and the one page sheet with the code is linked at the top of this page. Next
episode: install Java and IntelliJ, and write this program yourself.
