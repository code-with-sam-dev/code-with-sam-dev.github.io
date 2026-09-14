---
title: 'Build a Production-Grade Kafka Payment Pipeline'
description: 'One payment, five deliberate failures. No single feature makes the pipeline reliable. Reliability is the overlap between eight of them.'
youtube: 'yTuNwzZP7mg'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-pipeline-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 9
duration: '10:49'
draft: false
terminal:
  path: 'kafka-payments / episode-09-pipeline'
  lines:
    - '$ docker compose up -d && ./gradlew integrationTest'
    - ''
    - '  47 tests, 0 failures'
    - '  5 deliberate failures survived, 1 effect'
---

One customer sends one payment. Now I am going to break the system five ways.

The client retries. The consumer crashes. The group rebalances. The database
becomes unavailable. The outbox publisher dies.

Does that one payment survive all five, and does it happen exactly once?

## Start with what must never be false

Not with Kafka. With the invariants:

- Money is never created or destroyed
- One logical payment moves value once
- Every movement is auditable
- Two payments for the same account do not interleave incorrectly

Every component below exists to protect one of these. Anything that protects
none is decoration. Candidates who open with Kafka have skipped the part being
assessed.

## The write path

```java
@Transactional
public Result submit(PaymentRequest req) {

    // The claim. Wins or loses atomically.
    if (!ledger.claim(req.idempotencyKey(), req.fingerprint())) {
        return existingResultFor(req.idempotencyKey());
    }

    ledger.recordMovement(req);
    outbox.enqueue("payments", req.paymentId(), event(req));
}
```

The claim, the movement and the outbox row are one transaction, or none of them
happened.

## Failure 1: the client retries

The first request claims K9 and wins, and moves the money. The retry claims K9
and loses, and returns the stored result.

Survived by idempotency. Kafka was not involved at all.

## Failure 2: the consumer crashes

The work succeeded and the commit never landed. After restart the consumer
resumes from the last committed offset and sees the record again. The claim
already exists, so there is no second effect.

Survived by offsets **and** idempotency together. Neither alone would have
done it.

## Failure 3: the group rebalances

A partition is revoked mid batch and handed to another consumer, which replays
from the last commit and loses the claim.

The rebalance was never prevented. It was made harmless, which is a different
and achievable goal.

## No single feature made this reliable

Kafka did not solve the client retry. Idempotency did not solve partition
ownership. Offsets did not solve the dual write.

Reliability came from the **overlap**. That is why this series had eight
episodes and not one.

## Failure 4: the database is unavailable

Can waiting change this? Yes, it is transient, so retry with backoff. Is the
work idempotent? Yes, the claim holds, so retrying is safe. How long can it be
late? That is a business question, and it sets the exit condition.

Backoff without idempotency would have multiplied the damage rather than
absorbing it.

## Failure 5: the outbox publisher dies

Everything is healthy. Nothing is lost. Everything is late.

Only the age of the oldest unpublished row can see it.

## Ordering holds where the key put it

Same key, same partition, ordered and guaranteed. Different keys, possibly
different partitions, and no ordering promise at all.

The design chose the key. The key chose the ordering. Nothing else did.

## The failure path is architecture

It has its own topics, its own traffic and its own signals: retry topics with
delays, a dead letter topic with enough context to replay, a path back into the
main flow, and separate monitoring for all of it.

A design that only describes success is a description of a demo.

## All five, scored

- **Client retry**: a stable identity prevented a second payment
- **Consumer crash**: committed progress replayed, the claim absorbed it
- **Rebalance**: ownership changed, the claim absorbed it again
- **Database down**: classified transient, retried with backoff
- **Publisher died**: nothing lost, everything late, and the age metric saw it

One payment. Five failures. One effect.
