---
title: 'Design a Digital Wallet: The $100 Transfer That Disappears'
description: 'A customer sends $100, the money leaves their wallet, and the system crashes. Idempotency keys, a double entry ledger, the lost update, one atomic transaction and the transactional outbox, worked end to end.'
pubDate: 2026-09-12
youtube: 'fdrbDnkAruU'
repo: 'https://github.com/code-with-sam-dev/digital-wallet'
tags: ['system design', 'payments', 'postgresql', 'interviews']
series: 'Tricky Senior Engineer Interview Questions'
episode: 1
cover: '/covers/digital-wallet.jpg'
duration: '13:38'
terminal:
  path: 'digital-wallet / transfer'
  lines:
    - 'BEGIN;'
    - '  SELECT * FROM wallets WHERE id IN (?, ?) ORDER BY id FOR UPDATE;'
    - '  INSERT INTO transfers ...'
    - '  INSERT INTO ledger_entries ...   -- debits = credits'
    - '  INSERT INTO idempotency ...'
    - '  INSERT INTO outbox ...'
    - 'COMMIT;'
    - ''
    - '# One boundary. All of it, or none of it.'
---

A customer sends one hundred dollars. The system removes one hundred dollars
from their wallet. Then it crashes.

The receiver never gets the money. The sender has already lost it.

That is not mainly a database problem. It is a system design problem, and in a
senior interview it is the kind of failure your architecture is expected to
prevent before anyone asks you about throughput.

## Define what must always be true

Before choosing any technology, write down the invariants. They drive the
design, and the technology comes afterwards.

- A transfer must not create value.
- It must not destroy value.
- The same logical request must not move money twice.
- Independent requests must not spend the same available funds at the same time.
- If we report success, durable financial records must explain what happened.

Every decision below exists to protect one of those five.

## The naive design, and four attacks on it

The common first answer: the client calls a transfer API, the service checks the
sender's balance, subtracts the amount, adds it to the receiver, returns success.

It is a reasonable starting point. A senior engineer attacks it immediately.

1. What if the same request arrives twice?
2. What if two transfers spend the same balance at once?
3. What if we crash between the two money movements?
4. Months later, how do we prove exactly what happened?

## 1. The retry: idempotency keys

A payment succeeds, but the response is lost on the network. The client does not
know what happened, so it sends the request again.

The client supplies an **idempotency key** scoped to the logical operation, and
reuses the same key when retrying. The server finds the completed operation and
returns its original result. No second money movement.

Two details that separate a good answer from a complete one:

- If the same key arrives with **materially different request data**, that is a
  client error, not a duplicate. Treat it as one.
- The idempotency record must be retained for the retry window your API
  promises, and it must be written **in the same database transaction** as the
  money movement. An idempotency record that commits separately can disagree
  with the transfer it describes.

Idempotency solves duplicate intent. It does nothing about two different,
legitimate requests competing for the same money.

## 2. Two at once: the lost update

The sender has $150. Transfer A wants $100. Transfer B also wants $100.

PostgreSQL's default isolation level is **Read Committed**, where each normal
select sees a snapshot taken at the start of that statement. In a read,
calculate, then write pattern, both transactions can read the same starting
balance, both calculate 50, and both write 50.

Both appear to succeed. The final balance is 50. One update silently overwrote
the effect of the other. The concurrency literature calls this a **lost update**.

PostgreSQL did not lose the money. The application split the decision into
separate steps and created a window where two transactions could decide from the
same stale state.

### Locking, and why retry is part of the design

`SELECT ... FOR UPDATE` on the relevant wallet rows, before deciding whether
funds are available.

At Read Committed, a competing `SELECT FOR UPDATE` waits for the first
transaction, then locks the current row version and makes its decision against
the state that now exists. It no longer gets to pretend the first transfer never
happened.

At Repeatable Read or Serializable the behaviour differs: if the row changed
after the transaction began, PostgreSQL can throw instead of continuing. The
application must abort and retry the whole transaction.

That is not a failure to hide. **Retry is part of the architecture**, not an
afterthought, and choosing stronger isolation means choosing to write that retry
path properly.

One more detail worth naming unprompted: if a transfer touches multiple wallet
rows, acquire those locks in a **deterministic order**, such as by wallet id.
Two concurrent transfers that lock opposite rows will otherwise wait on each
other. PostgreSQL detects the deadlock and aborts one, but the application still
has to handle that and retry.

## 3. The crash: one transaction

The critical financial changes belong inside **one** PostgreSQL transaction.

