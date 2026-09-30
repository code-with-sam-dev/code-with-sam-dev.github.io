---
title: 'Spring to NestJS TypeORM Entities and Repositories: Changed, Not Saved'
cover: '/covers/sn-typeorm.jpg'
description: 'Load an entity, change a field, commit, and never call save. Hibernate writes it; TypeORM writes nothing. Measured on both stacks, with save() against update(), a 64 bit value that loses its last digit, and a TypeORM default that changed between major versions.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-12-typeorm.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 13
duration: '4:47'
draft: true
---

Load an account, change the owner, commit the transaction, and never call save. In
Spring with Hibernate the row changed. In NestJS with TypeORM the same steps wrote nothing.
Measured on 30 September 2026 on Node 22, TypeORM 1.1.1, Spring Boot 4.1.1 and Postgres 18.

## The mapping transfers

`@Entity` stays `@Entity`, `@Id` with a generated value becomes `@PrimaryGeneratedColumn`,
`@Column` stays `@Column`. A TypeORM `Repository` is an `EntityManager` scoped to one entity
type, much as a `JpaRepository` wraps one.

## The lifecycle does not

A JPA entity loaded inside a transaction is managed: Hibernate tracks it and writes what
changed at flush. A TypeORM entity is an ordinary object; nothing is watching it. JPA tracks
managed entities. TypeORM persists when you ask.

## Two ways to ask

`save(entity)` re-read the row, opened a transaction, sent the UPDATE and ran the
`@BeforeUpdate` listener once. `update(id, partial)` sent a single UPDATE, and the listener
did not run. Use `save()` when the listener must run.

## A Long is not a number

A Postgres `bigint` came back from TypeORM as the string `"9007199254740993"`, because the
driver returns 64 bit integers as text. `Number()` of it gave `9007199254740992`;
`BigInt()` kept it exact. Java's `Long` was exact.

## Check the version, and keep synchronize for development

`findOneBy({ id: undefined })` returned the first row on TypeORM 0.3.30 and throws on 1.1.1;
the default changed in 1.0.0. A property rename under `synchronize` became a `RENAME COLUMN`
and kept the data here, but one case proves nothing, and TypeORM's own documentation says
not to use `synchronize` in production. Migrations are the next episode.

The full code for every measurement is in the repository, and the free design sheet above
has the mapping and the checklist on one page.
