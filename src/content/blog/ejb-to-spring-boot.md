---
title: 'EJB to Spring Boot: Interface Compatibility Is Not Semantic Compatibility'
description: 'The method signature is identical byte for byte and the contract has still changed. A remote enterprise bean call carried the caller transaction, an HTTP hop does not, and nothing anywhere tells you. The incremental method, drawn.'
pubDate: 2026-09-16
youtube: 'Ug5eZMkIZeo'
tags: ['java', 'spring', 'ejb', 'architecture', 'migration', 'interviews']
cover: '/covers/ejb-to-spring.jpg'
duration: '18:14'
draft: false
---

There is a meeting that happens in a lot of companies, and it always ends the
same way. Everyone agrees the old Java enterprise services have to go. Releases
take weeks. The knowledge sits with a handful of people. Hiring anyone who wants
to work on that stack gets harder every year.

So somebody puts up a plan: eighteen months, a full rewrite, and on some future
Friday we switch. And nobody signs it.

Not because they disagree. Because nobody in that room can tell you what the
system looks like in month nine.

## The question the plan never answers

What does the intermediate state actually look like? Not the before picture, not
the after picture, the long middle where half of it is old and half of it is new
and the business still needs features shipped on both.

If you cannot draw that, you do not have a migration plan. You have a wish.

## Characterisation before architecture

Before you decide anything about structure, answer a different question: **what
exactly are we promising not to change?**

A legacy service is not defined by its interface. It is defined by its
behaviour, including the behaviour nobody intended. Here is a real corpus from
the companion code:

| The input | What you would assume | What it actually does |
|---|---|---|
| `excessCents` is null | zero | the scheme default |
| `schemeCode` is `"fleet"` | rejected, or normalised upstream | upper cased and accepted |
| `schemeCode` is `"NOPE"` | fails validation | quietly becomes the standard scheme |

None of that is in a specification. All of it is load bearing.

So you write characterisation tests. Not tests of what the code should do. Tests
of what it does do, right now, including the parts you think are bugs. Pin the
behaviour first and argue about whether it is correct afterwards, because the
moment you change behaviour and architecture in the same step you have lost the
ability to tell which one broke it.

## The dependency that is not in the code

Characterisation tests capture what is in the system. They cannot capture what
is in somebody's head.

The developer who has supported that service for nine years knows why the scheme
code was never normalised, which branch has not run since a particular Tuesday,
and what the finance team actually meant by that field. None of it is in the
repository.

That makes those people an input to the work rather than an obstacle to it, and
it has a consequence most migration plans skip: **the exchange has to run both
ways.** Ask a team to hand over the one thing that makes them necessary and give
nothing back, and you have not made an agreement, you have made a request nobody
should accept.

The format that delivers the return leg is not a slide deck about hexagonal
architecture. It is a session, once a week, where one small service is converted
end to end while everybody watches and asks questions. A real service, chosen
because it is small, taken all the way.

And it is not a culture point, it is a question about where the risk sits. If
only three people can ship to the new infrastructure, every feature the business
wants queues behind those three. That queue appears on no architecture diagram.
Count how many people can take a feature to production on the new stack without
help, and watch whether that number climbs.

## A domain that knows nothing

Take one service. Not the most important one, and not the one everybody
complains about. The one with the fewest callers, because your first attempt is
where you will make your worst mistakes and you want them cheap.

The test for whether you have actually extracted a domain is not whether the
packages look right. It is the import list:

```java
package dev.codewithsam.domain;

import java.time.LocalDate;
import java.time.Month;

public class PremiumCalculator {
```

Two imports, both from the Java time library. No container, no annotations, no
framework, nothing to start. That means the pricing rules run in an ordinary
unit test that finishes in milliseconds.

That is the prize. Not elegance. The ability to change a rule and know within a
second whether you broke it.

## The rule that holds the line

Boundaries decay. Somebody imports a framework annotation into the domain
because it was the fastest way to finish a ticket, and it passes review because
it is one line and everything still works.

Defend the boundary with a test rather than with good intentions:

