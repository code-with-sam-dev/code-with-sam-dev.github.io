---
title: 'Spring Boot to NestJS: Everything That Transfers'
youtube: '9N3f6yvxE3w'
duration: '21:52'
cover: '/covers/sn-flagship.jpg'
description: 'One payment system, built twice, on one docker compose file. Most of what a Spring developer knows transfers exactly, some of it transfers with different wiring, and nine things do not transfer at all. Every number here was measured, not estimated.'
pubDate: 2026-09-19
sheet: '/downloads/spring-to-nestjs-transfer.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
video: 'https://youtu.be/9N3f6yvxE3w'
tags: ['nestjs', 'typescript', 'nodejs', 'spring-boot', 'java', 'postgresql']
series: 'Spring Boot to NestJS'
episode: 0
draft: false
---

Fifty concurrent retries of one idempotency key. Fifty payments created. Not a
design flaw in either framework, and not a contrived example: it is what
happened on the machine, on both stacks, before anything guarded it.

This is the flagship for the course, and it exists to answer one question
before you spend six months finding out the hard way. **How much of what you
know about Spring Boot survives the move to NestJS?**

The short answer is most of it. The useful answer is the list of what does not.

Everything below was run on 19 September 2026 on one docker compose file with
both applications in it, and every figure is reproducible from the repository.
Where a number contradicted what the plan assumed, the measured number is the
one printed: the opening race was drafted at seven duplicate payments and the
machine produced fifty.

## The shape of the answer

Three columns, and only the third one costs money.

| Transfers exactly | Same job, different machinery | Does not transfer |
| --- | --- | --- |
| Controllers and routing | Modules, not component scanning | Interfaces do not exist at runtime |
| Services as a boundary | A global pipe, not `@Valid` | Nominal typing |
| Constructor injection | A repository, not a derived one | `readonly` is compile time only |
| Request object separate from domain | Promises, not futures | A declared field type enforces nothing |
| Validation annotations | Unknown fields rejected, not ignored | A `bigint` comes back as a string |
| Entity mapping | A 400 naming every broken rule | An entity is not managed |
| Migrations in version control | Explicit context propagation | `@Transactional` has no equivalent |
| Invariants in the database | File-path imports | `ThreadLocal` request context |
| | | An executable jar |

The encouraging half is also the true half. Your judgement about where a
boundary belongs, what deserves a transaction, and which invariant belongs in
the database transfers completely. What changes is the wiring.

## The annotation is not the enforcement

A TypeScript field declared as a number is not a number at runtime. The
compiler erases the annotation, and nothing checks what arrives on the wire.

Send an empty body to an endpoint with three required fields and you get
`201 Created` and a payment with no amount.

Spring appears to do better here, and the reason is worth knowing precisely,
because it is not the one most people give. It is **Jackson binding the request
before your code runs**, not the type system. Send a quoted string where a
number belongs and Spring hands your service a `Long`. Nest hands your service
the string, still quoted, now sitting inside your domain pretending to be a
number.

Take Jackson out of Spring and Spring behaves exactly like the right hand lane.

The fix is two things and you need both:

```ts
export class CreatePaymentRequest {
  @IsInt({ message: 'amountInMinorUnits must be an integer number of minor units' })
  @Min(1, { message: 'amountInMinorUnits must be at least 1' })
  amountInMinorUnits!: number;

  @IsIn(['USD', 'EUR', 'GBP', 'ZAR'], { message: 'currency must be a supported ISO code' })
  currency!: string;

  @IsString()
  @IsNotEmpty({ message: 'idempotencyKey is required' })
  idempotencyKey!: string;
}
```

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // strip properties the class did not declare
    forbidNonWhitelisted: true, // and reject the request if one appears
    transform: true,            // make it a real instance, so the decorators run
  }),
);
```

`transform` is the flag people leave off. Without it the decorators are
attached to a class nothing ever constructs, so they never run, and the
validation you can see in the file is doing nothing at all.

Note also what this buys you that Spring's default does not: `whitelist` plus
`forbidNonWhitelisted` **rejects** an undeclared field rather than quietly
ignoring it. That is the better default and it is worth keeping.

## Why there is a race in a single threaded runtime

This is the part that catches Spring developers hardest, because the instinct
is exactly backwards.

JavaScript is single threaded, so how is there a race at all?

Because single threaded does not mean uninterrupted. **Every `await` is a point
at which the runtime is free to start work on another request.** Two requests
both look up the key. Both awaits yield. Both find nothing. Both insert. The
thread never ran two things at once and you still have two rows.

Races in Node happen across awaits, and across processes, and across pods, and
no amount of single threadedness protects you from any of them.

So the lookup is an optimisation for the common retry, and the constraint is
the guarantee:

```ts
// The lookup is an optimisation. The constraint is the guarantee.
const existing = await this.payments.findOne({
  where: { idempotencyKey: request.idempotencyKey },
});
if (existing) return toPayment(existing);

