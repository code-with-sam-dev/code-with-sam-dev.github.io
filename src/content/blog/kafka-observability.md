---
title: 'Kafka Observability: What Should You Actually Watch?'
description: 'Every service is green and payments are twenty minutes late. No single metric tells you where the system is broken, and the layer most teams build is the least useful one.'
youtube: 'i4drWVqZNgQ'
cover: '/covers/kafka-observability.jpg'
pubDate: 2026-09-13
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-observability-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 8
duration: '11:44'
draft: false
terminal:
  path: 'kafka-payments / episode-08-observability'
  lines:
    - '$ curl localhost:8080/actuator/health'
    - ''
    - '  API   UP     QUEUE UP     DB UP'
    - ''
    - '  payments late by  4.2 s'
---

Every service says healthy. Postgres is reachable. Kafka is reachable. The
consumers are running.

And payments are arriving twenty minutes late.

Which metric tells you where this system is actually broken?

## Three layers, and teams usually build one

**Infrastructure**: brokers, disks, connections. Is Kafka alive?

**Pipeline**: lag, rebalances, retries. Is work flowing?

**Business**: are payments completing, and completing correctly?

A green first layer says nothing about the third. The outage above lives
entirely in the layers nobody built.

## Lag is one number for two different stories

Consumer lag tells you how far consumer progress is behind the latest available
records. That is genuinely useful and it is not sufficient.

Lag climbing because consumers are slow, and lag climbing because producers
surged, look identical. One needs investigation and one may be completely fine.

Worse, lag says nothing about whether the business outcome was correct.

## Count and age answer different questions

A backlog of ten thousand records that clears in two seconds is harmless. A
backlog of ten records that has been sitting there for two hours is an
incident.

**Count** tells you how many. **Age** tells you how long. For payments, age is
the one a customer actually feels, and it is the one most dashboards omit.

## The signal nobody builds

Lag is zero. Every event processed immediately. Every broker metric normal.

And once a day, one transfer creates an unbalanced financial journal.

That is not a health problem, it is a **correctness** problem, and no
infrastructure metric will ever see it. This is the argument of the whole
episode: teams build the layer that is easy to build and then wonder why it
never catches anything.

## Retries are their own traffic class

Counting retries with normal traffic hides both. Watch them separately: how
many are retrying now, which failure type dominates, how old the oldest retry
is, and how fast the dead letter topic is growing.

A retry system with no signals fails silently, which is the worst way for it to
fail.

## Rebalances should be visible

A lag spike at 14:02 that recovers by 14:05 looks like a traffic anomaly. It
was a deploy, and a rebalance, and then catch up.

Without rebalance rate on the same dashboard, every deploy looks like a
mystery.

## The one that is invisible

The application is healthy. Postgres is healthy. Kafka is healthy. The outbox
publisher has been stopped for six hours.

Everything is green and nothing is being delivered. **Alert on the age of the
oldest unpublished row.** Nothing else will tell you.

## Percentiles, and two things that are quietly wrong everywhere

Ninety nine payments finish in 100 ms. One takes ten seconds. The average is
199 ms and says everything is fine.

The usual next line is "and the p99 shows it". **It does not.** The p99 sits at
the ninety-ninth of a hundred sorted observations, and the slow one is the
hundredth. To see a one-in-a-hundred event you need p99.9, or the maximum.
Choose the percentile for the frequency of the thing you care about, not for
how senior the number sounds.

And a subtler one: if three instances each compute their own p95, **averaging
those three does not give you the system-wide p95**. The maths does not work
that way and the error is not small. Aggregate the underlying observations.

## Never put a payment id in a metric label

```
# One time series per payment. Forever.
payments_total{payment_id="p-84719283"}

# A bounded set of values is what a label is for.
payments_total{result="success"}
payments_total{result="retry"}
payments_total{result="dead_letter"}
```

High cardinality labels do not degrade gracefully. When you need to follow one
payment, that is what a trace is for.

## The test an alert must pass

If nobody would do anything about it, it is not an alert. Would it still fire
during a normal deploy? If it fires at 3am, is that justified? Alerts nobody
acts on train people to ignore the ones that matter.

## The answer

No single metric told us where the system was broken. Lag age, rebalance rate,
retry depth and outbox age each told one true part of it.

The first dashboard, in order: lag age per group, rebalance rate, retry depth
and DLT growth, oldest unpublished outbox row, and payments completed with a
p99. Five panels, not fifty. A dashboard nobody reads is worse than no
dashboard, because it looks like coverage.
