---
title: 'Kafka Retries and Dead Letter Topics: Stop Retrying Everything'
description: 'A retry is a prediction that something relevant may be different on the next attempt. If nothing can change, retrying is not resilience. It is repetition.'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 6
duration: '11:31'
draft: true
---

Processing fails. So we retry. It fails again. We retry again. And again.

That sounds like resilience until you ask one question: what exactly are we
waiting to change?

## Three failures, three different answers

**Transient.** Something outside the message is briefly unavailable. Waiting
may change the outcome, so retry with a delay.

**Permanent.** The message itself is invalid. A required field is missing, and
thirty seconds of waiting will not create it. Never retry. Nothing will change.

**Ambiguous.** A timeout after calling an external service. It may have worked
or it may not. Retry only if the work is idempotent, which is episode 5.

Every retry policy that works starts by telling these apart. Anyone who starts
with a retry count has answered a different question.

## The retry storm

A dependency is already overloaded. A thousand consumers depend on it.

Requests start failing. Every consumer immediately retries. Load doubles. Those
retries fail too, so everyone retries again. The struggling dependency now
cannot recover, because recovery requires a gap in traffic that your retry
policy is actively preventing.

Immediate retry turns a struggling dependency into a dead one.

## The shift

Stop thinking of a retry as a loop around your listener. Think of it as
**scheduling another attempt**.

A loop blocks the poll, which is the `max.poll.interval.ms` eviction from
episode 3 arriving by a different road. A schedule does not.

## What a retry topic costs you

Event A for an account fails and moves to a retry topic for thirty seconds.
Event B for the same account stays on the original topic and succeeds now. A
returns later and succeeds second.

The business has observed B before A. Kafka preserved the order inside the
partition perfectly. The order of the **work** is what changed.

That is a real cost and it is worth paying knowingly rather than discovering.

## How many retries is correct?

Three is not inherently safe. Ten is not inherently thorough. The number is not
the question. These are:

- How long can this operation be late before it stops being useful?
- What does the customer experience while it is retrying?
- Is anything downstream waiting on it?

Answer those and the number falls out. The exit condition is a business
question wearing a technical costume.

## A dead letter topic is not special

It is an ordinary Kafka topic. Nothing in the broker knows the letters D, L and
T mean anything; the meaning is a convention your system agrees on.

What matters is what you put in it: the original topic, partition and offset,
the attempt count, and the failure reason. Enough to investigate, and enough to
**replay**.

Because dead does not mean permanent. A bug rejected valid messages and you
fixed the bug. Reference data was missing and it arrived. A dead letter topic
with no way back is a landfill with a nice name.

## The poison message

Record 100 is permanently invalid. Your consumer will not move past it until
processing succeeds, and processing can never succeed. Records 101 onward, all
valid, wait behind it. Lag climbs on exactly one partition while every other
partition looks perfect.

One bad record stops a partition. In-place retries make that permanent.

## Frameworks make it look free

A few annotations and you have backoff and a dead letter topic. The mechanism
is genuinely easy now.

The classification, the ordering cost, and the exit condition are still yours.

## Watch the retry system itself

How many records are retrying right now? Which failure types dominate? How old
is the oldest retry? How fast is the DLT growing?

A dead letter topic nobody watches is a queue of problems nobody knows about.

## The senior answer

> Start with failure classification. Transient failures deserve a delayed retry
> with backoff. Permanent failures go straight to the dead letter topic,
> because retrying them is repetition. Ambiguous failures retry only if the
> work is idempotent. Then build a replay path, and put signals on all of it.
