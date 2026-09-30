---
title: 'Spring to NestJS TypeORM Relations and Migrations: N+1, or Nothing'
cover: '/covers/sn-relations.jpg'
description: 'The same loop over 20 orders: Spring counted 60 lines in 21 queries, TypeORM made one query and counted zero. Measured on both stacks, with paging a one-to-many, and generated migrations run on real rows.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-13-relations.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 14
duration: '4:18'
youtube: '8kypbLtu6S8'
draft: false
---

Twenty orders with three lines each, and a loop that adds up every order's lines without
asking for them first. Spring counted 60 lines and needed 21 queries: the N+1 problem.
TypeORM made one query and counted 0, because `order.lines` was never loaded. No error.
Measured on 30 September 2026 on TypeORM 1.1.1, Spring Boot 4.1.1 with Hibernate 7.4.5 and
Postgres 18.

## Same relation, opposite default

The mapping transfers: `@OneToMany` on the order, `@ManyToOne` on the line, and the
many-to-one side owns the foreign key on both stacks. What differs is the default. JPA gives
you a lazy managed collection that loads when you touch it. This TypeORM mapping leaves the
property unloaded unless you ask (TypeORM can do lazy relations with Promise types; that is
not this mapping). One risks accidental queries, the other accidental absence.

Asking up front works on both: a join fetch in Spring, `relations: { lines: true }` in
TypeORM. For this one-to-many, one query each, all 60 lines.

## Page the parents, not the rows

Twenty orders times three lines is 60 joined rows. A plain `LIMIT 5 OFFSET 5` on the join
returned five rows from three orders, two of them partial. TypeORM paged the parents first:
two queries, ORD-6 to ORD-10 with their 15 lines. Spring's documented ways (a `Page`
result, a sort in the `Pageable`, an entity graph) returned the same five.

## A generated migration is a diff

TypeORM compared the entities with the live schema. A rename became `RENAME COLUMN` and kept
the values. A change from varchar to integer became `DROP COLUMN` then `ADD COLUMN`. Run on
rows holding "123" and "abc": on a NOT NULL column Postgres refused it and it rolled back;
on a nullable column it ran and every value became null, including "123". A hand-written
`ALTER ... TYPE integer USING` cast refused "abc" and kept everything. Read a generated
migration before you run it.

The full code for every measurement is in the repository, and the free design sheet above
has the checklist on one page.
