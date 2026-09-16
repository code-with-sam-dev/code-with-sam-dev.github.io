---
title: 'Distributed Transactions: What @Transactional Actually Covers'
description: 'Rolled back, and the customer is still charged. The measured cost of a remote call inside the boundary, why Kafka is not an XA resource, and the sentence in Spring own documentation that settles the argument.'
pubDate: 2026-09-15
youtube: 'jTa3lUnbWfU'
cover: '/covers/distributed-transactions.jpg'
duration: '13:38'
sheet: '/downloads/distributed-transactions-design-sheet.pdf'
tags: ['java', 'spring', 'kafka', 'distributed-systems', 'interviews']
draft: false
---

A method writes to the database, charges a card over HTTP, and writes to the
database again. There is an `@Transactional` on top of it, so it is atomic.

Then the second write fails. Spring does exactly what it promised and rolls the
database transaction back. The order row is gone, and the customer has been
charged.

So what, exactly, was transactional?

## The idea underneath all of it

**A transaction boundary in your code is not the same thing as an atomic
business operation. Atomicity only extends across resources that actually
participate in the transaction protocol.**

Everything else here is a consequence of that sentence.

| The operation | In the transaction? | What rollback did |
|---|---|---|
| `orders.markCharging` | yes | undone |
| `paymentProvider.charge` over HTTP | **no** | nothing. It never heard of your rollback |
| `orders.markPaid` | yes | undone |
| a Kafka publish, if there were one | **no** | nothing |

The method boundary is a boundary in *your* process. It means almost nothing to
the other system, and the most expensive misunderstanding in this subject is
assuming otherwise because the lines sit next to each other on screen.

Worth knowing, and it is the small thing: Spring's reference says *"In proxy
mode (which is the default), only external method calls coming in through the
proxy are intercepted"*, so self-invocation does not start a transaction at all.

## The part that costs you money even when nothing fails

A connection pool is a fixed resource, and a transaction holds one connection
for its whole duration. Put a remote call inside the boundary and the duration
of your database transaction is the duration of a network you do not control.

Ten connections, a provider that takes 200ms, a one second connection timeout,
and the identical workload run twice. The only variable is whether those 200ms
happen while a connection is held.

| Concurrency | Remote call | Wall clock | Served | Refused |
|---|---|---|---|---|
| 40 | inside the boundary | 1049ms | 40 | 0 |
| 40 | outside | 212ms | 40 | 0 |
| 200 | inside the boundary | 1232ms | 47 | **153** |
| 200 | outside | 234ms | 200 | 0 |

At 40 requests nothing is refused and the work takes five times as long. No
errors, no logs, a slower endpoint that reads as normal variance. That is the
version that gets dismissed, and it means the system is already running with no
headroom.

At 200 the wait for a connection exceeds the timeout and three quarters of the
requests are **refused**. Same pool, same database, same queries.

**A remote call inside a transaction turns a database concern into an
availability concern.** When the provider gets slow you do not get slow. You
start refusing, and you refuse everybody, including the requests that were never
going near that provider.

## The warning in the framework's own documentation

Quoted in full, because it is the vendor describing the failure and most people
using this propagation level have never read it:

> The resources attached to the outer transaction will remain bound there while
> the inner transaction acquires its own resources such as a new database
> connection. This may lead to exhaustion of the connection pool and potentially
> to a deadlock if several threads have an active outer transaction and wait to
> acquire a new connection for their inner transaction, with the pool not being
> able to hand out any such inner connection anymore. Do not use
> `PROPAGATION_REQUIRES_NEW` unless your connection pool is appropriately sized,
> exceeding the number of concurrent threads by at least 1.

## Two phase commit, including the part that gets left out

A coordinator and resource managers that can promise before they act. Prepare:
each resource writes enough durable state to be able to commit later, and
answers yes or no. Commit: if everyone said yes, they all go.

It genuinely gives atomicity across two databases. That is real engineering, not
a punchline.

The window is what gets left out. Between prepare and commit, every resource has
said yes, is holding locks, and is waiting. If the coordinator dies there, those
transactions are **in doubt**: not committed, not rolled back, locks still held,
and a human involved.

That is not a reason never to use it. It is the reason the coordinator itself has
to be highly available, which is a system you now operate.

## Kafka is not an XA resource

Here is the claim you will hear: you could use XA across your database and
Kafka, but it is slow, so do not.

The first half is not true, and the correction matters more than the advice.

Kafka transactions are real: a transactional id, a transaction coordinator,
atomicity across writes to multiple partitions and topics, and the consumer
offsets committed with them. That is what exactly once processing is built on.

But that is the Kafka protocol. The producer is not an `XAResource`, it does not
enlist in your JTA transaction manager, and it does not take part in a two phase
commit with your database.

**So the reason you cannot make a database write and a Kafka publish atomic is
not that it would be a bad idea. The protocol to do it does not exist there.**

## Synchronised is not atomic

Spring can synchronise a Kafka transaction with a database one. The reference
states the order plainly: *"When the method exits, the database transaction will
commit followed by the Kafka transaction."* Two managers, two commits, two
decisions.

And then the sentence that settles the argument:

> Starting with versions 2.5.17, 2.6.12, 2.7.9 and 2.8.0, if the commit fails on
> the synchronized transaction (after the primary transaction has committed), the
> exception will be thrown to the caller. Previously, this was silently ignored
> (logged at debug level). Applications should take remedial action, if
> necessary, to compensate for the committed primary transaction.

Read what that admits. The database committed. The Kafka commit failed. The
advice is that your application compensates. That is not atomicity, it is a
documented partial failure with a documented owner, and the owner is you.

At the time of writing, September 2026, `ChainedKafkaTransactionManager` has been
deprecated since version 2.7.

## What replaces it

**The outbox** stops needing two resources. Write the business row and a row
recording the intent to publish, in one transaction, in the database you already
had. A separate process reads that table and publishes, retrying until it
succeeds. That is at least once delivery plus idempotent consumers: trading an
impossible guarantee for a possible one, deliberately.

**Sagas**, honestly. The cartoon version is reserve inventory, take payment,
payment fails, release inventory, everybody goes home. The real version is:

```
reserve inventory   SUCCESS
take payment        SUCCESS
create shipment     FAILED
refund the payment  ALSO FAILED
```

What now? There is no rollback. There was never a rollback. A compensating
action is another distributed operation with every failure mode of the original:
it can time out, it can execute and lose the response, and it can genuinely
fail.

So it needs to be idempotent, to have durable state, to have an observable
status, to have a bounded retry policy, to be reconciled, and to have a terminal
state meaning a human must look at it. Pretending that last state does not exist
is how you get a queue nobody is draining.

**A saga does not restore atomicity.** It is a protocol for driving the system
toward an acceptable business state after a partial success.

## Choose the invariant, not the pattern

The senior answer here is a question: which invariant are you protecting?

A payment is captured at most once. A refund never exceeds the capture. Ledger
entries balance. Name the two or three that must never be violated, then decide
deliberately what you are willing to be eventually consistent about.

Because you will be eventually consistent about something. The only choice you
have is whether you chose it, or whether it chose you at three in the morning.
