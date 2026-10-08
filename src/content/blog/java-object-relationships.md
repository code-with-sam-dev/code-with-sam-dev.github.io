---
title: 'Java Object Relationships: Inheritance, Composition and Polymorphism'
youtube: 'Exw_srMaopo'
cover: '/covers/java-object-relationships.jpg'
description: 'One payment scenario, six relationships. A subclass that counts three payments as six, the obvious fix that breaks when the parent changes one line, the delegating version that does not, association, aggregation and composition told apart by three questions, and polymorphism by overriding against a sealed switch. Real Java code, the class diagram notation, and the output of every run.'
pubDate: 2026-10-08
sheet: '/downloads/java-object-relationships.pdf'
repo: 'https://github.com/code-with-sam-dev/java-object-relationships'
tags: ['java', 'oop', 'uml', 'design']
duration: '15:10'
draft: false
---

Three payments go into a ledger. The ledger holds three. The subclass written
to count them says six:

```text
$ java com.example.payments.inheritance.Demo
CountingLedger: size 3, recorded 6
CountingLog:    size 3, recorded 3
```

So you fix it, the counter says three, and the tests pass. Months later someone
changes one line inside the parent class, in a method the subclass does not
even override, and the same subclass counts zero. No compile error, and not one
line of the subclass changed.

This article is the written version of the episode. It explains exactly why
that happens, and then works through the rest of the relationships between
objects that a Java developer is expected to name and choose between:
inheritance, delegation, association, aggregation, composition, and where
polymorphism fits. One payment scenario the whole way, the class diagram
notation beside the code, and the output of every run.

