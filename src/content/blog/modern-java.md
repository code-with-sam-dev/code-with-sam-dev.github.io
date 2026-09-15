---
title: 'Modern Java: Everything That Actually Shipped'
description: 'Sixteen features, each compiled on Java 8, 11, 17, 21, 25 and 26. The compile errors on the older releases are left in, because a compiler refusing a file is the most honest way to show when a feature arrived.'
pubDate: 2026-09-15
youtube: 'vH5UEcoJXcY'
tags: ['java', 'modern-java', 'interviews', 'code']
series: 'Modern Java'
episode: 1
cover: '/covers/modern-java.jpg'
sheet: '/downloads/modern-java-design-sheet.pdf'
duration: '17:44'
draft: false
terminal:
  path: 'modern-java / virtual-threads'
  lines:
    - '$ jdk21/bin/java VirtualThreads.java platform'
    - 'tasks      : 10000'
    - 'wall clock : 5226ms'
    - ''
    - '$ jdk21/bin/java VirtualThreads.java virtual'
    - 'tasks      : 10000'
    - 'wall clock : 152ms'
    - ''
    - '# Same machine. Same blocking code.'
    - '# One word different.'
---

You have not written a switch expression by hand in a long time. The agent
writes it, it compiles, the tests pass, and you approve it. That is fine, right
up until someone asks you to explain sealed interfaces with no editor in front
of you.

This is the night before version.

## Everything here was executed

The same source file was compiled on Java 8, 11, 17, 21, 25 and 26. The compile
errors on the older releases are kept on purpose: a compiler refusing a file is
the most honest way to show when a feature arrived, and it is what the version
ladder in the video is built from.

The code is in the companion repo and runs in Docker without you installing a
single JDK.

## The numbers are measurements, not illustrations

Ten thousand tasks, each waiting a tenth of a second:

```
$ jdk21/bin/java VirtualThreads.java platform
wall clock : 5226ms

$ jdk21/bin/java VirtualThreads.java virtual
wall clock : 152ms
```

Thirty four times, on the same machine, with the same blocking code. A virtual
thread is not a faster thread. It is a thread that unmounts: when it blocks,
the JVM parks it and gives the carrier thread to somebody else. Which means the
entire do-not-block, go-asynchronous discipline of the last decade was working
around a cost that has largely gone.

Five million cached order lines, with and without compact object headers:

```
heap used      : 115 MB      bytes per line : 24
heap used      :  76 MB      bytes per line : 16
```

A thirty four percent cut in heap for a flag, without changing a line of code.
Opt in from Java 25, on by default in Java 27.

## What has NOT shipped

This is the part that separates someone who has used the platform from someone
who read the release notes. As of Java 27:

- Structured concurrency: still preview, and it is the **seventh** preview
- Primitive types in patterns: still preview, the fifth
- Lazy constants: still preview
- Vector API: still **incubating** after twelve rounds
- String templates: reached a second preview and were then **withdrawn**

Describe structured concurrency in an interview as part of modern Java and you
are describing something that still needs `--enable-preview` and can still
change.

## The answer that beats listing versions

Almost every feature in this video is the compiler taking over a job you used
to do by hand and get wrong occasionally. Equals and hashCode. Remembering the
break. Remembering every place that handles a payment event. Casting something
you had already proved.

The language did not get shorter to save you typing. It got shorter because the
compiler took the parts you were bad at.
