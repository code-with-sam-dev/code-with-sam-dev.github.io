---
title: 'Use the Debugger in Java and TypeScript (Complete Beginner)'
description: 'Episode 5 of Complete Modern Java. A receipt that prints $4.99 with no error, found with a breakpoint: Run versus Debug, pausing before a line runs, Step Over, Evaluate, Resume, and the free TypeScript route with node --inspect-brk and Chrome DevTools.'
pubDate: 2026-11-02
cover: '/covers/complete-modern-java-05-debugger.jpg'
sheet: '/downloads/complete-modern-java-05-debugger.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['java', 'typescript', 'beginners']
series: 'Complete Modern Java'
episode: 5
duration: '6:55'
draft: false
youtube: 'er7SU7gng2s'
---

Two loaves at $1.50 and one milk at $0.99 should be $3.99. The receipt from Episode 4 says
`Total: $4.99`, with no red and no error. This episode stops the program halfway and watches the
wrong number appear.

## What a debugger does

Normally every line runs in a blink. A **breakpoint** pauses the program just before its line
runs. While it is paused you can see every value, then **step** one line at a time. The habit:
predict, pause, inspect, step, explain, fix.

## Java in IntelliJ IDEA

Click the line number of the `total` line: a red dot. A breakpoint is a marker in the editor, not
code. **Run** ignores it and prints $4.99. **Debug** stops on it:

```text
bread = 2
milk = 1
breadPrice = 1.5
milkPrice = 0.99
```

There is no `total` yet: the line has not run. Predict: 2 × 1.5 = 3, plus 0.99, so 3.99. **Step
Over** runs the line, and `total = 4.99` appears. In the Evaluate box, `milk * milkPrice` is
`0.99` and `milk + milkPrice` is `1.99`: the extra dollar is the bug. Use Evaluate only for simple
calculations, because it can run code.

Fix the `+`, debug again, Step Over: `total = 3.99`. **Resume** runs to the next breakpoint or the
end. **Stop** ends the session.

## TypeScript, free

The free IntelliJ IDEA does not debug TypeScript. Node and Chrome do:

```sh
node --inspect-brk groceryReceipt.ts
```

Open `chrome://inspect`, click **inspect** under Remote Target. DevTools opens paused on line 1,
showing your file with the types replaced by spaces, which is what Node runs. Click line 6,
Resume, read Scope (`total: <value unavailable>`), Step over: `total: 4.99`.

## When to use it

When an error message tells you what went wrong, read it first. When a program runs and gives the
wrong answer, a debugger helps you investigate. It shows what your program does; you still need
to know what it should do.

## The challenge

The receipt in the repository prints `Items: 4`. Sarah bought three things. Use a breakpoint to
find out why, and fix the reason, not the number. Next episode: values and types.
