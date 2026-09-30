---
title: 'Spring to NestJS with MongoDB and Mongoose: Debit Vanished'
cover: '/covers/sn-mongo.jpg'
description: 'Two debits of 30 and 50 from a balance of 100 left 50, on Spring Data MongoDB and on Mongoose. Measured on both stacks: optimistic concurrency, atomic updates, validation by write path, and why $inc needs its rule in the filter.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-15-mongo.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'mongodb']
series: 'Spring Boot to NestJS'
episode: 16
duration: '4:08'
youtube: 'lKsCpo70Z40'
draft: false
---

One account with a balance of 100, and two requests at the same time: one debits 30, the
other 50. The balance should be 20. It was 50, in Spring Data MongoDB and in Mongoose, and
both saves reported success. Measured on 30 September 2026 on MongoDB 8.3.11, Mongoose
9.10.3 and Spring Boot 4.1.1.

## Changing frameworks did not remove the race

Both requests loaded the account while it said 100, and each saved its own result. Mongoose
documents carry a `__v` field, and it did not stop this. Two different tools fix it:

- **Detect stale state.** `@Version` in Spring, `optimisticConcurrency: true` on a Mongoose
  schema. The second save failed on both stacks and the balance stayed at 70.
- **Avoid the read-modify-write.** An atomic `$inc`: both debits landed, balance 20.

## Validation belongs to the write path

With `@Min(0)` on the balance, Spring Data MongoDB saved -500 until `ValidatingEntityCallback`
was registered; then the save was rejected. Mongoose rejected -500 on `save()`, stored it
through `updateOne()`, and rejected it again with `runValidators: true`. A direct update went
past the rule on both stacks.

## Put the rule in the filter

Mongoose update validators do not run on `$inc`. With validators switched on, taking 500 from
a balance of 100 left -400. Making the rule part of the match,
`updateOne({ _id, balance: { $gte: 500 } }, { $inc: { balance: -500 } })`, matched nothing and
kept the balance at 100.

The full code for every measurement is in the repository, and the free design sheet above
has the checklist on one page.
