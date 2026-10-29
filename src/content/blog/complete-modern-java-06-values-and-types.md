---
title: 'Values and Types in Java and TypeScript (Complete Beginner)'
description: 'Episode 6 of Complete Modern Java. Why Java printed Items: 21 for three items: value, variable, type, literal and assignment; int, double, boolean, String and char; the compiler refusing int price = 1.5; and TypeScript number, boolean, string and inference.'
pubDate: 2026-11-05
cover: '/covers/complete-modern-java-06-values-and-types.jpg'
sheet: '/downloads/complete-modern-java-06-values-and-types.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 6
duration: '6:58'
draft: false
youtube: '1LYAlw5ogbA'
---

Two loaves of bread, one carton of milk. Three items. This prints `Items: 21`:

```java
void main() {
    int bread = 2;
    int milk = 1;
    IO.println("Items: " + bread + milk);
}
```

No error, no warning. The debugger from Episode 5 shows `bread = 2` and `milk = 1`, so the values
are right. The problem is what Java does with them, and that is decided by their types.

## Four words on one line

In `int bread = 2;`:

- `2` is a **value**, the actual data. Written straight into the code, it is a **literal**.
- `bread` is a **variable**, a named place that holds a value.
- `int` is the **type**: what kind of value may go in, and what you can do with it.
- `=` is **assignment**. It does not ask whether bread equals two. It puts two into bread.

## Java's four everyday types

Java has eight basic (primitive) types. Beginners meet four kinds of value first:

```java
void main() {
    int quantity = 3;
    double price = 4.99;
    boolean paid = false;
    String product = "Milk";
    char grade = 'A';
    IO.println(quantity);
    IO.println(price);
    IO.println(paid);
    IO.println(product);
    IO.println(grade);
}
```

It prints `3`, `4.99`, `false`, `Milk` and `A`. `int` counts whole numbers, `double` holds numbers
with a decimal point, `boolean` is true or false and nothing else, and `String` is text in double
quotes. `String` starts with a capital S and is not one of the eight basic types. `char` holds a
single character, in single quotes: double quotes make a String, single quotes make a char.

## Changing a variable

`double whole = 4;` is accepted and prints `4.0`: a whole number fits in a double. To change
`quantity`, write `quantity = 4;` with no `int` in front, because the variable already exists.

## The compiler checks types

`double price = 1.5;` prints `1.5`. Change `double` to `int` and run it again:

```text
src/Price.java:2: error: incompatible types: possible lossy conversion from double to int
    int price = 1.5;
                ^
1 error
error: compilation failed
```

An `int` cannot hold the `.5`, so Java refuses before anything runs. Change it back and it prints
`1.5` again.

## Why 21

Java reads `"Items: " + bread + milk` from left to right. `"Items: "` is a String, and String plus a
number joins them: `"Items: 2"`. Text plus `1` joins again: `"Items: 21"`. With brackets,
`"Items: " + (bread + milk)`, the two numbers are added first, `3`, and then joined: `Items: 3`.
Same plus sign, two jobs, chosen by the types around it.

## TypeScript's own types

```ts
let quantity: number = 3;
let price: number = 4.99;
let paid: boolean = false;
let product: string = "Milk";
let inferred = 3;
console.log(quantity, price, paid, product, inferred);
```

TypeScript has one `number` type for whole numbers and decimals, `boolean` as in Java, and
`string` with a small s. `let inferred = 3;` has no type written, but TypeScript works it out from
the value: inference. Giving either variable the text `"three"` fails the check:

```text
types.ts:7:1 - error TS2322: Type 'string' is not assignable to type 'number'.
types.ts:8:1 - error TS2322: Type 'string' is not assignable to type 'number'.
```

Inference is not the same as no type. TypeScript checks types before the program runs; the
JavaScript that actually runs keeps none of them.

## The challenge

Predict three lines before you run them: `int items = 3;` printed, `"Total: " + 4.99` printed, and
`boolean paid = false;` printed. The answers are in the episode and in the repository's README.
Next episode: expressions and operators.