try {
  return toPayment(await this.payments.save(entity));
} catch (error) {
  // 23505 is Postgres for unique_violation. Losing this race is normal.
  if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
    const winner = await this.payments.findOne({
      where: { idempotencyKey: request.idempotencyKey },
    });
    if (winner) return toPayment(winner);
    throw new ConflictException('Duplicate idempotency key');
  }
  throw error;
}
```

Losing that race is the **normal** outcome, not an error. The other request
already created the payment, so return it.

### The constraint that would not deploy

Every tutorial adds a unique constraint to an empty table. Here is what
actually happens when you add one to a table that has been running without it:

```
ALTER TABLE payments
  ADD CONSTRAINT uq_payments_idempotency_key UNIQUE (idempotency_key);

ERROR:  could not create unique index "uq_payments_idempotency_key"
DETAIL: Key (idempotency_key)=(race-1789810120168) is duplicated.
```

Forty nine rows had to be deleted before it would deploy. That is the argument
for putting the constraint in on day one rather than on the day you need it.

Then the identical command from the opening, unchanged: one payment.

## Five defects, five layers of tests, every combination run

Rather than argue about which tests are worth writing, five defects were
injected and every layer was run against every one of them.

| Defect | domain | wiring | contract | integration | concurrency |
| --- | --- | --- | --- | --- | --- |
| provider missing from module | pass | pass | pass | FAIL | FAIL |
| validation decorators removed | pass | pass | FAIL | FAIL | FAIL |
| wrong database column name | pass | pass | pass | pass | pass |
| unique constraint removed | pass | pass | pass | pass | pass |
| idempotency lookup removed | pass | pass | pass | pass | pass |

Three of five were invisible to every layer.

This is not an argument for more tests. It is an argument for knowing what each
layer can see. **Constraints and migrations are not testable properties of your
code. They are properties of the database.** A test suite cannot tell you that
a constraint you never wrote is missing.

The last row passes *correctly*, incidentally: with the constraint in place,
removing the lookup costs you a round trip and nothing else. The guarantee was
never in the lookup.

And a concurrency test needs enough concurrency. At ten requests the suite went
green while the invariant was already broken. At fifty it failed.

## The container that takes ten seconds to die

Send the container a termination signal and watch the uptime go **up**.

That is not a NestJS bug. It is three correct things meeting:

1. The image runs `node` directly, so node is process one.
2. On Linux, process one gets no default signal handling. A signal with no
   explicit handler is ignored rather than acted on.
3. Node installs no default handler for termination, because normally it is not
   process one.

So the signal lands nowhere, the orchestrator waits out the grace period, and
then kills the process outright. No draining, no closing the database pool, and
ten seconds added to every deploy.

Two fixes, and you need both:

```yaml
services:
  nestjs-api:
    init: true          # a real init at PID 1, so the signal is delivered
```

```ts
app.enableShutdownHooks();   // so something meaningful happens when it arrives
```

One decides whether the signal arrives. The other decides what happens when it
does. Either alone leaves the container dying by force.

## What actually protected the payment

Not the framework, and not the type system.

Runtime validation at the boundary. A transaction around the write. A unique
constraint in the database, which is the only thing that held under fifty at
once. And a test with enough concurrency to catch the race.

NestJS helped organise the code and TypeScript helped change it safely. Neither
one enforced anything at runtime, and once you stop expecting them to, the rest
of your judgement transfers intact.

## Run it yourself

Everything in this article is in one repository, runnable end to end:

```
git clone https://github.com/code-with-sam-dev/spring-to-node
cd spring-to-node
cp .env.example .env
docker compose up -d
```

Then the scripts that produce each figure:

| Script | What it demonstrates |
| --- | --- |
| `scripts/verify-validation.sh` | the empty body that returns 201 |
| `scripts/verify-persistence.sh` | the row that survives a restart |
| `scripts/verify-shutdown.sh` | SIGTERM with and without an init process |
| `scripts/verify-defect-matrix.sh` | five defects against five test layers |
| `load/idempotency-load.mjs` | fifty concurrent retries of one key |
| `load/blocking-load.mjs` | the event loop under a blocking handler |

Versions at the time of writing, September 2026: Java 25 LTS, Spring Boot 4.1.1, Node 24.21.0, NestJS 12.0.3, TypeScript 6.0.3, TypeORM 1.1.1, PostgreSQL 18.

Every row in that transfer table has its own episode in the full series, forty
of them, from installing Node through to running this in production. If a
column in the table made you uncomfortable, that is the one to start with.
