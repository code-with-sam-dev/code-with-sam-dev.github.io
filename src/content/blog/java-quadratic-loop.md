---
title: 'The Java Loop That Is Quietly Quadratic'
description: 'It compiles, it passes review, and it is correct. It also gets roughly three times slower every time you double the input, and the reason is a language rule most engineers can recite but do not apply.'
pubDate: 2026-09-13
youtube: 'KBSz9wxCzRA'
tags: ['java', 'interviews', 'performance']
series: 'Tricky Senior Engineer Interview Questions'
cover: '/covers/java-quadratic-loop.jpg'
duration: '0:59'
draft: false
terminal:
  path: 'java-gotchas / measured on Java 21'
  lines:
    - '$ java StringBench'
    - ''
    - '  n = 10,000   res += s     29.3 ms'
    - '  n = 20,000   res += s     46.5 ms'
    - '  n = 40,000   res += s    135.8 ms'
    - ''
    - '  n = 40,000   builder      0.833 ms'
---

If you consider yourself senior, there is a good chance you only half answer
this one. Most people assume `String res = ""` is fine. The problem is `res +=`
inside the loop.

```java
private String repeat(String s, int n) {
    String res = "";

    for (int x = 0; x < n; x++) {
        res += s;
    }

    return res;
}
```

It compiles. It is correct. It will pass review.

## Why it is quadratic

Strings in Java are immutable. Every `+=` creates a **new** String and copies
everything accumulated so far into it. On iteration one you copy one unit, on
iteration two you copy two, and so on. The total work is the sum of 1 to n,
which is quadratic in the length of the output, not linear in the number of
iterations.

That is the part most answers miss. Saying "this is slow" is not the answer.
Saying **why the complexity class changes** is.

## Measured, not asserted

```text
n = 10,000     res += s     29.3 ms
n = 20,000     res += s     46.5 ms
n = 40,000     res += s    135.8 ms

n = 40,000     builder      0.833 ms
```

Double the input and the time roughly triples. That is the signature of
quadratic growth showing up in wall clock rather than in a textbook. The builder
stays flat.

## The fix

```java
private String repeat(String s, int n) {
    StringBuilder sb = new StringBuilder(s.length() * n);

    for (int x = 0; x < n; x++) {
        sb.append(s);
    }

    return sb.toString();
}
```

Sizing the builder up front matters too: without it, the internal array still
has to grow and copy, just far fewer times.

And for this exact case, since Java 11, there is a shorter answer:

```java
return s.repeat(n);
```

## What the interviewer is listening for

Not "use a StringBuilder". Almost everyone gets there. The answer that separates
people is the one that names **immutability, the copy on every iteration, and
the resulting complexity**, then mentions that the compiler's own optimisation
does not rescue you here because the concatenation happens across loop
iterations rather than within one expression.
