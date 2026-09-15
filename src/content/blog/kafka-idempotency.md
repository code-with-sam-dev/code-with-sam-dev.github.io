---
title: 'Kafka Idempotency: How to Survive Duplicate Messages'
description: 'The duplicate is expected. The question is what your consumer does with it. And the implementation that passes code review is the one that fails under load.'
youtube: 'lwHhlEyNdJ8'
cover: '/covers/kafka-idempotency.jpg'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-idempotency-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 5
duration: '12:45'
draft: false
terminal:
  path: 'kafka-payments / episode-05-idempotency'
  lines:
    - '$ curl -X POST /payments -H ''Idempotency-Key: PAY-7781'''
    - '$ curl -X POST /payments -H ''Idempotency-Key: PAY-7781'''
    - ''
    - '  201 Created'
    - '  200 OK   (same result, charged once)'
---

Episode 4 ended with the same payment event arriving again after a crash.

Kafka did not duplicate your business operation. It redelivered a record, which
is exactly what it promised to do. So the question is not how to stop the
duplicate. It is what your consumer does with it.

## Two things called idempotence

The confusion is reasonable, because Kafka uses the word for one of them.

**Producer idempotence** stops a retried write duplicating a record in the log.
It is a feature you switch on, scoped to one producer session.

**Consumer idempotency** stops a repeated operation duplicating its effect. It
is a design you have to build, scoped to your business identity.

One protects the log. The other protects the customer.

## The key is the operation, not the message

Payment P123 is one logical operation however many times it arrives. First
delivery carries P123. A retry carries P123. A redelivery after a rebalance
carries P123. Same identity, three deliveries, one intended effect.

If the identity changes on retry, you have no idempotency at all. So create it
where the operation originates, not where the consumer receives it, and derive
it only from things that genuinely cannot change.

## Same key, different request

This is the case most designs miss.

K9 already means: move $100 from wallet A to wallet B. Later K9 arrives again,
but this one wants $500 sent to wallet C.

That is not a duplicate. It is a conflict. Returning the first result would be
wrong, and performing the new one would be worse. Store a fingerprint of the
request alongside the key, and reject the mismatch. A reused key with different
work is a bug replaying, not a retry.

## Why "check first" fails

Here is the implementation that passes code review:

    Consumer A: does K9 exist? No.
    Consumer B: does K9 exist? No.
    Consumer A: insert K9.
    Consumer B: insert K9.
    Both: perform the transfer.

A read followed by a later write can **detect** duplicates in a quiet system.
It cannot **arbitrate** two duplicates arriving at once.

## Let the database decide

Make the claim itself atomic.

```sql
INSERT INTO idempotency (scope, key, fingerprint, state)
VALUES ('payments', :key, :fingerprint, 'IN_PROGRESS')
ON CONFLICT (scope, key) DO NOTHING
RETURNING key;
```

A row back means you won: do the work. No row back means someone else owns it.
There is no window between the check and the write, because there is no check.

## The claim and the effect must be one thing

Winning the key is not enough if the two can disagree. Record K9 as complete,
then crash before moving the money, and the next delivery skips it as done. The
money never moved and nothing will tell you.

Put the claim and the effect in the same transaction, or do not claim at all.

## Losing the race is not the same as success

If you lose the claim, you have three possible situations, and a design that
only stores "seen" cannot tell them apart:

- **IN PROGRESS**: the first attempt has not finished. Do not report done.
- **COMPLETE**: return the stored result. That is why you stored it.
- **FAILED**: this delivery may legitimately retry.

## When the effect is external

Your local transaction cannot make a remote charge atomic with a local row. The
answer is to pass your key to **them** and let the provider deduplicate. Most
payment APIs accept exactly this for exactly this reason.

## What it does not solve

Idempotency solves duplicate **intent**. Two different legitimate payments are
not duplicates. Ordering is a separate problem. Concurrent updates to one
balance still need locking or isolation. And a wrong amount, sent once, is
processed exactly once and is still wrong.

Knowing the edge of a pattern is what an interviewer is listening for.

## The senior answer

> Give each logical operation a stable identity, created at its origin. Carry
> it through every retry. Claim it atomically with a unique constraint, never a
> check then a write. Put the claim and the effect in the same transaction. For
> external effects, hand your key to the provider.

The atomic claim is the sentence that separates a senior answer from a junior
one.
