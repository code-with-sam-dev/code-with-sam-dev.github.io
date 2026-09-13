---
title: 'Kafka Transactions and the Transactional Outbox: Where Atomicity Stops'
description: 'The payment committed. The process died. The event was never published. Both orderings leak, and the fix is not the one most people reach for first.'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 7
duration: '12:12'
draft: true
---

A payment commits successfully in Postgres. The application now needs to
publish Payment Completed to Kafka. Before the publish succeeds, the process
dies.

The payment exists. The event does not. Nothing is going to tell you.

## Both orderings leak

**Commit first, then publish.** The database is durable, the publish never
happens, and you have a real payment nobody downstream knows about.

**Publish first, then commit.** Kafka accepts the event, the commit fails, and
downstream systems act on a payment that never existed. Worse, because you
cannot unpublish an event.

Reversing the order does not close the window. It moves it somewhere more
expensive.

## Why Kafka transactions sound like the answer

The instinct has a good origin. Kafka transactions are real and they are
genuinely atomic. The question is what they are atomic **across**.

Consume event A, calculate, produce events B and C, and commit the input offset
with them. All of that commits together or none of it does. That is powerful
and it is bounded.

Note what is not in that picture: your Postgres write, and your call to a
payment provider.

## The rule

Before saying Kafka transaction, outbox, or distributed transaction, draw the
state boundary. Which systems must agree, and which may be allowed to catch up?

Most arguments about outbox versus transactions are really arguments about
where somebody drew that boundary without saying so.

## What about two phase commit?

The XA specification exists and does coordinate multiple resources. It requires
every participant to support the protocol, it introduces a coordinator that can
itself fail while holding locks, and operationally most teams that adopt it
eventually leave it.

The answer is not that it is impossible. It is that the cost lands somewhere
you did not budget for.

And beware the design that only looks atomic: one transaction manager for
Postgres, another for Kafka, both wrapped in a single try block. That is two
transactions with a hopeful comment.

## The outbox asks a different question

Not "can both systems commit together". Rather: what can Postgres guarantee on
its own?

```sql
BEGIN;

  UPDATE payments
     SET status = 'COMPLETED'
   WHERE id = :payment_id;

  INSERT INTO outbox (topic, key, payload)
  VALUES ('payments', :payment_id, :event);

COMMIT;
```

Both rows are durable or neither is. A separate publisher delivers the event
afterwards.

So: the payment commits, the process crashes before Kafka hears anything, and
the event is **not** lost. It is sitting in the outbox table, inside the same
transaction that made the payment real.

## The part that gets hand-waved

The outbox does not give you exactly once publication.

The publisher reads row E7, publishes it successfully, then crashes before
marking it published. The next run finds E7 unpublished and publishes it again.

No lost events. Not exactly once. Consumers still need idempotency.

## Who reads the outbox, and how

**Polling.** A query on a schedule. Simple, yours to operate, puts load on the
database, and easy to reason about.

**Change data capture.** Reads the database log. Lower latency, more moving
parts, and easier to get wrong quietly.

Most teams should start with polling. It is the one you can debug at three in
the morning.

## Ordering is not free either

Two publisher workers, one payment. Worker 1 takes Payment Created, worker 2
takes Payment Approved, and worker 2 publishes first. Downstream sees Approved
before Created.

Partition by the key, or order per key when you claim. Concurrency will not
preserve it for you.

## A new failure mode you now own

The payment application is healthy. Postgres is healthy. Kafka is healthy. The
outbox publisher has been stopped for six hours.

Everything is green and nothing is being delivered. Alert on the **age of the
oldest unpublished row**. Nothing else will tell you.

## The senior answer

| If the boundary is | Use | Because |
|---|---|---|
| Kafka to Kafka | Kafka transactions | offsets and output commit together |
| Database to Kafka | the transactional outbox | one system can guarantee both writes |
| Anything to a third party | idempotency keys | nothing makes a remote call atomic |

Naming a favourite pattern is the junior answer. Drawing the boundary first is
the senior one.