Validate the funds. Create the transfer. Record balanced ledger entries. Update
any balance projection that must stay consistent. Persist the idempotency
result. Then commit, once.

If the process dies before commit, none of it becomes committed state. A crash
cannot leave a committed sender movement without the matching receiver movement.

For two wallets inside the same consistency boundary, atomic commit is simpler
than inventing an intermediate reserved state. A hold earns its place only when
the second leg is **outside** your transaction, such as a bank payout that must
call an external provider and confirm later. Adding one here would add state
without solving a problem you have.

## 4. Proving it later: the ledger

A stored balance of $150 tells you the current state. It does not explain why
that state is correct.

In double entry accounting a journal entry contains debits and credits, and
total debits equal total credits. Debit and credit are **accounting directions**,
not synonyms for minus and plus. The account balance is derived from its entries.

So the senior question is not "what is the balance?" It is "which entries
produced that balance, and can I prove it?" A stored balance projection is fine
for fast reads, but only while it stays consistent with the authoritative
records. That distinction is what makes a ledger more than a balance table.

## The part after the database: two systems

The database commits the transfer, but other systems need an event.

Commit PostgreSQL first and crash before publishing, and the transfer exists
while the event never happened. Publish first and let the database roll back,
and the message describes a transfer that never committed. A normal database
transaction and a normal broker publish are not one atomic operation.

The classic approach to coordinating transactional resources is two phase commit.
XA defines how XA capable resources participate, and JTA, now Jakarta
Transactions, provides the Java coordination APIs. XA is not obsolete: an XA
capable relational database and an XA capable JMS provider really can participate
under a transaction manager.

But every resource has to support that model. Kafka's own design documentation
calls two phase commit the classic approach and then notes that many output
systems do not support it. Spring Kafka's `KafkaTransactionManager` cannot
provide one XA transaction spanning Kafka and a database, and Spring's chained
transaction managers were never XA atomic either. One manager could commit before
another failed. Those chained managers are deprecated.

### The transactional outbox

For a database and broker boundary, use an outbox.

The transfer, the ledger entries, the idempotency result and an **outbox record**
all commit in the same PostgreSQL transaction. A separate relay publishes
committed outbox records afterwards.

That closes the gap where money commits but no durable intent to publish exists.
It does **not** give exactly once publication. The relay can publish and then
crash before recording progress, so the event may be published again. Consumers
must still be idempotent.

Kafka producer idempotence is enabled by default only when no conflicting
settings disable it, and even then it is producer level protection, not end to
end exactly once delivery.

## What to measure when it is running

The first observability question is not CPU usage. It is whether the financial
invariants still hold.

A ledger imbalance is an incident. Track transfer outcomes, transfers stuck in
non terminal states and how long they have been stuck. For the outbox, the **age
of the oldest unpublished record** is usually more useful than the count. Track
retries, database contention, serialization failures and end to end latency.

Two traps worth naming:

- Prometheus summary quantiles cannot meaningfully be averaged across instances.
  Histograms expose buckets that aggregate first, so the percentile is calculated
  from the combined observations.
- Never put transfer ids or customer ids in ordinary metric labels. That creates
  unbounded cardinality. Metrics tell you something is wrong; logs and traces
  tell you what happened to one transfer.

## Sources

Every technical claim here is checked against primary documentation:
PostgreSQL on transaction isolation and row locking, Apache Kafka's design
documentation on two phase commit and its producer configuration reference, and
the Prometheus documentation on histograms and summaries.

The full architecture diagram and the verified reference list are in the
**Digital Wallet Design Sheet**, free and with no email required.

## Run it

Everything above is executable:

```bash
git clone https://github.com/code-with-sam-dev/digital-wallet
cd digital-wallet
docker compose up --build
```

Then watch the lost update happen, and then watch it not happen:

```bash
curl -X POST localhost:8080/demo/lost-update \
  -H 'Content-Type: application/json' -d '{"from":1,"to":2,"amountMinor":10000}'

curl -X POST localhost:8080/demo/safe-race \
  -H 'Content-Type: application/json' -d '{"from":1,"to":2,"amountMinor":10000}'
```

The broken path writes ledger entries exactly like the correct one. The only
differences are the row lock and writing a relative delta instead of an absolute
value calculated in application code, so the demonstration isolates one variable
rather than changing five things and claiming the difference proves something.

Prometheus and a provisioned Grafana dashboard come up with it, including the
alert that fires when the ledger stops balancing.
