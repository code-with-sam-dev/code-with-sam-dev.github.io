---
title: 'TDD for Java: The Step Everyone Skips'
description: 'A test that has never failed has never proved anything. The cycle on a real refund rule, the evidence with both halves attached, and the objection a sceptic raises at minute three answered honestly.'
pubDate: 2026-09-15
youtube: '15MwUsnD8dM'
cover: '/covers/tdd-for-java.jpg'
duration: '13:11'
tags: ['java', 'tdd', 'testing', 'junit', 'interviews']
draft: false
---

You already write tests. You write them after the code, they pass on the first
run, and that feels like the system working.

It is not. A test that has never failed has never proved anything. It has only
agreed with you.

## Four things this article will not defend

Pretending the method has no cost is how it lost the room in the first place.

1. **"Every production line needs a failing test first."** Too rigid.
   Infrastructure wiring, spikes, generated code and trivial mappings are poor
   candidates and everybody knows it.
2. **"The cycles must always be tiny."** Small feedback loops are useful.
   Writing the smallest imaginable assertion is not virtuous by itself.
3. **"One hundred percent coverage."** Coverage tells you what executed, not
   whether anything meaningful was checked.
4. **"One assertion per test."** One *behaviour* per test is the better rule,
   and a behaviour can need several assertions.

What is left after you delete all four is the part that actually works.

## What the evidence says, including the half nobody quotes

A meta-analysis in IEEE Transactions on Software Engineering covering 27
studies found a **small** positive effect on external quality and **little to
no discernible effect on productivity**. In the industrial subgroup the quality
improvement was larger, and so was the productivity drop.

Separately, four industrial teams, three at Microsoft and one at IBM, reported
pre-release defect density 40 to 90 percent lower than comparable projects, and
took 15 to 35 percent longer.

Those are four observational case studies, not a controlled experiment, and the
cost is in the same paper as the benefit. So the honest summary is: real,
modest, and it costs you time. Anyone selling you more than that is selling.

## Not FizzBuzz

Nobody ever needed a test to know what three times four is. That is the flaw in
almost every demonstration: the answer is obvious, the test is theatre, and you
learn the ritual instead of the judgement.

This is a refund rule. Money, partial refunds, retries. Seven tests, and **one**
says what must be allowed while **six** say what must be refused.

That ratio is the most transferable thing here. The happy path is already in
your head. The refusals are the cases that become incidents.

And three of them do not look at the current request at all:

| The history | What must happen |
|---|---|
| 10,000 captured, 6,000 refunded | a 5,000 refund is refused, against what is *left* |
| 10,000 captured, a 6,000 attempt FAILED | a 7,000 refund is allowed, because a refusal costs nothing |
| the same idempotency key, twice | one refund, same result, balance moves once |

Those describe what the refundable balance *means* given a history. That is the
domain, not input validation.

## Red, for the right reason

Run the suite before the implementation exists, against a skeleton that throws
`UnsupportedOperationException`:

```
Tests run: 7, Failures: 4, Errors: 3
RefundPolicyTest.refusesMoreThanCaptured:43
  expected: <RefundRejected> but was: <java.lang.UnsupportedOperationException>
```

Look at *why* they failed. Not "class not found". Not "did not compile". Every
test compiled, ran, reached the method under test, and failed on the thing you
put there deliberately.

That tells you what a missing class never could: each test runs, each reaches
the code, and each is checking something. A red step that only proves you have
not written the class yet has proved nothing about your test, and skipping it is
what turns the cycle into a ritual.

## The run that makes the case

Here is a change that would pass most code reviews. The refundable balance is
computed from the refund history; somebody decides that is a needless
indirection and compares against what was captured instead. One line.

```diff
- long refundable = order.refundableCents();
+ long refundable = order.capturedCents();
```

Six tests stay green. One does not:

```
RefundPolicyTest.refusesSecondRefundBeyondRemaining:81
  Expected RefundRejected to be thrown, but nothing was thrown.
```

Ten thousand captured, six thousand already refunded, and a five thousand
refund went through. Four thousand of a customer's money, caught in 41
milliseconds by a test written before the bug existed.

Sit with the shape of that result, because the shape is the argument. Six tests
agreed with the change; they were not wrong, they were not looking at that. One
disagreed, and it named the case and the line.

That is what "the tests are a specification" means. Not that they document the
code. That when somebody changes the code, the specification is the thing that
objects, by name, before a customer does.

## The objection at minute three

It is not "this is slow". It is: why does it matter whether I write the exact
same good test five minutes before the code or five minutes after it?

The dishonest answer is "because that is the discipline". It loses, and it
deserves to.

The honest one: sometimes it genuinely does not matter. If you understand the
requirement, implement it correctly, and then independently write a suite
capable of catching realistic faults, test-after gives you the same confidence.

The advantage is narrower and it is about you. Once you have implemented it,
you know how it works, and that knowledge changes which tests occur to you. You
will naturally confirm the structure you just built. Test-first asks a different
question: before I know how this will work, what behaviour must be true?

## The AI argument, and why the obvious version is wrong

The obvious version says an agent implements in nine seconds, so the test is
what is left, so test-first matters more.

That does not follow. If the same tool writes your test **and** your
implementation from one prompt, you do not have an independent specification.
You have the same reasoner marking its own exam, and ten green tests do not help
if all ten encode the same misunderstanding.

What survives is narrower and more useful: this does not make test driven
development more valuable, it makes **independent specification** more valuable,
and writing the test first is one way of forcing that separation.

Generating code got cheaper much faster than deciding what the code should do.

## When not to bother

- A **spike**, where you are writing code to find out what you are building.
  Specifying the answer before you have found it is theatre.
- A **trivial mapping**, or generated code, where the test restates the code in
  a second language.
- **Wiring one framework to another**, where you end up testing somebody else's
  library badly.
- And when you **cannot say what observable behaviour you expect**. That is not
  a missing test, it is an unfinished design.

## Monday

1. Write the refusals, and more of them than feels reasonable.
2. Make it fail for the right reason before you make it pass.
3. Let the specification come from somewhere other than the implementation.
4. When a change turns one test red, read which one. That name is the bug
   report.
