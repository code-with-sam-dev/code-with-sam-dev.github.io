---
title: 'JUnit vs AssertJ vs Hamcrest: What the Failure Tells You'
youtube: '15MwUsnD8dM'
cover: '/covers/junit-assertj-hamcrest.jpg'
description: 'Three libraries on your classpath all export a method called assertThat, and you almost certainly never chose between them. Most of the time it does not matter. This is about the times it does.'
pubDate: 2026-09-15
tags: ['java', 'testing', 'junit', 'tdd', 'interviews']
duration: '13:11'
draft: false
---

Open your last Spring Boot project and look at the test classpath. Not the code,
the classpath. If you are on `spring-boot-starter-test` you have **JUnit**, you
have **AssertJ** and you have **Hamcrest**. All three. Three libraries that each
export a method called `assertThat`, sitting there, and you almost certainly
never chose between them. You are using whichever one the first example you
copied happened to import.

So: does it matter?

The honest answer is that most of the time it does not, and this episode starts
by proving that rather than pretending otherwise. Then it goes after the cases
where it does, because those are the ones that cost you an afternoon.

## The difference is not the assertion, it is the failure

A passing test tells you nothing about which library you picked. The difference
shows up the moment something goes red, in what the failure message hands the
person reading it. One tells you a boolean was false. Another names the value it
got, the value it wanted, and where they diverged.

That gap is worth more at two in the morning than it is in review.

## Writing the assertion first forces three decisions

The episode's real argument is not about syntax. Writing the assertion **before**
the throw site exists forces you to decide three things:

1. **The type a caller catches.**
2. **The message a support agent has to act on** at two in the morning.
3. **The data a caller can branch on.**

Write the test afterwards and you copy whatever string the implementation
happened to produce. That is exactly how an error that reads `exceeds
refundable` ends up describing a replay.

## The honest limit

Asserting on an exact message has a real cost, and the episode says so rather
than selling the technique. There is a section on soft assertions, one on what
coverage does and does not tell you, and a worked case where the weak assertion
and the precise one both pass and only one of them would have caught the bug.

The cold open shows nine lines staying green while the thing under test is
wrong. That is the whole point: **green and wrong** is a state your test suite
can sit in for months.