Everything here ran for real. Every code block is copied from a file in the
[repository](https://github.com/code-with-sam-dev/java-object-relationships),
named above the block, and every terminal block is copied from the transcripts
in its `evidence/` folder. One script, `scripts/verify.sh`, reproduces all of
them. The last section shows how.

## Versions, at the time of writing

At the time of writing, October 2026, Java 25 is the current long term support
release. The runs used OpenJDK 25.0.4, with JUnit 6.0.3 and AssertJ 3.27.7 for
the tests:

```text
openjdk version "25.0.4" 2026-07-21 LTS
```

None of these relationships are new in Java 25, or specific to it. Java 25 is
simply the version everything here was demonstrated on. The code does use a few
recent language features along the way: records, a sealed interface, pattern
matching in a `switch`, and demo classes with an instance `main` method and
`IO.println`, which are final in Java 25.

## The scenario

Sarah Thompson pays a shop. Each payment belongs to a customer. It moves from
created, to authorised, to captured, and it keeps a history of those changes.
At the end of the day the shop sends its payments to the bank in a settlement
batch. Payments are written to a ledger, and each payment method (card, bank
transfer or mobile money) charges its own fee. Amounts are whole US cents in a
`long`, so 2,500 cents is twenty five dollars.

Each relationship lives in its own package, so the classes below are named by
their path under `src/main/java/com/example/payments/`.

## Inheritance: a subclass that counts six

Here is the ledger. It records one payment, or a whole list of them. Look at
`recordAll`: it loops over the list and calls `record` for each payment.
Everything below depends on that loop.

`inheritance/PaymentLog.java`:

```java
package com.example.payments.inheritance;

import java.util.List;

public interface PaymentLog {

    void record(Payment payment);

    void recordAll(List<Payment> payments);

    int size();
}
```

`inheritance/Ledger.java`:

```java
package com.example.payments.inheritance;

import java.util.ArrayList;
import java.util.List;

public class Ledger implements PaymentLog {

    private final List<Payment> entries = new ArrayList<>();

    @Override
    public void record(Payment payment) {
        entries.add(payment);
    }

    @Override
    public void recordAll(List<Payment> payments) {
        for (Payment payment : payments) {
            record(payment);
        }
    }

    @Override
    public int size() {
        return entries.size();
    }
}
```

We want to know how many payments were recorded. So `CountingLedger` extends
`Ledger`. It overrides `record`: add one, then call `super.record`. And it
overrides `recordAll`: add the size of the list, then call `super.recordAll`.

`inheritance/CountingLedger.java`:

```java
package com.example.payments.inheritance;

import java.util.List;

// Inheritance: a Ledger that also counts what it records.
public class CountingLedger extends Ledger {

    private int recorded;

    @Override
    public void record(Payment payment) {
        recorded++;
        super.record(payment);
    }

    @Override
    public void recordAll(List<Payment> payments) {
        recorded += payments.size();
        super.recordAll(payments);
    }

    public int recorded() {
        return recorded;
    }
}
```

On a class diagram that is a solid line with a hollow triangle pointing at the
parent. It says a counting ledger is a ledger.

The demo records three payments with `recordAll`. `inheritance/Demo.java`:

```java
package com.example.payments.inheritance;

import java.util.List;

public class Demo {

    void main() {
        var payments = List.of(
                new Payment("P-1", 2_500),
                new Payment("P-2", 4_000),
                new Payment("P-3", 1_200));

        var inherited = new CountingLedger();
        inherited.recordAll(payments);
        IO.println("CountingLedger: size " + inherited.size()
                + ", recorded " + inherited.recorded());

        var composed = new CountingLog(new Ledger());
        composed.recordAll(payments);
        IO.println("CountingLog:    size " + composed.size()
                + ", recorded " + composed.recorded());
    }
}
```

```text
$ java com.example.payments.inheritance.Demo
CountingLedger: size 3, recorded 6
CountingLog:    size 3, recorded 3
```

### Why six

Follow the call in order:

1. The demo calls `recordAll` on a `CountingLedger`. The override adds three,
   then calls `super.recordAll`, which runs `Ledger`'s loop.
2. The loop calls `record(payment)`. That call is made on `this`, and `this` is
   a `CountingLedger`, so Java dispatches it to the override, not to `Ledger`'s
   own `record`.
3. The override adds one and calls `super.record`. Three payments, three more.
   Six.

A subclass inherits more than methods. It inherits the way the parent's methods
call each other. Joshua Bloch describes the same trap in Effective Java, with
an instrumented `HashSet` whose `addAll` calls `add`.

### The obvious fix, and the line that breaks it

The obvious fix is to delete the `recordAll` override and count only in
`record`, because `recordAll` already calls `record` for every payment. In the
repository that fix is an overlay, applied by `scripts/verify.sh` to a scratch
copy so `src/` stays the finished version.

`overlays/count-in-record-only/.../inheritance/CountingLedger.java`:

```java
package com.example.payments.inheritance;

// The obvious fix: only count in record(), because
// recordAll() already calls record() for every payment.
public class CountingLedger extends Ledger {

    private int recorded;

    @Override
    public void record(Payment payment) {
        recorded++;
        super.record(payment);
    }

    public int recorded() {
        return recorded;
    }
}
```

```text
# overlay: count-in-record-only
$ ./mvnw compile
BUILD SUCCESS
$ java com.example.payments.inheritance.Demo
CountingLedger: size 3, recorded 3
CountingLog:    size 3, recorded 3
```

Three. The tests pass. Now, months later, whoever owns `Ledger` makes
`recordAll` simpler: one `addAll` instead of the loop. A reasonable change, and
nothing written down anywhere says the loop must stay.

`overlays/ledger-uses-addall/.../inheritance/Ledger.java`:

```java
package com.example.payments.inheritance;

import java.util.ArrayList;
import java.util.List;

public class Ledger implements PaymentLog {

    private final List<Payment> entries = new ArrayList<>();

    @Override
    public void record(Payment payment) {
        entries.add(payment);
    }

    @Override
    public void recordAll(List<Payment> payments) {
        entries.addAll(payments);
    }

    @Override
    public int size() {
        return entries.size();
    }
}
```

Run the same subclass against it:

```text
# overlay: count-in-record-only
# overlay: ledger-uses-addall
$ ./mvnw compile
BUILD SUCCESS
$ java com.example.payments.inheritance.Demo
CountingLedger: size 3, recorded 0
CountingLog:    size 3, recorded 3
```

Zero. Not one line of `CountingLedger` changed. Its fix depended on how the
parent happened to implement `recordAll`, and that was never part of
`Ledger`'s contract.

The first bug, six, was a mistake in the subclass. The deeper problem is the
second one: a sensible fix that silently relies on the parent's internals. The
counts went 6, then 3, then 0, and the subclass only changed once.

## Delegation: the same goal without extending anything

`CountingLog` implements the `PaymentLog` interface, and it holds a
`PaymentLog`. Every call is forwarded to it, and the count goes up only after
the log has accepted the call.

`inheritance/CountingLog.java`:

```java
package com.example.payments.inheritance;

import java.util.List;

// Delegation: holds a PaymentLog and forwards to it,
// counting a call only once the log has accepted it.
public final class CountingLog implements PaymentLog {

    private final PaymentLog log;
    private int recorded;

    public CountingLog(PaymentLog log) {
        this.log = log;
    }

    @Override
    public void record(Payment payment) {
        log.record(payment);
        recorded++;
    }

    @Override
    public void recordAll(List<Payment> payments) {
        log.recordAll(payments);
        recorded += payments.size();
    }

    @Override
    public int size() {
        return log.size();
    }

    public int recorded() {
        return recorded;
    }
}
```

It is the second line of every run above. Against the original ledger, three.
Against the ledger that switched to `addAll`, three again:

```text
CountingLog:    size 3, recorded 3
```

`CountingLog` depends only on what the `PaymentLog` interface promises, not on
how a `Ledger` implements it. That does not make it impossible to get wrong,
so be precise about what it counts: successful calls to `record` and
`recordAll`. If the log refuses a payment by throwing, nothing is counted, and
`CountingTest.theWrapperDoesNotCountAPaymentTheLogRefused` pins exactly that.
And if other code writes to the same ledger directly, this counter will not
see it.

(Strictly, Bloch calls a wrapper that forwards like this "forwarding", and
reserves "delegation" for a wrapper that passes itself to the wrapped object.
In everyday use, and in the video, this is called delegation.)

### What "composition over inheritance" means here

This is what people usually mean by composition over inheritance: building
behaviour out of objects instead of extending a class. On a class diagram,
though, `CountingLog` to `PaymentLog` is an association, drawn as a plain line
with an open arrow: a counting log knows a payment log. Whoever created that
ledger can still hold it too, so it is not UML composition. The dashed line
with a hollow triangle from `CountingLog` to `PaymentLog` means it implements
the interface. The filled diamond of UML composition is a stronger claim, and
it comes later.

How the `PaymentLog` arrived (through the constructor) does not decide which
relationship it is either. Constructor injection is a way of handing an object
over. It says nothing about who else holds it.

## Inheritance used well: exception specialisation

None of this makes inheritance the villain. Here it is used well, in a narrow
case. A payment state exception is an illegal state exception.

`composition/PaymentStateException.java`:

```java
package com.example.payments.composition;

// Inheritance that works: a payment state error IS an
// IllegalStateException, and every catch written for one
// still catches it.
public class PaymentStateException
        extends IllegalStateException {

    public PaymentStateException(String message) {
        super(message);
    }
}
```

Capture a payment that was never authorised, and a catch block written for
`IllegalStateException` still catches it. `composition/ExceptionDemo.java`:

```java
package com.example.payments.composition;

public class ExceptionDemo {

    void main() {
        var sarah = new Customer("C-1", "Sarah Thompson");
        var payment = new Payment("P-1", sarah, 2_500);
        try {
            payment.capture();
        } catch (IllegalStateException e) {
            IO.println("caught by: catch "
                    + "(IllegalStateException e)");
            IO.println("class:     "
                    + e.getClass().getSimpleName());
            IO.println("message:   " + e.getMessage());
        }
    }
}
```

```text
$ java com.example.payments.composition.ExceptionDemo
caught by: catch (IllegalStateException e)
class:     PaymentStateException
message:   P-1 is CREATED, not AUTHORISED
```

That is the test for inheritance: a real "is a" relationship, where the
subclass can stand in for the parent everywhere the parent is expected, and a
parent that was designed to be extended. `IllegalStateException` passes both.
`Ledger`, whose `recordAll` could change its internals at any time, did not.

## Three questions, not a keyword

Association, aggregation and composition all look the same in Java: a field
holding a reference to another object. Java has no keyword for any of them. A
class diagram states which one you meant, and the code has to keep the promise.
Three questions decide it:

1. Is this a whole and its parts, or two objects that only know each other?
2. Can one part belong to more than one whole at the same time?
3. When the whole is deleted, does the part go with it?

How the object arrived, through a constructor parameter, a field initialiser or
anywhere else, is a clue. It is not the answer.

## Association: a payment knows its customer

`association/Customer.java` and `association/Payment.java`:

```java
package com.example.payments.association;

public record Customer(String id, String name) {}
```

```java
package com.example.payments.association;

// A payment knows its customer. The customer was created
// first, by someone else, and does not know its payments.
public record Payment(String id, Customer customer,
        long cents) {}
```

This is association, the general relationship: two objects that know each
other, and nothing more. A customer is not made of payments, and a payment is
not part of a customer. Two payments for Sarah, `association/Demo.java`:

```java
package com.example.payments.association;

public class Demo {

    void main() {
        var sarah = new Customer("C-1", "Sarah Thompson");

        var first = new Payment("P-1", sarah, 2_500);
        var second = new Payment("P-2", sarah, 4_000);

        IO.println("P-1 customer: " + first.customer().name());
        IO.println("P-2 customer: " + second.customer().name());
        IO.println("same Customer object: "
                + (first.customer() == second.customer()));
    }
}
```

```text
$ java com.example.payments.association.Demo
P-1 customer: Sarah Thompson
P-2 customer: Sarah Thompson
same Customer object: true
```

Both payments point at the same customer object. `Customer` has no list of
payments, so on the diagram the arrow points one way, from payment to customer:
a plain line with an open arrowhead, one customer, zero or more payments.

## Aggregation: a settlement batch groups payments

`aggregation/SettlementBatch.java`:

```java
package com.example.payments.aggregation;

import java.util.ArrayList;
import java.util.List;

// Groups payments to send to the bank at the end of the day.
// The payments existed before the batch and outlive it.
public final class SettlementBatch {

    private final String id;
    private final List<Payment> payments = new ArrayList<>();
    private boolean rejected;

    public SettlementBatch(String id) {
        this.id = id;
    }

    public void add(Payment payment) {
        payments.add(payment);
    }

    public void reject() {
        rejected = true;
    }

    public boolean rejected() {
        return rejected;
    }

    public long totalCents() {
        return payments.stream()
                .mapToLong(Payment::cents)
                .sum();
    }

    public List<Payment> payments() {
        return List.copyOf(payments);
    }

    public String id() {
        return id;
    }
}
```

The payments existed before the batch. `add` puts one in the list,
`totalCents` adds up the cents, and `reject` marks the whole batch as rejected.
`aggregation/Demo.java` builds Monday's batch, has the bank reject it, and
retries with a new batch:

```java
package com.example.payments.aggregation;

public class Demo {

    void main() {
        var sarah = new Customer("C-1", "Sarah Thompson");
        var first = new Payment("P-1", sarah, 2_500);
        var second = new Payment("P-2", sarah, 4_000);

        var monday = new SettlementBatch("MON");
        monday.add(first);
        monday.add(second);
        IO.println("MON: " + monday.payments().size()
                + " payments, "
                + monday.totalCents() + " cents");

        monday.reject();
        IO.println("MON rejected: " + monday.rejected());
        IO.println("P-1 unchanged: " + first.id() + ", "
                + first.cents() + " cents");

        var retry = new SettlementBatch("MON-RETRY");
        retry.add(first);
        retry.add(second);
        IO.println("MON-RETRY: " + retry.payments().size()
                + " payments, "
                + retry.totalCents() + " cents");
        IO.println("same P-1 object in both batches: "
                + (monday.payments().getFirst()
                        == retry.payments().getFirst()));
    }
}
```

```text
$ java com.example.payments.aggregation.Demo
MON: 2 payments, 6500 cents
MON rejected: true
P-1 unchanged: P-1, 2500 cents
MON-RETRY: 2 payments, 6500 cents
same P-1 object in both batches: true
```

Monday's batch holds two payments, 6,500 cents, sixty five dollars. The bank
rejects it, and the payments are untouched: P-1 is still P-1, 2,500 cents. A
retry batch takes the same two payments, and it is the same payment object in
both batches. The retry is allowed because Monday was rejected. A real system
would also check that no payment is ever settled twice.

On a class diagram this is shared aggregation: a hollow diamond at the batch
end. The batch is a whole, the payments are its parts, a part can belong to
more than one batch over time, and rejecting the batch does not delete its
payments.

Be careful how much you read into the hollow diamond. The UML 2.5.1
specification says the precise semantics of shared aggregation vary by
application area and modeler. It is a modelling choice you make and document,
not something Java works out from a `List<Payment>`.

## Composition: a payment owns its history

`composition/Payment.java`:

```java
package com.example.payments.composition;

import java.util.List;

// Owns its history: it creates it, changes it only through
// authorise() and capture(), and never hands it out.
public final class Payment {

    private final String id;
    private final Customer customer;
    private final long cents;
    private final PaymentHistory history =
            new PaymentHistory();

    public Payment(String id, Customer customer,
            long cents) {
        this.id = id;
        this.customer = customer;
        this.cents = cents;
    }

    public void authorise() {
        move(Status.CREATED, Status.AUTHORISED);
    }

    public void capture() {
        move(Status.AUTHORISED, Status.CAPTURED);
    }

    public Status status() {
        return history.current();
    }

    public List<StatusChange> history() {
        return history.entries();
    }

    private void move(Status from, Status to) {
        if (status() != from) {
            throw new PaymentStateException(
                    id + " is " + status() + ", not " + from);
        }
        history.add(new StatusChange(from, to));
    }
}
```

`composition/PaymentHistory.java`, with `Status` and `StatusChange`:

```java
package com.example.payments.composition;

import java.util.ArrayList;
import java.util.List;

// The status changes of one payment, in order.
public final class PaymentHistory {

    private final List<StatusChange> changes =
            new ArrayList<>();

    void add(StatusChange change) {
        changes.add(change);
    }

    public Status current() {
        return changes.isEmpty()
                ? Status.CREATED
                : changes.getLast().to();
    }

    public List<StatusChange> entries() {
        return List.copyOf(changes);
    }
}
```

```java
package com.example.payments.composition;

public enum Status { CREATED, AUTHORISED, CAPTURED }
```

```java
package com.example.payments.composition;

public record StatusChange(Status from, Status to) {}
```

Each payment owns its history. `Payment` creates it as a field, changes it only
through `authorise` and `capture`, and never hands it out. `history()` returns
a copy, and each entry is a record, so nothing outside can change it. The test
`theHistoryItHandsOutCannotBeChanged` tries, and gets an
`UnsupportedOperationException`. `PaymentHistory.add` is package private, so
code outside the package cannot call it either.

On the diagram that is a filled diamond at the payment end. A history belongs
to exactly one payment, and when the payment is deleted, its history goes with
it.

That is logical ownership. It is not a promise about object lifetime. Java has
no destructors: the garbage collector can reclaim an object only once nothing
can reach it, and it decides when. A test, a log line or a debugger can still
hold a reference to an object the design has finished with. The diagram does
not predict when memory is freed, and it does not need to.

### The trap: the same class, with the history passed in

`composition/SharedHistoryPayment.java` is the same class, except it takes its
history from the constructor. That looks like ordinary constructor injection:

```java
package com.example.payments.composition;

import java.util.List;

// Takes its history from the caller, so two payments can
// be given the same one.
public final class SharedHistoryPayment {

    private final String id;
    private final Customer customer;
    private final long cents;
    private final PaymentHistory history;

    public SharedHistoryPayment(String id, Customer customer,
            long cents,
            PaymentHistory history) {
        this.id = id;
        this.customer = customer;
        this.cents = cents;
        this.history = history;
    }

    public void authorise() {
        move(Status.CREATED, Status.AUTHORISED);
    }

    public void capture() {
        move(Status.AUTHORISED, Status.CAPTURED);
    }

    public Status status() {
        return history.current();
    }

    public List<StatusChange> history() {
        return history.entries();
    }

    private void move(Status from, Status to) {
        if (status() != from) {
            throw new PaymentStateException(
                    id + " is " + status() + ", not " + from);
        }
        history.add(new StatusChange(from, to));
    }
}
```

So two payments are built with the same history object, payment one is
authorised, and nobody touches payment two. Then the owned version, for
comparison. `composition/Demo.java`:

```java
package com.example.payments.composition;

public class Demo {

    void main() {
        var sarah = new Customer("C-1", "Sarah Thompson");

        var shared = new PaymentHistory();
        var p1 = new SharedHistoryPayment("P-1", sarah, 2_500,
                shared);
        var p2 = new SharedHistoryPayment("P-2", sarah, 4_000,
                shared);
        p1.authorise();
        IO.println("SharedHistoryPayment P-1: " + p1.status());
        IO.println("SharedHistoryPayment P-2: " + p2.status());

        var p3 = new Payment("P-3", sarah, 2_500);
        var p4 = new Payment("P-4", sarah, 4_000);
        p3.authorise();
        IO.println("Payment P-3: " + p3.status());
        IO.println("Payment P-4: " + p4.status());
    }
}
```

```text
$ java com.example.payments.composition.Demo
SharedHistoryPayment P-1: AUTHORISED
SharedHistoryPayment P-2: AUTHORISED
Payment P-3: AUTHORISED
Payment P-4: CREATED
```

P-2 says `AUTHORISED`. It never was. The owned version behaves: P-3 authorised,
P-4 still `CREATED`.

The filled diamond says each history belongs to one payment. This
implementation breaks that promise, because it accepts a history that anyone
can share. Java allowed it. The diagram did not. The code has to enforce the
ownership the diagram claims, and here the one difference is whether the class
creates its part or accepts it from a caller.

## Polymorphism: who decides the fee

Each payment method charges a fee. The first version is one method that takes
the method's name as a string. `polymorphism/strings/FeeCalculator.java`:

```java
package com.example.payments.polymorphism.strings;

// One method decides the fee for every kind of payment.
public class FeeCalculator {

    public long fee(String method, long cents) {
        if (method.equals("CARD")) {
            return 20 + cents * 15 / 1000;
        } else if (method.equals("BANK_TRANSFER")) {
            return 30;
        }
        return 0;
    }
}
```

Card is twenty cents plus one and a half percent, rounded down. Bank transfer
is a flat thirty cents. Anything else falls through to zero:

```text
$ java com.example.payments.polymorphism.strings.Demo
CARD fee on 2500 cents: 57 cents
BANK_TRANSFER fee on 2500 cents: 30 cents
MOBILE_MONEY fee on 2500 cents: 0 cents
MOBILE_MOENY fee on 2500 cents: 0 cents
```

Mobile money costs nothing. A typo, with the e and the n swapped, also costs
nothing. It compiles and nothing fails. To be fair, an enum, or throwing on an
unknown name, would catch that too. Polymorphism fixes it a different way.

### Overriding: the object decides

`PaymentMethod` becomes an interface with one method, `fee`. Each kind of
payment implements it with its own rule.
`polymorphism/overriding/PaymentMethod.java`, `Card.java`, `MobileMoney.java`
and `BankTransfer.java`:

```java
package com.example.payments.polymorphism.overriding;

// Every kind of payment says what it costs.
public interface PaymentMethod {

    long fee(long cents);
}
```

```java
package com.example.payments.polymorphism.overriding;

public record Card(String last4) implements PaymentMethod {

    @Override
    public long fee(long cents) {
        return 20 + cents * 15 / 1000;
    }
}
```

```java
package com.example.payments.polymorphism.overriding;

public record MobileMoney(String phone)
        implements PaymentMethod {

    @Override
    public long fee(long cents) {
        return cents * 2 / 100;
    }
}
```

```java
package com.example.payments.polymorphism.overriding;

public record BankTransfer(String routingNumber)
        implements PaymentMethod {

    @Override
    public long fee(long cents) {
        return 30;
    }
}
```

`Checkout.total` takes any payment method and calls `fee`. It never asks which
one it has. `polymorphism/overriding/Checkout.java`:

```java
package com.example.payments.polymorphism.overriding;

// Never asks which kind of payment it has.
public class Checkout {

    public long total(PaymentMethod method, long cents) {
        return cents + method.fee(cents);
    }
}
```

```text
$ java com.example.payments.polymorphism.overriding.Demo
Card total on 2500 cents: 2557 cents
BankTransfer total on 2500 cents: 2530 cents
MobileMoney total on 2500 cents: 2550 cents
```

The same line of `Checkout`, given a card, runs the card's fee: 57 cents on
2,500. Given mobile money, it runs mobile money's: 50 cents. That is
polymorphism. One call, and the object decides which code runs.

Now add a payment method and forget its fee.
`overlays/mobile-money-without-fee/.../overriding/MobileMoney.java`:

```java
package com.example.payments.polymorphism.overriding;

public record MobileMoney(String phone)
        implements PaymentMethod {}
```

```text
# overlay: mobile-money-without-fee
$ ./mvnw compile
src/main/java/com/example/payments/polymorphism/overriding/MobileMoney.java:[3,8] com.example.payments.polymorphism.overriding.MobileMoney is not abstract and does not override abstract method fee(long) in com.example.payments.polymorphism.overriding.PaymentMethod
BUILD FAILURE
```

It does not compile. That is the interface contract: every concrete class that
implements `PaymentMethod` must provide `fee`. Notice that this
`PaymentMethod` is a plain interface. Nothing here is sealed, so the error has
nothing to do with sealing. It comes from the abstract method alone.

On the diagram, polymorphism has no arrow of its own. The dashed lines with
hollow triangles, from each payment method to the interface, show the types
that make it possible.

### The alternative: a sealed hierarchy and one switch

Here the payment methods are only data: a sealed interface that permits
exactly three records. `polymorphism/switching/PaymentMethod.java` and the
three records:

```java
package com.example.payments.polymorphism.switching;

// The kinds of payment are data. The fee lives elsewhere.
public sealed interface PaymentMethod
        permits Card, BankTransfer, MobileMoney {}
```

```java
package com.example.payments.polymorphism.switching;

public record Card(String last4) implements PaymentMethod {}
```

```java
package com.example.payments.polymorphism.switching;

public record BankTransfer(String routingNumber)
        implements PaymentMethod {}
```

```java
package com.example.payments.polymorphism.switching;

public record MobileMoney(String phone)
        implements PaymentMethod {}
```

Every fee rule lives in one `switch`. `polymorphism/switching/Fees.java`:

```java
package com.example.payments.polymorphism.switching;

// Every fee rule in one place, checked by the compiler.
public final class Fees {

    private Fees() {}

    public static long fee(PaymentMethod method, long cents) {
        return switch (method) {
            case Card card -> 20 + cents * 15 / 1000;
            case BankTransfer transfer -> 30;
            case MobileMoney mobile -> cents * 2 / 100;
        };
    }
}
```

```text
$ java com.example.payments.polymorphism.switching.Demo
Card fee on 2500 cents: 57 cents
BankTransfer fee on 2500 cents: 30 cents
MobileMoney fee on 2500 cents: 50 cents
```

The same fees as the overriding version, and `FeesTest` checks that. Leave out
mobile money, `overlays/switch-without-mobile-money/.../switching/Fees.java`:

```java
package com.example.payments.polymorphism.switching;

// Every fee rule in one place, checked by the compiler.
public final class Fees {

    private Fees() {}

    public static long fee(PaymentMethod method, long cents) {
        return switch (method) {
            case Card card -> 20 + cents * 15 / 1000;
            case BankTransfer transfer -> 30;
        };
    }
}
```

```text
# overlay: switch-without-mobile-money
$ ./mvnw compile
src/main/java/com/example/payments/polymorphism/switching/Fees.java:[9,16] the switch expression does not cover all possible input values
BUILD FAILURE
```

That is a second, different protection: a sealed hierarchy, plus a `switch`
expression that must cover every case. There is no `default` branch, which is
exactly why the compiler can tell you a case is missing.

### Which one?

Overriding usually keeps the behaviour for one type together: everything about
a card is in `Card`. A `switch` usually keeps one operation together: every fee
rule is in `Fees`. Both have extension costs. With overriding, a new kind of
payment is one new class, but a new rule about payments touches every class.
With the switch, a new rule is one new method, but a new kind of payment
touches every switch over the hierarchy, and sealing makes some of those
omissions visible at compile time. Ask what changes more often in your code:
new kinds of payment, or new rules about them.

## The notation, on one table

| Relationship | In this code | On a UML class diagram |
| --- | --- | --- |
| Association | `Payment` knows its `Customer`; `CountingLog` knows a `PaymentLog` | solid line, open arrowhead towards the object that is known |
| Shared aggregation | `SettlementBatch` groups `Payment`s | hollow diamond at the whole (the batch) |
| Composition | `Payment` owns its `PaymentHistory` | filled diamond at the whole (the payment) |
| Inheritance | `CountingLedger extends Ledger`; `PaymentStateException extends IllegalStateException` | solid line, hollow triangle at the parent |
| Implementing an interface | `Card implements PaymentMethod`; `CountingLog implements PaymentLog` | dashed line, hollow triangle at the interface |
| Polymorphism | `Checkout.total` calling `fee` | no arrow of its own; the implements lines make it possible |

Your turn: a payment knows its customer, a settlement batch groups existing
payments, a payment owns its history. Association, shared aggregation,
composition. Around them, the ledger's inheritance, the counting log's
delegation, and three payment methods behind one interface.

## Honest simplifications

Amounts are whole cents in a `long`, the fees are made up and rounded down by
integer division, there are no null checks, and the history lives in memory.
Real payment code needs a money type with a currency, an agreed rounding rule,
validation, and a database for the history. They are left out so the
relationships stay visible.

## Interview questions this answers

1. A subclass overrides two methods of its parent and double counts. Why, and
   why is "count in only one of them" not a safe fix?
2. What does a wrapper that implements the same interface depend on that a
   subclass does not, and what can it still miss?
3. When is inheritance the right choice?
4. Association, aggregation and composition all compile to a field. How do you
   tell them apart?
5. Does constructor injection make a relationship aggregation rather than
   composition?
6. Does composition on a class diagram tell you when the garbage collector
   frees the part?
7. Overriding or a `switch` over a sealed interface: what does each make cheap,
   and what does each make expensive?

## The repository, and reproducing every output

All the code is in
[java-object-relationships](https://github.com/code-with-sam-dev/java-object-relationships):

- `src/main/java/com/example/payments/`: one package per relationship
  (`association`, `aggregation`, `composition`, `inheritance`, and
  `polymorphism` with `strings`, `overriding` and `switching`), each with a
  `Demo` you can run.
- `src/test/`: nineteen tests that pin every behaviour above, including the
  broken designs, which have tests that prove they are broken.
- `overlays/`: the code that changes the outcome or does not compile, applied
  by the script to a scratch copy, so `src/` always stays the finished version.
- `evidence/`: the transcripts every terminal block in this article is copied
  from.

You need a JDK 25, or only Docker:

```bash
./mvnw test
scripts/verify.sh

docker build -t object-relationships .
docker run --rm object-relationships
```

`scripts/verify.sh` runs the tests, every demo and every overlay, and writes
what each printed to `evidence/`. The test run, as recorded:

```text
$ ./mvnw test
aggregation.SettlementBatchTest: 3 tests, 0 failures, 0 errors
  ok   rejectingABatchLeavesItsPaymentsUntouched
  ok   theSamePaymentsGoIntoTheRetry
  ok   totalsThePaymentsItWasGiven
association.PaymentTest: 1 tests, 0 failures, 0 errors
  ok   twoPaymentsShareOneCustomer
composition.PaymentTest: 5 tests, 0 failures, 0 errors
  ok   movesThroughItsStatuses
  ok   eachPaymentHasItsOwnHistory
  ok   aSharedHistoryLetsOnePaymentChangeAnother
  ok   cannotCaptureBeforeItIsAuthorised
  ok   theHistoryItHandsOutCannotBeChanged
inheritance.CountingTest: 3 tests, 0 failures, 0 errors
  ok   theWrapperDoesNotCountAPaymentTheLogRefused
  ok   theWrapperCountsEachPaymentOnce
  ok   theSubclassCountsEveryPaymentTwice
polymorphism.overriding.CheckoutTest: 2 tests, 0 failures, 0 errors
  ok   checkoutNeverAsksWhichMethodItHas
  ok   eachMethodAddsItsOwnFee
polymorphism.strings.FeeCalculatorTest: 4 tests, 0 failures, 0 errors
  ok   cardIsTwentyCentsPlusOneAndAHalfPercent
  ok   bankTransferIsAFlatThirtyCents
  ok   aTypoCompilesAndCostsNothing
  ok   anUnknownMethodQuietlyCostsNothing
polymorphism.switching.FeesTest: 1 tests, 0 failures, 0 errors
  ok   theSwitchGivesTheSameFeesAsTheOverrides
exit 0
```

The free [design sheet](/downloads/java-object-relationships.pdf) has the
notation table, the three questions, every snippet above and the output of each
run, on a few pages you can keep next to your editor.
