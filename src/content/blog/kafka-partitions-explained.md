---
title: 'Kafka Partitions Explained: Why More Consumers Do Not Always Make You Faster'
description: 'You added consumers and nothing got faster. One of them is running, healthy, and doing nothing at all. Here is why partitions, not consumers, set your limit, and what it costs to change it.'
pubDate: 2026-09-11
youtube: 'BTEAzv90W4E'
repo: 'https://github.com/code-with-sam-dev/kafka-payments/tree/main/episode-02-partitions'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 2
cover: '/covers/kafka-partitions.jpg'
duration: '5:51'
terminal:
  path: 'kafka-payments / episode-02-partitions'
  lines:
    - '$ docker compose up --scale consumer=4'
    - ''
    - '  consumer-1  assigned: payments-0'
    - '  consumer-2  assigned: payments-1'
    - '  consumer-3  assigned: payments-2'
    - '  consumer-4  assigned: (none)'
    - ''
    - '# Four consumers. Three partitions.'
    - '# The fourth is not broken. It is waiting.'
---

Traffic is growing, so you add consumers. Throughput does not move.

The new consumers are running. They are healthy. Their logs look fine. And one
of them is doing absolutely nothing.

This is not a bug, and it is not a misconfiguration. It is Kafka behaving
exactly as designed, and the reason is the single most useful thing to
understand about scaling a consumer group.

## Offsets belong to partitions, not topics

An offset is a position **within one partition**. It is not a position in a
topic, because a topic has no single ordering to have a position in.

That one fact decides everything else. If progress is tracked per partition,
then the unit of work that can be handed to a consumer is a partition. Not a
message, and not a topic. A partition.

## The limit is per consumer group

Inside a consumer group, Kafka assigns each partition to exactly one consumer.
Never two. That is what makes the offset meaningful: if two consumers in the
same group read the same partition, neither could say where the group had got
to.

So with three partitions, a group can put at most three consumers to work. A
fourth joins successfully, gets an empty assignment, and waits.

The word **group** is doing real work in that sentence. A second consumer group
gets its own independent assignment across the same three partitions. A payments
processor and a fraud service can both read every message. Groups do not divide
a topic between applications; they divide a topic between instances of the same
application.

## The idle consumer is not useless

It is easy to look at a consumer with no partitions and see waste. It is
standby capacity.

If an active consumer dies, Kafka rebalances and hands its partition to the idle
one. No deploy, no alert to act on, no gap while someone scales the group. The
fourth consumer is the reason the outage does not become an incident.

## A rebalance is not free

When the group membership changes, partitions are reassigned. During that,
consumption pauses. If your consumers hold state built from the partitions they
own, that state has to be rebuilt somewhere else.

This is why "just add more consumers" is not a free action in a running system,
and why a senior answer mentions the cost rather than only the mechanism.

## So why not just create 100 partitions?

Because partition count is not an ordinary tuning knob.

You can increase the number of partitions. You can never decrease it.

And increasing it changes where existing keys are routed. Kafka's default
partitioner for keyed records hashes the key against the number of available
partitions. Change the count, and the same key can map somewhere different. A
payment that lived in partition one may now land in partition three, while its
older events stay where they were.

Now ordering is broken across two partitions for exactly the keys that were in
flight. Not corrupted, not lost, but no longer ordered, which for a payment
system is the same kind of problem.

That is why partition count is an architecture decision made early, not a
setting adjusted under load.

## The answer an interviewer is listening for

Ordering per key, parallelism across keys.

Key by the entity that must stay ordered, which for payments is the payment
itself. Every event for one payment lands in one partition and is processed in
order. Different payments sit in different partitions and are processed at the
same time.

You get both properties from the same choice, and the partition count sets the
ceiling on the second one.

## Run it

The repository starts Kafka and the service with one command, creates a topic
with three partitions, and lets you scale the consumer group. The assignment log
in the video is the real output, not a mock-up.
