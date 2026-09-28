---
title: "Database Scaling, Measured: What to Fix Before You Shard"
youtube: '7q42Crma6GE'
duration: '12:30'
cover: '/covers/database-scaling.jpg'
description: 'Ten million orders and one slow query. The index, a read replica, a Redis cache, partitions and sharding, each measured in turn: what it buys, and the bill it sends.'
pubDate: 2026-09-28
sheet: '/downloads/database-scaling-measured.pdf'
repo: 'https://github.com/code-with-sam-dev/database-scaling-measured'
video: 'https://youtu.be/7q42Crma6GE'
tags: ['postgres', 'redis', 'spring-boot', 'system-design']
draft: false
---

Ten million orders. One customer wants their pending orders, newest first, and
the query takes about a fifth of a second every time on a database with nothing
else to do.

A bigger server, Redis, a read replica, partitions and sharding are all on the
table. The question that comes before any of them is where the bottleneck is,
so this build measures each one in turn.

## What was measured

PostgreSQL 17.11 with a streaming replica, Redis 7.4.11, Spring Boot 4.1.1 and
Java 25 (at the time of recording, September 2026), on one machine.

| Technique | What was measured |
| --- | --- |
| **The plan** | No index: a parallel sequential scan, 214.49 ms median, to return one row |
| **The index** | `(customer_id, status, created_at)`: 0.06 ms. The same columns with `created_at` first: 386 MB, unused, 220.73 ms |
| **The write bill** | 100,000 inserts: 107.5 ms with no secondary index, 358.4 ms with one, 829.5 ms with three |
| **Read replica** | Lag 0 idle, 824 ms worst sample under a 2,000,000 row update. With replay paused on purpose: primary PAID, replica PENDING |
| **Routing** | A read-your-writes request served by the primary; the plain read by the replica |
| **Cache stampede** | 500 callers, two instances, one expired key, ten runs: 500 loads, 2 with in-process single flight, 1 through Redis |
| **Partitions** | With the partition key 0.07 ms, without 0.25 ms. One month of 822,079 rows: DELETE 305 ms, DROP partition 1.1 ms |
| **Resharding** | Four shards to five, a million keys: modulo moved 80.02%, a ring with 200 virtual nodes 19.93% |

## The two details that bit

The Redis single flight loaded twice in some runs until the lock winner
re-checked the cache after taking the lock: the previous winner can fill the
cache and release the lock between a request's miss and its lock. The lock is
also released by a small Lua script that deletes it only if the token still
matches, so an expired lock cannot be released by the wrong request.

A consistent hash ring with one point per shard moved only 23.55% of keys, but
left the shards holding between 5% and 27.7% of the data. Virtual nodes are what
make it both cheap to reshard and balanced.

## The decision

A selective query reading a huge table: fix the query and the index. Reads that
can tolerate a moment of staleness: a replica, with routing for the ones that
cannot. The same expensive read over and over: a cache, with single flight for
when it expires. Data that splits by time: partitions. One database that cannot
carry the writes or the data: then shards.

Not measured here: write throughput across real shards, cross-shard queries and
transactions, and production hardware. Every command, plan and number is in the
repository, with `scripts/verify.sh` to rerun it from an empty machine. The free
design sheet above has the code for each step.
