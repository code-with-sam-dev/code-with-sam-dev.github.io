---
title: 'Read Your First Errors in Java and TypeScript (Complete Beginner)'
description: 'Episode 4 of Complete Modern Java. The four kinds of error, broken on purpose in Java and TypeScript: syntax, compile, runtime and logic. What each message says, where to look, how to read a stack trace, and one habit for every error.'
pubDate: 2026-10-29
cover: '/covers/complete-modern-java-04-read-your-first-errors.jpg'
sheet: '/downloads/complete-modern-java-04-read-your-first-errors.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 4
duration: '11:12'
draft: false
youtube: 'V29TvWKPWBA'
---

Red text in the terminal is not the computer telling you that you failed. It is the computer
telling you where to look. This episode breaks the grocery receipt on purpose, in Java and in
TypeScript, and reads every message it produces.

## Four kinds of error

Where an error appears tells you which kind you have.

- **Syntax**: the code breaks the grammar of the language. The check stops it before anything runs.
- **Compile**: the grammar is fine, but the code asks for something that does not exist, like a
  method with a typo in its name. Also stopped before anything runs. Strictly, a syntax error is
  one kind of compile error.
- **Runtime**: the program starts, and then something goes wrong while it is running.
- **Logic**: nothing stops it. The program finishes, and the answer is wrong.

## 1. Syntax

Delete the semicolon at the end of line 2 of the Java receipt, and run it:

```text
src/GroceryReceipt.java:2: error: ';' expected
    int bread = 2
                 ^
1 error
error: compilation failed
```

The file, the line, the word `error`, what was expected, and the line itself with a mark under the
spot. Nothing ran. In TypeScript, delete the closing bracket on line 9 and check it:

```text
groceryReceipt.ts:9:39 - error TS1005: ')' expected.
```

Line 9, character 39, an error code you can search for, and the message. Node refuses to run it
too, with a `SyntaxError`. The location is where the compiler noticed the problem, not always where
you made it: if the line it names looks fine, look at the line above.

## 2. Compile

`customer.toUppercase()`, with a small c:

```text
src/Typo.java:3: error: cannot find symbol
  symbol:   method toUppercase()
  location: variable customer of type String
```

A symbol is any name in your code. Java looked for this one and found nothing. TypeScript goes
further:

```text
typo.ts:2:22 - error TS2551: Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
```

But Node does not read types. `node typo.ts` starts anyway, reaches line 2, and crashes with
`TypeError: customer.toUppercase is not a function`. Check first, then run:

```sh
npx tsc --noEmit typo.ts
node typo.ts
```

## 3. Runtime, and the stack trace

`Integer.parseInt("one")` compiles, then fails while running:

```text
Exception in thread "main" java.lang.NumberFormatException: For input string: "one"
	at java.base/java.lang.NumberFormatException.forInputString(NumberFormatException.java:67)
	at java.base/java.lang.Integer.parseInt(Integer.java:565)
	at java.base/java.lang.Integer.parseInt(Integer.java:662)
	at Runtime.main(Runtime.java:3)
```

Read the top line first: what went wrong. Then go down to the first line from your own code,
`Runtime.java:3`, and open it. The lines above it are Java's own code, the path the problem took.

The same idea in TypeScript does not crash. `Number("one")` is `NaN`, not a number, and the program
carries on with `Milk: NaN`. A visible error is easier to notice than a wrong value.

## 4. Logic

Change one `*` to a `+` on the total line. No red, no message, and the receipt says `Total: $4.99`.
The compiler cannot know the receipt should total $3.99. Predict the answer before you run it: two
loaves at $1.50 is $3.00, plus one milk at $0.99, is $3.99.

## One habit for every error

1. Read the main message.
2. Find the location. In a stack trace, the first line from your own code.
3. Open that line, and the line above it.
4. Change one thing, and run it again.

## The challenge

The repository has one broken Java file and one broken TypeScript file, each with three mistakes: a
syntax error, a misspelled method and a `+` where there should be a `*`. Fix them one at a time,
running after every fix, until both print `Total: $3.99`. Next episode: the debugger.