```java
ArchRule rule = noClasses()
    .that().resideInAPackage("..domain..")
    .should().dependOnClassesThat().resideInAnyPackage(
        "org.springframework..", "jakarta..", "javax..",
        "org.hibernate..", "com.fasterxml.jackson..")
    .because("the test for a real hexagon is that the domain can be "
        + "instantiated and asserted on with no container, no HTTP, no "
        + "Spring context and no database. One import breaks that");
```

It runs in your normal build and names the exact class that broke the rule. A
rule that is not executable is a preference, and preferences lose to deadlines.

## The adapter behind the old contract

You do not control the callers. There are more of them than you think and
several are scheduled jobs nobody has opened in years. So leave the old contract
exactly where it is: the remote interface, the method signatures, the package
name. What changes is what sits behind it.

The old bean's body is emptied out and replaced with an adapter whose only job
is translation. That pattern has a name, strangler fig with an anti corruption
layer, and anybody claiming to have invented it is selling something.

What is worth noticing is **where** you intercept. The textbook diagram puts a
router in front of the caller. This one puts the adapter behind the existing
contract, inside the callee, which is what you do when the callers are not yours
to touch.

## And here is the part that breaks production

Interface compatibility is not semantic compatibility.

Picture the call that actually exists in these systems. Service A starts a
transaction, writes a row, calls remote bean B, which writes another row, and A
commits once. Both writes land or neither does. Jakarta Enterprise Beans is
explicit about why:

> If a client invokes an enterprise bean's method while the client is associated
> with a transaction context, the container invokes the enterprise bean's method
> in the client's transaction context.

The transaction followed the call. That is not a framework convenience, it is
the contract.

Now replace the inside of B with a call over HTTP. The Java signature has not
moved. But Jakarta Transactions says propagating a transaction context is
protocol dependent, and that the format has to be negotiated between the client
and the server hosts:

> Transaction context propagation between application programs is provided by
> the underlying transaction manager implementations on the client and server
> machines. The transaction context format used for propagation is protocol
> dependent and must be negotiated between the client and server hosts.

A plain HTTP request negotiates no such thing. So the transaction does not
follow the call any more.

The companion code proves it with two tests that make the same call:

| | The bean | The adapter |
|---|---|---|
| Caller rolls back | the quote is gone | the quote is still there |
| Return value | identical | identical |

**Identical answers. That is what makes it dangerous.** Every test of the return
value passes.

## Name the subset out loud

"The caller does not change" is true for a subset, and you have to say which.

| The call shape | Still true? |
|---|---|
| It was already a read | yes |
| It was the only write in its own transaction | yes |
| It was part of the caller's transaction | no, and it breaks silently |
| It relied on the container carrying caller identity | no, your HTTP hop must be told to |
| It passed objects across a remote interface | no. Pass by value, and everything must be serializable |
| It threw one specific exception | no. There is a network in the middle now |

That last group is the permanent tax. You do not pay it once. You acquire it,
for as long as the boundary exists.

## And sometimes you should not do it

A video that only tells you to migrate is an advert.

If the service is genuinely stable, if nobody is asking for features in it, if
the people who understand it are still around and content, the correct
engineering decision may be to leave it exactly where it is. Legacy is not a
moral failing. It is a system that works and that you have stopped investing in.

The three reasons that usually justify doing it anyway are not about elegance.
Release cadence, because you want to ship one piece without regression testing
everything around it. Operational fit, because you want to run it the way you
run everything else now. And people, because it is getting harder to hire anyone
who wants to spend a career in a stack that stopped being taught.

Make the case in those terms and you will get the budget. Make it about clean
architecture and you will not.

## Monday morning

1. Smallest service, fewest callers.
2. Record its real traffic and pin its behaviour, including the parts you find
   embarrassing.
3. Pull the rules into a middle that knows nothing about any framework.
4. Put an architecture test around that boundary.
5. Leave the old contract where it is and put an adapter behind it.
6. Find every caller that was inside a transaction, because those are the ones
   where identical code has a different meaning.
7. Prove it with the corpus rather than with an argument.
8. Put a date on deleting the shim.

Two things worth carrying out of it. Interface compatibility is not semantic
compatibility. And the hardest dependency in a legacy system is never the code,
it is the person who knows why that scheme code was never normalised.
