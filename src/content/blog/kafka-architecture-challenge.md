---
title: 'Senior Kafka Architecture Challenge: Would Your Design Survive?'
description: 'Nine changes to one architecture. The first-order answer is easy. The interview is decided by the second-order effect, and by knowing what not to build.'
youtube: 'rBu085eXOCo'
cover: '/covers/kafka-challenge.jpg'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-challenge-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 10
duration: '11:08'
draft: false
terminal:
  path: 'kafka-payments / episode-10-challenge'
  lines:
    - '$ # three partitions, six consumers. throughput?'
    - ''
    - '  c-1..c-3  one partition each'
    - '  c-4..c-6  idle'
    - ''
    - '  Partition count is the parallelism ceiling.'
---

We built the payment pipeline. Now I am going to change one thing, seven times,
plus two bonus challenges.

Pause and answer each one before reading on. The first-order answer is easy.
The interview is decided by the second-order effect.

## 1. Three partitions, six consumers

Three consumers get one partition each. Three sit idle. A rebalance happened
and achieved nothing.

Partition count is the parallelism ceiling. Extra consumers are standby
capacity, not speed.

## 2. Three partitions become six

First-order: the ceiling doubled.

Second-order, and this is the answer they want: the same key may now hash to a
different partition, so old and new records for one account can end up split
across two partitions, and per-key ordering between them is no longer promised.
And you can never reduce the count again.

Anyone can say "more parallelism". The interview turns on what it cost.

## 3. The effect succeeds, then the consumer dies

It replays. Whether the customer is charged twice is decided entirely by your
idempotency, not by anything in Kafka.

## 4. Move failures to a retry topic

Event A fails and is delayed thirty seconds. Event B for the same account
succeeds immediately. A returns and succeeds second.

Partition ordering intact. Business ordering inverted. That is a real trade and
the answer they want to hear you make knowingly.

## 5. The external provider response is lost

The request left. The provider may have charged the customer. You know nothing.

Retry only if they will deduplicate, which means passing your key to them.
This is the ambiguous failure, and it is only safe because of the key.

## 6. The outbox relay stops

Payments keep committing. Kafka is healthy. Consumers are healthy.

Nothing is lost and everything stops arriving. Only the age of the oldest
unpublished row can see it.

## 7. Add a second consumer group

No, analytics does not steal messages from notifications. Groups are
independent, each with its own committed offsets.

This one is genuinely simple, and it is here on purpose: not every question has
a trap.

## Bonus: "we enabled transactions, so it is exactly once"

Your first question is not how. It is: **exactly once across what?**

## Bonus: replaying from the dead letter topic

Only safe if the identity outlived the record. Is the claim still present? Has
it been cleaned up? Does the replay preserve the original key? Is anything
downstream order-sensitive about it arriving now?

## The seven questions I would ask any design

| # | Question | A weak answer sounds like |
|---|---|---|
| 1 | What is the ordering boundary? | "Kafka guarantees ordering" |
| 2 | What identifies one logical operation? | "we use a UUID" |
| 3 | When does progress become durable? | "we commit offsets" |
| 4 | Which failures retry, and which never? | "we retry three times" |
| 5 | Where does atomicity stop? | "we use transactions" |
| 6 | What is invisible while everything is green? | silence |
| 7 | What would you not build here? | silence |

Anyone can answer one to five from a blog post. Six and seven come from having
been on call.

## The final trap

Do not copy every mechanism in this series into every Kafka application. A low
risk analytics pipeline does not need a payments architecture.

Knowing which of these to leave out is the same skill as knowing how to build
them.
