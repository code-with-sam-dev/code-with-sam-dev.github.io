---
title: 'Kafka Offsets Explained: What "Exactly Once" Really Means'
description: 'An offset is not where your consumer is. It is recorded progress, and you decide when to record it. That decision, and nothing in Kafka, is what makes your system at most once or at least once.'
youtube: 'RwctwkYUi7Q'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-offsets-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 4
duration: '11:07'
draft: false
terminal:
  path: 'kafka-payments / episode-04-offsets'
  lines:
    - '$ kafka-consumer-groups --describe --group payments'
    - ''
    - '  PARTITION  CURRENT-OFFSET  LOG-END  LAG'
    - '  payments-0            40        42    2'
    - ''
    - '  Processing 42. Saved 40. Both are true.'
---

Most explanations say an offset tells you where your consumer is.

That is useful shorthand, and it hides the part that decides everything.

## Three positions, all true at once

A consumer can have **fetched** record 42. It can be **processing** record 42.
And the group's **committed** progress can still be back at 40.

Those three states exist at the same moment, and they are not the same thing.
An offset is a position in a partition log. A committed offset is recorded
progress for a consumer group. Neither is a live pointer to whatever your
application happens to be doing right now.

The gap between doing the work and recording that you did it is where every
delivery guarantee you have ever heard of actually lives.

## What a commit actually records

After successfully processing records 40, 41 and 42, the consumer normally
commits the offset of the **next** record it expects: 43.

That does not mean 43 has been processed. It means: for this consumer group,
everything before 43 is complete, according to our processing decision.

That word, decision, is the important one. An offset commit is a claim you are
making about how much work you are prepared to consider done.

## Commit first, and you can lose work

Read record 42. Commit past it. Then perform the business operation, and crash.

After restart, the group resumes from 43. Record 42's work never happened, and
nothing anywhere knows. That is **at most once**.

## Process first, and you can repeat work

Reverse it. Read 42, do the work, and only then commit. Safer against loss, and
now there is a window between the operation succeeding and the commit landing.
Crash inside that window and 42 is processed again after restart. That is
**at least once**.

Kafka did not choose either of these for you. Your commit order did.

## Auto commit does not mean "after my code succeeded"

At the time of writing, September 2026, against Kafka 4.3, the Java consumer
documentation lists automatic offset commits as enabled by default with a five
second interval.

People read that as "commits when my handler finishes". It commits on a timer,
during poll. The timer has no idea whether your business operation worked.

## So where does exactly once actually apply?

Start with the narrow problem. Consume from a Kafka topic, process, produce to
another Kafka topic. If the output records and the input offset commit together
in one transaction, that is genuinely exactly once, and it is real.

Note what is not in that picture: a database, a payment provider, an email.

Two more pieces people forget. A producer can write inside a transaction and
later abort it; whether a consumer sees those records depends on its
`isolation.level`, and at the time of writing Kafka 4.3 lists
`read_uncommitted` as the default. And producer idempotence, which at the time
of writing is enabled by default when there are no conflicting configurations,
deduplicates a **retried write**. It says nothing about your business operation
being sent twice by your own code.

## Where it stops

Consume a payment event. Write to Postgres. Commit the offset. Can Kafka make
those two systems exactly once by itself? No. It cannot see one of them.

Record 42 says charge this customer one hundred dollars. The consumer calls the
provider. The customer is charged. The consumer crashes before committing. On
restart, 42 arrives again.

Nothing in Kafka stops the second charge. The receiver has to recognise the
repeat, and that is idempotency.

## The senior answer

> An offset is recorded progress for a consumer group and partition. Commit
> timing decides the failure window, and you choose it: commit first and you
> risk losing work, process first and you risk repeating it. Exactly once holds
> inside Kafka, given transactions and a read_committed consumer. It ends at
> the first external side effect, and there you need idempotency.

The sentence the whole episode is built around:

**Exactly once is not a property you can discuss without naming the transaction
boundary.**

---

Checked against Apache Kafka 4.3 documentation on 2026-09-12.
