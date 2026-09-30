---
title: 'Spring to NestJS Transactions and Idempotency: Debit, No Credit'
cover: '/covers/sn-transactions.jpg'
description: 'A TypeORM transaction rolled back and the debit survived. Measured on both stacks: what actually joins a transaction, the idempotency race, the unique constraint, and an outbox event for a payment that never existed.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-14-transactions.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 15
duration: '4:40'
draft: true
---

A debit and a credit inside a TypeORM transaction, then an error. The transaction rolled
back, and the debit was still in the table. Measured on 30 September 2026 on TypeORM 1.1.1,
Spring Boot 4.1.1 and Postgres 18.

## What actually joins the transaction

In TypeORM, `ds.transaction(async (m) => ...)` hands the callback a manager, and that
manager is the transaction. The debit went through the injected repository, which belongs
to the DataSource: it committed on its own. The credit went through `m` and rolled back.
Taking the repository from the manager, `m.getRepository(LedgerEntry)`, left 0 rows.

In Spring the injected repositories do join the surrounding transaction. The trap is a
`@Transactional` method called through `this`: the call never crosses the proxy, so there is
no transaction to join. Both rows survived.

## A check is not a constraint

Ten concurrent requests with the same idempotency key, each checking before it inserts:
both stacks created duplicates, and the count changed from run to run. A unique constraint
on the key allowed at most one row. Catching the unique violation after the failed insert
rolled back and returning the existing payment gave all ten callers the same payment id.
Catching it inside the same transaction does not work: Postgres answered the lookup with
25P02, and Spring failed in Hibernate's session.

Two more measurements are in the design sheet: the same key with a different amount got a
409 conflict rather than a replay, and SERIALIZABLE isolation also kept one row, as nine
serialization failures that had to be retried.

## The outbox

The payment and its event in one transaction: commit gives 1 and 1, failure gives 0 and 0.
Save the event through the injected repository and fail, and you get payment 0, outbox 1,
an event for a payment that never existed.

The full code for every measurement is in the repository, and the free design sheet above
has the checklist on one page.
