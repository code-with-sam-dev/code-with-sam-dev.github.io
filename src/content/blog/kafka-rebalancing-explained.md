---
title: 'Kafka Rebalancing Explained: The Failure That Looks Random'
description: 'Every consumer reports healthy, the dashboard is green, and the lag climbs anyway. Here is what a rebalance actually moves, why a slow consumer gets evicted for being slow rather than dead, and where the duplicate comes from.'
pubDate: 2026-09-12
youtube: 'VKOBY2vv1K0'
repo: 'https://github.com/code-with-sam-dev/kafka-payments'
sheet: '/downloads/kafka-rebalancing-design-sheet.pdf'
tags: ['kafka', 'interviews']
series: 'Kafka Payments'
episode: 3
cover: '/covers/kafka-rebalancing.jpg'
duration: '10:02'
terminal:
  path: 'kafka-payments / episode-03-rebalancing'
  lines:
    - '$ kafka-consumer-groups --describe --group payments'
    - ''
    - '  CONSUMER   STATE   PARTITION   LAG'
    - '  c-1        UP      payments-0   16,204'
    - '  c-2        UP      payments-1   16,355'
    - '  c-3        UP      payments-2   16,353'
    - ''
    - '# Nothing crashed. Nothing is being consumed.'
---

Every consumer in the group reports healthy. The dashboard is green. And the
lag behind them climbs anyway.

Nothing crashed, so nothing points at a cause. That is what makes a rebalance
the Kafka failure that looks random: the system is not broken, it is busy
rearranging itself, and while it does that nobody is doing any work.

## What actually gets rebalanced

Not the data. Not the topic. Not the offsets.

A rebalance moves **partition assignments between the members of one consumer
group**. Partition 0 was being read by consumer A; after the rebalance it is
being read by consumer B. The messages did not move. The commits did not move.
Only the question of who is responsible for which partition.

That is the whole mechanism, and almost every confusing symptom follows from
it.

## What triggers one

Four things, and only one of them is a failure:

- **A member joins.** You scaled up, or a pod restarted.
- **A member leaves.** Cleanly, by calling close, or by dying.
- **A member is declared dead.** It stopped heartbeating within
  `session.timeout.ms`.
- **A member is declared too slow.** It did not call `poll()` again within
  `max.poll.interval.ms`.

A deploy triggers rebalances. Autoscaling triggers rebalances. These are normal
and expected, which is exactly why the lag spike that comes with them gets
dismissed as noise.

## The distinction that explains most incidents

`max.poll.interval.ms` is not a heartbeat.

Since Kafka 0.10.1 the heartbeat runs on its own background thread. Your
consumer can be heartbeating perfectly, on time, every time, while the thread
that actually processes messages is stuck inside one slow batch. The group
coordinator sees the heartbeats and knows the process is alive. It also sees
that `poll()` has not been called in far too long, and evicts the member
anyway.

So the consumer is not thrown out for being **dead**. It is thrown out for
being **slow**. And the log line you get says the member left the group, which
reads exactly like a crash and is not one.

This is why the fix is so often "do less work per poll" rather than "raise the
timeout". Lower `max.poll.records`, move the slow call off the poll thread, or
make the processing faster. Raising the timeout hides the symptom and lengthens
the outage on the day the consumer really does die.

## Where the duplicate comes from

Follow the sequence.

A consumer reads a batch. It processes the batch. Before it commits, it gets
evicted, for either of the reasons above. The partition is reassigned. The new
owner starts from the last committed offset, which is **before** that batch.

It processes the batch again.

The duplicate is not a bug in Kafka and it is not a race condition you can tune
away. It is the direct consequence of at-least-once delivery plus a reassignment
between processing and committing. The only real defence is that the work is
idempotent, which is the same conclusion the payments episode reaches by a
different road.

## Why the old protocol stopped the world

Under the classic protocol, a rebalance is a global synchronisation barrier.
Every member revokes everything it owns, everyone rejoins, the leader computes
a new assignment, and only then does anyone resume. Stop the world, redistribute,
start again.

With a handful of consumers this is a blip. With a large group and a slow
assignor it is an outage, and it happens every time you deploy.

Cooperative sticky assignment softened this by revoking only the partitions that
actually change hands. It helped, and it was still built on the same
join-and-sync round trip.

## What changed in Kafka 4.0

Kafka 4.0 made the new consumer rebalance protocol generally available, and it
removes the barrier rather than working around it. In Kafka's own words, it
"decreases rebalance times, thanks to its fully incremental design, which no
longer relies on a global synchronization barrier."

The coordination also moves. Heartbeating, session timeouts and assignment
become the broker's job instead of a negotiation between clients.

One detail worth getting right, because anyone running a 4.x broker will
correct you otherwise: **server side, the new protocol is enabled by default.
It is the client that must opt in**, with `group.protocol=consumer`. Saying
flatly that it is off by default is wrong in a way that is easy to check.

Two familiar settings stop applying under it. `heartbeat.interval.ms` and
`session.timeout.ms` are, in Kafka's words, no longer used by the consumer,
because the broker now owns those decisions.

And the classic protocol is on a deprecation path, which turns "which protocol
are we using?" from trivia into a migration question with a date attached.

## Static membership, and when it actually helps

Give a consumer a stable `group.instance.id` and the group stops treating a
restart as a departure. Within `session.timeout.ms`, the same instance comes
back and picks up the same partitions, with no reassignment at all.

This is the right tool for **rolling deploys of a fixed set of pods**, where the
membership is genuinely the same before and after.

It is the wrong tool for **autoscaling**, where membership really is changing
and pretending otherwise just delays the inevitable rebalance. It also has a
real cost: if an instance dies for good, its partitions sit unowned until the
session timeout expires, so you are trading a faster deploy for a slower
recovery.

## What to monitor

Consumer lag alone will not tell you this story. Lag rises during a rebalance
and falls afterwards, which looks like ordinary traffic variation.

Watch instead:

- **Rebalance rate.** How often, and does it spike with deploys?
- **Rebalance latency.** How long the group is not working.
- **Time between polls**, against your `max.poll.interval.ms`.
- **Commit failures**, which are the signature of committing after eviction.

A rebalance rate that is flat and low is a healthy group. One that climbs with
traffic means you are being evicted for slowness, and no amount of scaling up
will fix it, because every new member triggers another rebalance.

## The interview answer

If you are asked about rebalancing, the shape that lands is:

A rebalance redistributes partitions among the members of a consumer group. It
is triggered by membership change, by a missed heartbeat, or by exceeding the
max poll interval. The last of those is the one that bites, because a consumer
can be perfectly alive and still be evicted for taking too long inside poll, and
the resulting reassignment reprocesses anything that was handled but not yet
committed. Kafka 4.0's new protocol removes the global synchronisation barrier
that made this a stop-the-world event, though the client has to opt in to it.

Then say what you would do about it: make the processing idempotent, keep the
poll loop short, and watch the rebalance rate rather than the lag.

---

Checked against Apache Kafka's own documentation on 2026-09-12, against Kafka
4.3, before the episode was recorded.
