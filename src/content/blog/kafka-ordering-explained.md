---
title: 'Kafka Ordering Explained: The Mistake That Breaks Your System'
description: 'Kafka guarantees ordering - but only within a partition. Here is what that actually means, why your consumer can still break it, and a repo you can run to watch it happen.'
pubDate: 2026-09-10
repo: 'https://github.com/code-with-sam-dev/kafka-payments/tree/main/episode-01-ordering'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 1
cover: '/covers/kafka-ordering.jpg'
duration: '4:18'
terminal:
  path: 'kafka-payments / episode-01-ordering'
  lines:
    - '$ docker compose up'
    - '$ curl localhost:8080/demo/results'
    - ''
    - '  broken   ordered: false   COMPLETED, INITIATED, AUTHORIZED'
    - '  correct  ordered: true    INITIATED, AUTHORIZED, COMPLETED'
    - ''
    - '# Same records. Same order from Kafka.'
    - '# One consumer threw the guarantee away.'
---

"We're using Kafka, so ordering is guaranteed."

I have heard that sentence in interviews, in design reviews, and in incident
post-mortems. It is half true, and the missing half is where systems break.

Kafka **does** guarantee ordering. But only **within a partition**. If you
remember one thing from this article, make it that.

## Why the topic is the wrong unit

A topic is not an ordered stream. A topic is a collection of partitions, and
each partition is its own ordered log.

Inside one partition, the rule is strict: messages are appended one after
another, and every consumer reading that partition sees them in exactly the
order they were written. If event A was appended before event B, no consumer
will ever see B before A.

Across partitions, Kafka promises you nothing. Two events in different
partitions have no defined order relative to each other, and they never will,
because there is no global clock coordinating them. That is not a limitation
Kafka is apologising for - it is the design. Refusing to order across
partitions is precisely what lets Kafka scale horizontally.

So the interview answer is not "Kafka guarantees ordering". It is:

> One partition equals one ordered stream. One topic does not.

## Making related events land together

If ordering only exists inside a partition, then the real question becomes:
how do I get the events that must stay ordered into the same partition?

The answer is the message key. When you produce a record with a key, Kafka
hashes that key to choose a partition. The same key deterministically routes to
the same partition, so every event sharing a key lands in the same ordered log.

For a payment system, the natural key is the payment ID:

```java
kafkaTemplate.send(
    "payment-events",
    paymentId,      // the key decides the partition
    paymentEvent
);
```

`PaymentInitiated`, `PaymentAuthorized` and `PaymentCompleted` for the same
payment now travel through the same partition, in order. Different payments are
free to land anywhere, and different partitions are processed in parallel.

That is the whole trick, and it is worth stating explicitly in an interview
because it shows you understand the trade-off rather than reciting a feature:
**you do not want global ordering.** Global ordering means one partition, which
means one consumer, which means no scalability. What you want is ordering for
the business entity that actually needs it, and parallelism everywhere else.

## The part most people miss

Here is where the sentence at the top of this article gets people into trouble.

Kafka can deliver your messages in perfect order and your application can still
process them out of order.

Picture a consumer polling a partition. It receives A, B, C - correctly
ordered. Then, to go faster, it hands each record to a thread pool. Three
threads run concurrently. C is small and finishes first. Then A. Then B.

Your database now has state applied in the order C, A, B. Kafka did its job
perfectly. Your application undid it.

This is the failure mode that survives code review, passes tests under light
load, and shows up in production at volume. If ordering matters for an entity,
the work for that entity has to be processed sequentially - typically by
keeping one consumer thread per partition rather than fanning out inside the
consumer.

## Retries make it worse

Now add failure.

Event B fails. Event C succeeds. If your retry strategy simply moves on and
comes back to B later, you have applied C before B and your business state is
wrong - even though every individual message was eventually processed
successfully.

This is why "just add a dead letter topic" is an incomplete answer. Sending B
to a DLQ and continuing with C is a decision to abandon ordering for that
entity. Sometimes that is acceptable. For a payment, it usually is not.

When ordering genuinely matters, the safest behaviour is to stop consuming that
partition until the failed record is resolved. That costs you throughput on one
partition and protects correctness - and being able to articulate that
trade-off is what separates a senior answer from a memorised one.

## The caveat nobody mentions

One more detail, and it catches teams late.

Your key-to-partition mapping depends on the **number of partitions**. Kafka's
default partitioner hashes the key and takes it modulo the partition count. Add
partitions, and the modulus changes - so the same key can start landing in a
different partition from the one it used before.

Records already written stay where they are. New records for that key may go
elsewhere. For a window of time, one entity's events are split across two
partitions, and ordering for that entity is broken.

This does not mean never add partitions. It means partition count is an
architectural decision, not a scaling knob to turn casually. If strict
per-entity ordering is critical, think about partition growth before you reach
production scale, not after.

## Run it yourself

Reading about ordering breaking is not the same as watching it break.

The [companion repository](https://github.com/code-with-sam-dev/kafka-payments/tree/main/episode-01-ordering)
runs end to end with Docker. One command brings up Kafka, produces payment
events, and consumes them two ways - once with a naive concurrent consumer, and
once with a sequential one. You will see the same input produce the wrong order
in the first case and the right order in the second.

```bash
git clone https://github.com/code-with-sam-dev/kafka-payments
cd kafka-payments/episode-01-ordering
docker compose up
```

That difference, reproduced on your own machine, is what makes the concept
stick when someone asks you about it under pressure.

## The short version

- One **partition** is one ordered stream. One **topic** is not.
- Give related events the **same key** so they land in the same partition.
- Ordering can still be destroyed by **concurrency inside your consumer**.
- Retries and dead letter topics are an **ordering decision**, not just an error-handling one.
- **Partition count** changes key routing. Decide it deliberately.

If you have been bitten by any of these in production, I would genuinely like
to hear which one - those stories are usually more instructive than the theory.
