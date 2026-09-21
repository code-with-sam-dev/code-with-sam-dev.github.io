---
title: 'What Do You Do While the AI Writes the Code?'
youtube: 'EHkYB8duwdE'
cover: '/covers/while-ai.jpg'
duration: '11:13'
description: 'Four jobs are left, and one of them makes the other three theatre if you skip it. With three studies read at the source, and a number that did not survive checking.'
pubDate: 2026-09-15
tags: ['ai', 'engineering', 'code-review', 'testing', 'interviews']
draft: false
---

Your agent just wrote four hundred lines in ninety seconds. Honest question:
what were you doing for those ninety seconds? If the answer is watching, that
is the whole problem.

Four things are left. One of them, if you skip it, makes the other three
theatre, and you will feel careful the entire time.

## First, not the comfortable version

The comfortable version is that AI does the boring typing while experienced
engineers keep doing the important thinking. That is cope, and a smart person
will call it cope.

Implementation genuinely was part of the job. Decomposition, API design, data
structures, concurrency, error handling, integration, hundreds of small local
judgements. We called that coding, and it was never merely keyboard time.

The harder version, and the one that holds up: implementation is getting
cheaper, accountability is not going anywhere, and judgement is now the scarce
resource.

## One measured thing before the opinions

In a study of 5,971 self reports from professional developers, published in
IEEE Transactions on Software Engineering, reading or writing code was 15
percent of the workday. Eighty four minutes. Meetings were also 15 percent.
Debugging was 14. The longest stretch anyone got on code without an
interruption averaged 47.3 minutes.

Be careful what you take from that. It is self reported, at one very large
company, and it does not prove that typing was merely a bottleneck. What it
does show is that the job was already much bigger than the part we are now
automating.

## Job one: choose the smallest correct change

This moved to the top of the list for an economic reason, not a philosophical
one.

An unnecessary feature used to have friction. Somebody had to estimate it,
build it, test it and justify three days on it. That friction was not
efficient, but it occasionally protected the system, because some bad ideas
died of exhaustion.

That friction is gone. Here is a request typed at five in the afternoon:

> Add retries to the payment call. Add a cache on the order read. And add a
> fallback table in case the provider is down.

Twenty minutes later you have six hundred lines of technically correct
liability. Retries with no idempotency key, so the payment goes twice. A cache
with no invalidation story, so a refunded order reads as paid. And a fallback
table that is now a second source of truth nobody will reconcile.

Every line does what was asked. Both of the first two are runnable in the
companion repo, and they print exactly this:

```
$ java src/RetryNoKey.java

attempt 1: read timed out after 2000ms, retrying
attempt 2: ok, receipt ch_2

charges recorded by the provider:
  ord_8812 4999
  ord_8812 4999

rows: 2
customer was charged: 9998 cents
```

The timeout was on the way BACK. The charge had already happened. A retry with
no key cannot tell that apart from a request that never arrived.

Smallest correct change also means the shape you hand over. Do not say
"implement subscriptions". Decide the order yourself: the state model, then the
migration, then the API, then the billing integration, then the backfill. Each
step independently deployable and observable, so that when it is wrong you find
out from a metric rather than from a customer.

## Job two: define correctness before the implementation exists

Not after. If you write acceptance criteria after you have seen the code, you
will write criteria the code already passes. Everybody does.

What handing over a task looks like when correctness comes first:

```
Behaviour, as observable outcomes:
  - POST /refunds returns 201 and exactly one ledger row
  - the same request id returns the SAME refund, not a new one

Must fail:
  - a refund larger than the original charge
  - a refund against an order with no capture
  - a second refund after a full refund

Do not change anything outside these files.
```

The cases that must fail are the half everyone leaves out, and they are the
half that becomes the incident.

Then the part of correctness that lives outside any ticket: the invariants. A
payment is charged at most once. A refund never exceeds the original amount. An
audit row is never deleted. There is no file called `invariants.txt`. These
live in the heads of people who have been on call, and if nobody states them,
nothing downstream can respect them.

## Job three: reason about consequences outside the diff

A diff can be entirely correct and still make the system worse, and this is the
failure that reads as competence right up until three in the morning.

The clearest version is anything irreversible. A migration that drops a column
is correct, tested and reviewed. It is also the one change in the release that
cannot be rolled back by redeploying the previous version. Nothing in the diff
says that. Nothing in the test output says that. It is a property of the change
in the world, not of the change in the file.

## Job four: verify against independent reality

This is the one that makes the other three theatre.

Suppose you did everything else perfectly. You cut the scope. You wrote the
criteria first. You stated the invariants. You thought about the blast radius.
You read the diff line by line. And then you asked, are we done?

> Yes. All requirements are satisfied and the implementation correctly
> preserves idempotency.

If you accept that sentence as your evidence, every discipline above it just
collapsed. The thing that produced the work became the judge of the work.

**Never let the system that produced the work be your only source of evidence
that the work is correct.**

That is stronger than "read the diff", and it survives better models. Reading
the diff is a technique for obtaining confidence, and a technique can be
replaced. Independent evidence is a principle.

What counts as independent depends on the claim, and that matching is the
skill:

| It says | Independent evidence is |
|---|---|
| the endpoint is idempotent | send the request twice and read the row count |
| the migration is safe | run it against a restored copy of production and time it |
| performance is fine | load it and look at p99, not the average |
| the bug is fixed | reproduce the original failure first, watch it fail, then watch it pass |

Tests written after the fix, by the thing that wrote the fix, are not evidence.
They are the same opinion in a different font.

## And if you think you would notice

A randomised trial run by METR took 16 experienced open source developers and
246 real tasks in their own repositories. With AI tools allowed, they were 19
percent slower. They had predicted a 24 percent speedup before starting, and
after finishing, having just been slowed down, they estimated they had been
sped up by 20 percent.

Being fair about it: METR now labels that result historical, because it used
early 2025 tools. The finding worth keeping is not the 19 percent. It is the
gap between what was measured and what was felt.

For balance, a randomised trial run by GitHub on 202 developers, with 1,293
blind reviews, found people using Copilot were 53.2 percent more likely to pass
all ten unit tests. That is GitHub studying its own product, on one bounded
task.

Both are evidence. Neither of them is your codebase.

## The strongest objection

A critic says: you have taken the shrinking remainder of the job and declared
that remainder to have always been the real job. Today it writes the functions.
Tomorrow it writes the acceptance criteria, finds the invariants, analyses the
blast radius and runs the verification. You are moving the goalposts every time
the model gains a capability.

That is a good argument, and the honest answer is yes, some of this will be
automated too. These four are not claimed to be uniquely human. The claim is
narrower: production is getting cheaper faster than accountability is
disappearing, and somebody still has to decide what evidence is sufficient and
what risk is acceptable.

If a system can one day own that, including the consequences, then the job has
changed far more than this article describes.

## Monday morning

1. Choose the smallest correct change. Bad ideas are cheap to build now.
2. Define correctness before the code exists. Criteria written afterwards
   always pass.
3. Reason about what happens outside the diff. Correct and safe are different
   words.
4. Verify against something that did not write the code. You are the only
   participant who is accountable on Monday.
