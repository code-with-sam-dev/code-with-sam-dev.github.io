---
title: 'One @Transactional Mistake Crippled My Spring Boot App: A Flash Sale, Measured'
description: 'A Spring Boot checkout calls the card provider inside one @Transactional method. Under a flash sale, checkout takes 24 seconds, a different product page takes 23.7 seconds, and the CPU sits mostly idle. A bigger connection pool changes nothing. Paying after the commit brings checkout to 106 ms. Every number measured, with the code, the thread dump, the Postgres lock waits and what the fix costs.'
youtube: 'S5suMfe2FDg'
cover: '/covers/spring-boot-transactional-flash-sale.jpg'
pubDate: 2026-10-09
sheet: '/downloads/spring-boot-transactional-flash-sale.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-boot-flash-sale'
tags: ['java', 'spring', 'performance', 'databases']
duration: '9:01'
draft: false
---

A shop runs a flash sale. Twenty people a second try to buy the same pair of
earbuds, and two hundred people a second browse the rest of the catalogue. The
checkout is one `@Transactional` method, and somewhere in the middle of it, it
calls the card provider. This is what the load generator saw for a minute of
that sale:

```text
pool=10 mode=pay-inside buy=20/s browse=200/s duration=60s 2026-10-09T07:05:44Z
  order  med 24.4s  p99 48.4s  max 51.2s  failed 0.0%
  browse med 23.7s  p99 47.6s  max 50.2s  failed 0.0%
  completed requests 9154  (101/s)   never started (dropped) 216
  paid orders in database 834
  peak: connections in use 10.0  threads waiting for one 188.0
        tomcat busy threads 200.0  app cpu 29%
```

Checkout takes 24 seconds at the median. That might be expected for the one
product everyone wants. The second line is the strange one: viewing a
completely different product, which never touches the sale item, takes 23.7
seconds. And the app's CPU peaked at 29%. The server is not busy. It is
waiting.

This article is the written version of the episode. It shows the checkout,
the one line that holds a lock, where every one of the 200 request threads
was at that moment, what Postgres said they were waiting for, why a bigger
connection pool does not help, the fix, and what the fix costs.

Everything here ran for real. Every code block is copied from a file in the
[repository](https://github.com/code-with-sam-dev/spring-boot-flash-sale) at
commit `b54cff1`, named above the block. Every terminal block is copied from a
file in its `evidence/` folder, also named. The last section shows the
commands that reproduce each number.

## The scenario

The catalogue has one flash sale product, id 1, "Wireless Earbuds, flash
sale", at $29.99 with a million units in stock, so it never sells out during
a test. What is measured is the checkout, not running out. There are 999
ordinary products beside it.

Two kinds of request arrive:

- **Buyers** post an order for product 1, twenty a second.
- **Browsers** view a random product between 2 and 1000, two hundred a second.
  They never touch product 1.

The card provider is a WireMock stub that answers every charge after 100 ms.
That is a realistic, even generous, time for a payment call, and it is the
only slow thing in the system.

## Versions, at the time of writing

At the time of writing, October 2026, the code runs on Spring Boot 4.1.1,
Java 25 and Postgres 17, with WireMock 3.13.1 as the provider and k6 as the
load generator. The defaults this depends on, also at the time of writing:
Tomcat `server.tomcat.threads.max` 200, `accept-count` 100,
`max-connections` 8,192, and HikariCP `maximum-pool-size` 10 with a
`connection-timeout` of 30 seconds. The app leaves every pool and server
limit at its Spring Boot default unless a run says otherwise.

All the numbers come from one laptop, with each container limited to 2 CPUs
and a stubbed provider. They show the shape of the failure, not the capacity
of any production server.

## The checkout

This is the version most of us write first. One transaction around the whole
checkout: take one unit of stock, look up the price, charge the card, record
the order.

`src/main/java/dev/example/flashsale/PayInsideTransaction.java`:

```java
package dev.example.flashsale;

import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The version most of us write first: one transaction around the whole checkout,
 * including the call to the card provider.
 */
@Service
@ConditionalOnProperty(name = "checkout.mode", havingValue = "pay-inside",
        matchIfMissing = true)
public class PayInsideTransaction implements Checkout {

    private final ProductRepository products;
    private final OrderRepository orders;
    private final PaymentGateway payments;

    public PayInsideTransaction(ProductRepository products, OrderRepository orders,
                                PaymentGateway payments) {
        this.products = products;
        this.orders = orders;
        this.payments = payments;
    }

    @Override
    @Transactional
    public OrderPlaced placeOrder(OrderRequest request) {
        if (!products.takeOne(request.productId())) {
            throw new SoldOut(request.productId());
        }
        int amount = products.price(request.productId());
        String ref = payments.charge(UUID.randomUUID().toString(), request.customer(),
                amount);
        long id = orders.insert(request.productId(), request.customer(), amount,
                "PAID");
        return new OrderPlaced(id, request.productId(), ref);
    }
}
```

It reads well. If the card is declined, the exception rolls the stock back.
If the insert fails, the stock comes back too. That sense of safety is
exactly why it gets written this way, and the last part of this article comes
back to how much of it is real.

Both checkouts implement one small interface, and a property picks which one
runs, so the controller, the repositories and the load are identical for
both.

`src/main/java/dev/example/flashsale/Checkout.java`:

```java
package dev.example.flashsale;

public interface Checkout {

    OrderPlaced placeOrder(OrderRequest request);
}
```

The card provider is a real HTTP call through `RestClient`, with a one second
connect timeout and a two second read timeout.

`src/main/java/dev/example/flashsale/PaymentGateway.java`:

```java
package dev.example.flashsale;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** The card provider. A real network call, about 100 ms, outside our control. */
@Component
public class PaymentGateway {

    private final RestClient http;

    public PaymentGateway(RestClient.Builder builder,
                          @Value("${payments.url}") String url) {
        HttpClient client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(1))
                .build();
        JdkClientHttpRequestFactory requests = new JdkClientHttpRequestFactory(client);
        requests.setReadTimeout(Duration.ofSeconds(2));
        this.http = builder.baseUrl(url).requestFactory(requests).build();
    }

    /** The key lets the provider spot a repeat, and lets us find the charge later. */
    public String charge(String idempotencyKey, String customer, int amountCents) {
        Map<?, ?> reply = http.post().uri("/charge")
                .header("Idempotency-Key", idempotencyKey)
                .body(Map.of("customer", customer, "amountCents", amountCents))
                .retrieve()
                .body(Map.class);
        return String.valueOf(reply.get("ref"));
    }
}
```

## The row lock

The first line of the checkout calls `takeOne`. It is one conditional
`UPDATE`, which is the right way to take stock: the check and the write are
the same statement, so two buyers can never both take the last unit.

`src/main/java/dev/example/flashsale/ProductRepository.java` (excerpt):

```java
    /** Takes one unit of stock. The row stays locked until the transaction ends. */
    public boolean takeOne(long id) {
        return db.sql("""
                UPDATE products SET stock = stock - 1
                WHERE id = :id AND stock > 0""")
                .param("id", id)
                .update() == 1;
    }
```

The comment is the whole story. An `UPDATE` in Postgres takes a row lock, and
that lock is held until the transaction commits or rolls back. Not until the
statement finishes: until the transaction ends.

In `PayInsideTransaction`, the transaction ends after the card provider has
answered and the order has been inserted. So for every checkout, the product
1 row stays locked for the whole 100 ms payment call. Every other buyer's
`takeOne` on the same row has to wait for it. Twenty buyers a second, each
holding the one row for at least 100 ms, is already about two seconds of lock
time arriving every second. They queue.

That is the reasoning. The rest of the article measures it.

## The tests pass

Both checkouts share one contract test, run against a real Postgres 17 in
Testcontainers. It checks what each checkout does to the data: one unit taken,
one paid order recorded, and nothing recorded when the product is sold out.

`src/test/java/dev/example/flashsale/CheckoutContract.java` (excerpt):

```java
/** Both checkouts do the same to the data. Only how long they hold a lock differs. */
@Testcontainers
abstract class CheckoutContract {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:17");

    @Autowired Checkout checkout;
    @Autowired JdbcClient db;
    @MockitoBean PaymentGateway payments;

    @BeforeEach
    void reset() {
        db.sql("DELETE FROM orders").update();
        db.sql("UPDATE products SET stock = 3 WHERE id = 1").update();
        when(payments.charge(anyString(), anyString(), anyInt()))
                .thenReturn("pay_test");
    }

    @Test
    void takesOneUnitAndRecordsOnePaidOrder() {
        OrderPlaced placed = checkout.placeOrder(new OrderRequest(1, "Sarah Thompson"));

        assertThat(placed.paymentRef()).isEqualTo("pay_test");
        assertThat(stock()).isEqualTo(2);
        assertThat(db.sql("SELECT status FROM orders WHERE id = :id")
                .param("id", placed.orderId())
                .query(String.class).single()).isEqualTo("PAID");
    }

    @Test
    void refusesWhenSoldOut() {
        db.sql("UPDATE products SET stock = 0 WHERE id = 1").update();

        assertThatThrownBy(() -> checkout.placeOrder(new OrderRequest(1, "James")))
                .isInstanceOf(SoldOut.class);
        assertThat(db.sql("SELECT count(*) FROM orders").query(Long.class).single())
                .isZero();
    }
```

Every test passes, for both versions.

`evidence/tests.txt`:

```text
PayAfterCommitTest
  ok    takesOneUnitAndRecordsOnePaidOrder
  ok    refusesWhenSoldOut
  ok    chargedButNotRecordedLeavesAReservedOrderToReconcile
  ok    isTheCheckoutInUse
PayInsideTransactionTest
  ok    takesOneUnitAndRecordsOnePaidOrder
  ok    refusesWhenSoldOut
  ok    isTheCheckoutInUse
Tests run: 7, Failures: 0
```

That is the point. The broken checkout is correct. It takes the stock, records
the order and refuses a sold out product. A test that places one order at a
time cannot see a problem that only exists when two orders want the same row
at once.

## The sale

The load is an open model. With k6's `constant-arrival-rate` executor, new
requests keep arriving at a fixed rate whether or not the app keeps up, the
way real shoppers do. A closed model, where each virtual user waits for its
last answer before sending the next, would politely slow down with the app
and hide the queue.

`load/flash-sale.js` (excerpt):

```js
const BUY = Number(__ENV.BUY_RATE || 20);       // orders started per second
const BROWSE = Number(__ENV.BROWSE_RATE || 200); // product page views per second
const DURATION = __ENV.DURATION || '60s';
const BASE = __ENV.BASE || 'http://localhost:8080';
const VUS = { preAllocatedVUs: Number(__ENV.PRE_VUS || 200),
              maxVUs: Number(__ENV.MAX_VUS || 8000) };
```

```js
  scenarios: {
    buyers: { executor: 'constant-arrival-rate', rate: BUY, timeUnit: '1s',
              duration: DURATION, ...VUS, exec: 'buy' },
    browsers: { executor: 'constant-arrival-rate', rate: BROWSE, timeUnit: '1s',
                duration: DURATION, ...VUS, exec: 'browse' },
  },
```

```js
export function buy() {
  const order = { productId: 1, customer: `buyer-${__VU}-${__ITER}` };
  const res = http.post(`${BASE}/orders`, JSON.stringify(order),
    Object.assign({ tags: { name: 'order' } }, params));
  check(res, { 'order placed': (r) => r.status === 200 });
}

export function browse() {
  const id = 2 + Math.floor(Math.random() * 999);
  const res = http.get(`${BASE}/products/${id}`,
    { tags: { name: 'browse' }, timeout: '60s' });
  check(res, { 'page shown': (r) => r.status === 200 });
}
```

Every service runs in a container with fixed CPU and memory, so runs compare
with each other. The provider is the WireMock stub with a 100 ms fixed delay.

`compose.yaml`:

```yaml
# The whole experiment on one machine, fixed CPU and memory per container.
# Load comes from k6 on the host: see bin/run.sh.
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: shop
      POSTGRES_DB: shop
    ports:
      - "5480:5432"
    cpus: 2
    mem_limit: 2g
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop"]
      interval: 2s
      retries: 30

  # The card provider: answers every charge after 100 ms.
  payments:
    image: wiremock/wiremock:3.13.1
    command: ["--global-response-templating", "--no-request-journal",
              "--container-threads=400"]
    volumes:
      - ./stub:/home/wiremock
    ports:
      - "8090:8080"
    cpus: 2
    mem_limit: 1g

  app:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/shop
      PAYMENTS_URL: http://payments:8080
      SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE: ${POOL:-10}
      CHECKOUT_MODE: ${MODE:-pay-inside}
    ports:
      - "8080:8080"
    cpus: 2
    mem_limit: 1g
```

`bin/run.sh` restarts the app with the pool size and checkout for that run,
warms it up for 15 seconds, empties the orders table, then runs the sale for
60 seconds. While it runs it samples the app's own metrics every 2 seconds,
and at the midpoint it takes one thread dump and one snapshot of what every
Postgres session is waiting for.

## The result

`evidence/runs/a-pool10-inside-1/summary.txt`:

```text
pool=10 mode=pay-inside buy=20/s browse=200/s duration=60s 2026-10-09T07:05:44Z
  order  med 24.4s  p99 48.4s  max 51.2s  failed 0.0%
  browse med 23.7s  p99 47.6s  max 50.2s  failed 0.0%
  completed requests 9154  (101/s)   never started (dropped) 216
  paid orders in database 834
  peak: connections in use 10.0  threads waiting for one 188.0
        tomcat busy threads 200.0  app cpu 29%
```

Line by line:

- **Checkout:** median 24.4 seconds, p99 48.4 seconds. Nothing failed. It was
  just slow.
- **Browsing:** median 23.7 seconds, for a product nobody is fighting over.
- **Throughput:** 101 completed requests a second, against 220 a second
  arriving. The app finished fewer than half of what came in.
- **Dropped:** 216 requests never started, because the load generator ran out
  of free virtual users to send them. That is k6 hitting its own ceiling, not
  the app refusing anything.
- **Paid orders:** 834 in the database, from a sale that asked for 1,200 in
  the 60 seconds.
- **Peak:** all 10 pool connections in use, 188 threads waiting for one, all
  200 Tomcat threads busy, and the app's CPU at 29%.

All 200 request threads busy and the CPU mostly idle means the threads are
not working. They are waiting for something. The next two files say what.

## Where the time goes

At the midpoint of the run, `bin/run.sh` takes a thread dump from the
actuator, and `bin/threads.py` sorts each Tomcat request thread by the first
recognisable frame on its stack: borrowing a Hikari connection, inside the
Postgres driver, or inside the payment call.

`evidence/runs/a-pool10-inside-1/threads.txt`:

```text
tomcat request threads: 200
   189  waiting for a database connection
     9  waiting on Postgres
     1  waiting for the card provider
     1  taking this thread dump
```

Ten connections in the pool, and they account for ten threads: nine inside a
database call, and one inside the card provider call, still holding its
connection because its transaction is still open. The other 189 threads do
not even have a connection. They are parked in Hikari, waiting to borrow one.
The dump does not split them by endpoint, but with ten browsers arriving
for every buyer, browsers queue there too, behind buyers, for a connection
they would need for a millisecond to read one row of an unrelated product.

At the same moment, the snapshot of `pg_stat_activity` grouped every session
by its wait event and state.

`evidence/runs/a-pool10-inside-1/pg-waits.txt`:

```text
Lock:transactionid active|8
Client:ClientRead idle in transaction|1
cpu:- active|1
Lock:tuple active|1
```

Read it against the thread dump:

- **`Lock:transactionid`, 8, and `Lock:tuple`, 1.** Nine sessions are running
  a statement and waiting for a lock. Waiting on a `transactionid` means
  waiting for another transaction to finish, because it holds the row this
  statement wants to change. These are the nine threads "waiting on
  Postgres": buyers, each stuck in `takeOne` on product 1.
- **`Client:ClientRead`, `idle in transaction`, 1.** One session has an open
  transaction and is not running anything. It is waiting for the client to
  send the next statement. That is the buyer who took the lock, and its Java
  thread is the one "waiting for the card provider". The database is idle,
  holding the row, while the app waits on someone else's API.
- **`cpu:- active`, 1.** A session running with no wait event: the snapshot
  query itself.

So the queue has three layers. One buyer holds the row lock through a 100 ms
network call. Nine buyers hold the other nine connections while they wait for
that lock. Everyone else, buyers and browsers alike, waits for a connection.
The browsers never needed the lock. They lost because they share a pool with
requests that hold connections while they wait for it.

## The queue, measured

The 60 second run shows the queue at its worst. `bin/timeline.py` shows it
being born. It sends twenty orders for product 1 at the same instant, then
one product page view 50 ms later, and records when each request started and
ended.

`evidence/timeline-pay-inside.txt`:

```text
kind    n  start_s  end_s  took_ms  status
order    0    0.000  0.616      616  200
order    1    0.000  0.849      849  200
order    2    0.000  1.848     1847  200
order    3    0.001  1.405     1404  200
order    4    0.001  1.074     1073  200
order    5    0.001  0.503      502  200
order    6    0.001  1.298     1297  200
order    7    0.001  0.727      726  200
order    8    0.001  2.305     2304  200
order    9    0.001  0.392      391  200
order   10    0.001  0.961      960  200
order   11    0.001  1.740     1739  200
order   12    0.001  2.183     2182  200
order   13    0.001  1.954     1953  200
order   14    0.001  1.516     1515  200
order   15    0.001  1.185     1183  200
order   16    0.001  2.071     2070  200
order   17    0.001  0.173      172  200
order   18    0.001  1.633     1631  200
order   19    0.001  0.281      279  200
browse   0    0.054  0.280      226  200
```

All twenty orders started within 1 ms of each other. Sort them by when they
ended: 0.173, 0.281, 0.392, 0.503, 0.616, 0.727, 0.849, 0.961, 1.074, 1.185,
1.298, 1.405, 1.516, 1.633, 1.740, 1.848, 1.954, 2.071, 2.183, 2.305 seconds.
One at a time, about 110 ms apart. That is the 100 ms payment call plus a few
milliseconds of database work, repeated twenty times in a row. The last buyer
waited 2.3 seconds for a checkout that takes about 110 ms on its own.

The one product page, sent 50 ms after the burst, took 226 ms to read one row
of an unrelated product.

Now scale that up. One order every 110 ms means at most about nine orders a
second can finish, while twenty a second arrive. The line grows by roughly
eleven buyers every second the sale lasts, and every one of them holds a
thread, and most of them sit in the pool queue in front of the browsers. That
is how a queue of tens of seconds builds up inside a one minute sale. This
paragraph is arithmetic on the measured spacing, not a separate measurement.

## Five times the connections

The usual first response to "threads waiting for a database connection" is a
bigger pool. Here is the same sale with the Hikari pool raised from 10 to 50.

`evidence/runs/b-pool50-inside-1/summary.txt`:

```text
pool=50 mode=pay-inside buy=20/s browse=200/s duration=60s 2026-10-09T07:07:41Z
  order  med 24.2s  p99 49.5s  max 55.1s  failed 0.0%
  browse med 20.4s  p99 46.4s  max 48.0s  failed 0.0%
  completed requests 9479  (105/s)   never started (dropped) 18
  paid orders in database 833
  peak: connections in use 50.0  threads waiting for one 149.0
        tomcat busy threads 200.0  app cpu 28%
```

Checkout: 24.2 seconds instead of 24.4. Paid orders: 833 instead of 834.
Browsing improved a little, from 23.7 to 20.4 seconds, which is still twenty
seconds to show a product page. All 50 connections in use, 149 threads still
waiting for one, all 200 Tomcat threads busy.

Postgres says where the extra 40 connections went.

`evidence/runs/b-pool50-inside-1/pg-waits.txt`:

```text
Lock:transactionid active|48
Client:ClientRead idle in transaction|1
cpu:- active|1
Lock:tuple active|1
```

`evidence/runs/b-pool50-inside-1/threads.txt`:

```text
tomcat request threads: 200
   149  waiting for a database connection
    49  waiting on Postgres
     1  waiting for the card provider
     1  taking this thread dump
```

Forty nine sessions waiting on a lock instead of nine, and still exactly one
session `idle in transaction`, holding the row while its thread waits for the
card provider. The extra connections did not add capacity. They gave more
buyers a place to wait on the same row. Only one transaction at a time can
hold that row, and it holds it for the length of a network call, so the rate
at which orders finish does not move.

To be fair to the pool: a bigger pool genuinely helps other workloads, where
the requests waiting for a connection would each do useful, independent work
once they got one. It does not fix a hot row. When the bottleneck is one lock
held across a slow call, more connections are more waiters.

## The fix

The payment call has to come out of the transaction. `PayAfterCommit` does
the checkout in three steps:

1. A short transaction takes the stock and records the order as `RESERVED`,
   then commits. The row lock is released here.
2. The card provider is called with no database connection and no lock held.
   The idempotency key is `order-<id>`, built from the order that was just
   committed, so this charge can always be found again.
3. A second short transaction marks the order `PAID` with the provider's
   reference.

`src/main/java/dev/example/flashsale/PayAfterCommit.java`:

```java
package dev.example.flashsale;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Reserve the stock and commit, then call the card provider with no
 * connection and no lock held, then record the payment in a second short transaction.
 */
@Service
@ConditionalOnProperty(name = "checkout.mode", havingValue = "pay-after-commit")
public class PayAfterCommit implements Checkout {

    private final ProductRepository products;
    private final OrderRepository orders;
    private final PaymentGateway payments;
    private final TransactionTemplate tx;

    public PayAfterCommit(ProductRepository products, OrderRepository orders,
                          PaymentGateway payments, TransactionTemplate tx) {
        this.products = products;
        this.orders = orders;
        this.payments = payments;
        this.tx = tx;
    }

    @Override
    public OrderPlaced placeOrder(OrderRequest request) {
        record Reserved(long orderId, int amount) {
        }
        Reserved reserved = tx.execute(status -> {
            if (!products.takeOne(request.productId())) {
                throw new SoldOut(request.productId());
            }
            int amount = products.price(request.productId());
            long orderId = orders.insert(request.productId(), request.customer(),
                    amount, "RESERVED");
            return new Reserved(orderId, amount);
        });
        String ref = payments.charge("order-" + reserved.orderId(), request.customer(),
                reserved.amount());
        tx.executeWithoutResult(status -> orders.markPaid(reserved.orderId(), ref));
        return new OrderPlaced(reserved.orderId(), request.productId(), ref);
    }
}
```

Note what is not here: there is no `@Transactional` on `placeOrder`. A
`TransactionTemplate` makes the two transaction boundaries visible in the
method body, so nobody reading it can miss that the payment sits between
them. Annotating the method would wrap the payment straight back into one
long transaction.

`takeOne` is the same conditional `UPDATE` as before. The lock is the same.
What changed is how long it is held: the length of three quick statements,
not the length of a network call.

`markPaid` is a plain update by primary key.

`src/main/java/dev/example/flashsale/OrderRepository.java` (excerpt):

```java
    public void markPaid(long orderId, String paymentRef) {
        db.sql("UPDATE orders SET status = 'PAID', payment_ref = :ref WHERE id = :id")
                .param("ref", paymentRef)
                .param("id", orderId)
                .update();
    }
```

## The result

Same sale, same pool of 10 connections, same 2 CPUs.

`evidence/runs/c-pool10-after-1/summary.txt`:

```text
pool=10 mode=pay-after-commit buy=20/s browse=200/s duration=60s 2026-10-09T07:09:39Z
  order  med 106ms  p99 126ms  max 156ms  failed 0.0%
  browse med 1ms  p99 9ms  max 65ms  failed 0.0%
  completed requests 13202  (219/s)   never started (dropped) 0
  paid orders in database 1201
  peak: connections in use 1.0  threads waiting for one 0.0
        tomcat busy threads 5.0  app cpu 27%
```

Checkout: 106 ms at the median, which is the 100 ms payment call plus a few
milliseconds of database work. Browsing: 1 ms. The app kept up with
everything that arrived, nothing was dropped, and every order the load
generator sent, 1,201 of them, is in the database as `PAID`. At the peak
sample, five Tomcat threads were busy and nobody was waiting for a connection.

The thread dump and the lock snapshot from the same run are almost empty.

`evidence/runs/c-pool10-after-1/threads.txt`:

```text
tomcat request threads: 29
    26  idle
     2  waiting for the card provider
     1  taking this thread dump
```

`evidence/runs/c-pool10-after-1/pg-waits.txt`:

```text
Client:ClientRead idle|10
cpu:- active|1
```

Two threads were in the middle of a payment, and neither held a connection.
All ten pool connections were `idle`, not `idle in transaction`. No session
was waiting on a lock.

The burst tells the same story.

`evidence/timeline-pay-after-commit.txt`:

```text
kind    n  start_s  end_s  took_ms  status
order    1    0.000  0.166      166  200
order    2    0.000  0.174      174  200
order    3    0.000  0.165      164  200
order    4    0.001  0.160      160  200
order    0    0.001  0.160      160  200
order    5    0.001  0.170      169  200
order    6    0.001  0.177      177  200
order    7    0.001  0.179      178  200
order    8    0.001  0.175      174  200
order    9    0.001  0.172      171  200
order   10    0.001  0.160      159  200
order   11    0.001  0.179      178  200
order   12    0.001  0.177      176  200
order   14    0.001  0.164      163  200
order   13    0.001  0.168      166  200
order   15    0.001  0.169      168  200
order   16    0.001  0.162      161  200
order   17    0.001  0.162      161  200
order   18    0.001  0.183      182  200
order   19    0.002  0.176      174  200
browse   0    0.052  0.067       15  200
```

All twenty orders finished between 0.160 and 0.183 seconds after the burst
began: 23 ms from the first to the last. They still take the same row lock one at a time, but
each holds it for a few milliseconds, so the payments run side by side
instead of in a line. The product page took 15 ms instead of 226.

## What the fix costs

The first version had one comforting property: if anything failed, the whole
transaction rolled back. The fix gives that up, and it is worth being exact
about what replaces it.

After the first commit, the stock is taken and the order exists as
`RESERVED`. Then the card is charged. If the `markPaid` write fails after
that, for example because the database is unreachable for a moment, the
customer has been charged and the order still says `RESERVED`. One test
forces exactly that.

`src/test/java/dev/example/flashsale/PayAfterCommitTest.java`:

```java
package dev.example.flashsale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

@SpringBootTest(properties = "checkout.mode=pay-after-commit")
class PayAfterCommitTest extends CheckoutContract {

    @MockitoSpyBean OrderRepository orders;

    @Test
    void isTheCheckoutInUse() {
        assertThat(checkout).isInstanceOf(PayAfterCommit.class);
    }

    @Test
    void chargedButNotRecordedLeavesAReservedOrderToReconcile() {
        doThrow(new DataAccessResourceFailureException("database went away"))
                .when(orders).markPaid(anyLong(), anyString());

        var order = new OrderRequest(1, "Sarah Thompson");
        assertThatThrownBy(() -> checkout.placeOrder(order))
                .isInstanceOf(DataAccessResourceFailureException.class);

        long id = db.sql("SELECT id FROM orders").query(Long.class).single();
        assertThat(db.sql("SELECT status FROM orders WHERE id = :id").param("id", id)
                .query(String.class).single()).isEqualTo("RESERVED");
        assertThat(stock()).isEqualTo(2);
        verify(payments).charge(eq("order-" + id), eq("Sarah Thompson"), eq(2999));
    }
}
```

What the test proves, and it passes:

- The order stays `RESERVED`.
- The stock stays taken: 2 of the 3 left.
- The card was charged $29.99 with the key `order-<id>`, so the charge can be
  matched to the order.

That leaves a job to do. Something has to find orders that have sat in
`RESERVED` for too long, ask the provider what happened to the charge with
key `order-<id>`, and then either mark the order `PAID` or release the stock
and cancel it. That is a reconciliation job, and **the repository does not
contain one**. The test proves the state it would have to handle, and the
stable key is what makes it possible, but the job itself is not built here.
Anyone shipping this pattern needs to build it.

It is not only for the failed write. A declined card and a provider timeout
leave the same kind of order behind: stock reserved, outcome either known to
be "no" or not known at all. In this repository a declined card or a timeout
throws out of `placeOrder` after the first commit, so the order stays
`RESERVED` and the stock stays taken until something releases it. That is
from reading the code; there is no test for those two cases.

And here is the uncomfortable part. The first version had this problem too.
Its transaction looked atomic, but the charge was never inside it. If the
provider charged the card and the insert after it failed, the transaction
rolled back the stock and the order, and the money stayed charged, with a
random UUID as its key that nothing in the database remembers. If the
provider timed out after charging, the same. The long transaction did not
prevent the disagreement. It hid it, and threw away the only way to find it.

There is no transaction that spans your database and someone else's payment
API. Whichever version you choose, a charge and a database row can disagree.
The fixed version says so out loud, keeps a record of every order whose
payment is in flight, and gives each charge a key that can be looked up.

## Five times the load

How far does the fixed checkout go on the same two CPUs? The same sale at
five times the rate: 100 orders and 1,000 product views a second, with 200
pre-allocated load users.

`evidence/runs/cap-after-100/summary.txt`:

```text
pool=10 mode=pay-after-commit buy=100/s browse=1000/s duration=60s 2026-10-09T07:55:51Z
  order  med 103ms  p99 141ms  max 221ms  failed 0.0%
  browse med 1ms  p99 16ms  max 73ms  failed 0.0%
  completed requests 66008  (1098/s)   never started (dropped) 0
  paid orders in database 6001
  peak: connections in use 1.0  threads waiting for one 0.0
        tomcat busy threads 13.0  app cpu 98%
```

1,098 requests a second. Checkout median 103 ms, p99 141 ms. All 6,001 orders
paid, nothing dropped, still nobody waiting for a connection. The app's CPU
peaked at 98%. The limit is no longer a lock. It is compute, which is the
kind of limit more hardware actually fixes.

One honest note on this run. With 6,000 pre-allocated load users at this
rate, instead of 200, the run on this machine failed: over half the
checkouts errored, with the app timing out while connecting to the payment
stub. That run is kept in `evidence/runs/cap-after-100-pre6000-failed/`. We
have not established why, so we draw no conclusion from it.

## Threads are not connections

A common explanation of this kind of stall says Tomcat, with 200 threads and
an accept queue of 100, starts refusing connections after a few hundred. The
thread dump above shows all 200 threads busy, so it is a fair question.
`bin/connections.py` tests it directly: it opens idle TCP connections to the
app and holds them, then sends one real request.

`evidence/connections.txt`:

```text
idle connections held  8100  new connection refused 0  timed out 0  real request -> 200 in 61 ms
idle connections held  8180  new connection refused 0  timed out 0  real request -> 200 in 8 ms
idle connections held  8200  new connection refused 0  timed out 0  real request -> TimeoutError in 10001 ms
idle connections held  8260  new connection refused 0  timed out 0  real request -> TimeoutError in 10001 ms
idle connections held  8300  new connection refused 0  timed out 0  real request -> TimeoutError in 10001 ms
```

With 8,180 idle connections held, a real request answered in 8 ms. With 8,200
held, it hung until the 10 second timeout. That boundary is consistent with
Tomcat's `max-connections` default of 8,192 at the time of writing: the 200
threads limit how many requests run at once, not how many connections Tomcat
accepts. The accept queue only comes into play beyond `max-connections`.

The caveat: this ran through Docker Desktop's port proxy, so what we saw was
a hang, not a refused connection, and we do not claim which layer held the
connection. The measured part is the boundary between 8,180 and 8,200.

## All three setups, three runs each

`bin/matrix.sh` runs each setup three times. The ranges across the three runs,
from `evidence/matrix.txt`:

| | Pool 10, pay inside | Pool 50, pay inside | Pool 10, pay after commit |
|---|---|---|---|
| Checkout, median | 24.4 to 24.6 s | 24.2 to 24.7 s | 106 to 107 ms |
| Checkout, p99 | 48.4 to 48.7 s | 49.5 to 51.1 s | 126 to 179 ms |
| Browsing another product, median | 23.4 to 23.7 s | 20.4 to 20.5 s | 1 to 2 ms |
| Completed requests a second | 100 to 102 | 103 to 105 | 219 to 220 |
| Paid orders | 828 to 835 | 815 to 833 | 1,201 |
| Threads waiting for a connection, peak | 187 to 188 | 148 to 149 | 0 |
| App CPU, peak | 29 to 41% | 28 to 31% | 27 to 39% |

The thread dumps and lock snapshots agree across all three runs of each
setup. Paying inside: one session `idle in transaction` every time, with the
rest of the pool waiting on `Lock:transactionid` or `Lock:tuple`. Paying
after commit: every connection `idle`, nothing waiting on a lock. Each run's
files are in `evidence/runs/`.

## What this does not prove

- **Production capacity.** One laptop, every container limited to 2 CPUs, a
  stub provider with a fixed 100 ms delay. The numbers show the shape of the
  failure and of the fix, not what any real server can do.
- **That the reconciler works.** It does not exist in the repository. The
  test proves the state it must handle, nothing more.
- **That a bigger pool never helps.** It helps when requests waiting for a
  connection have independent work to do. It does not help when they are
  all waiting for the same row.
- **Which layer held the connection at 8,200.** The connections test ran
  through Docker Desktop's port proxy.

## Interview questions this answers

1. When does Postgres release the row lock taken by an `UPDATE`?
2. Why can a slow call inside a transaction make an unrelated read endpoint
   slow?
3. All 200 Tomcat threads are busy and the CPU is at 30%. Where do you look
   first, and what would `pg_stat_activity` show?
4. Why does raising the connection pool from 10 to 50 not help here, and when
   would it help?
5. What does a session in the state `idle in transaction` tell you?
6. If the payment call moves out of the transaction, what can go wrong, and
   what has to exist to handle it?
7. Why should a payment's idempotency key come from your own order id rather
   than a random UUID?

## Run it yourself

All the code is in
[spring-boot-flash-sale](https://github.com/code-with-sam-dev/spring-boot-flash-sale).
You need Docker with Compose v2, Java 25 and Maven (the wrapper is included),
[k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) on the host, and
Python 3 for the run summaries.

```bash
docker compose up -d --build

# Tests: both checkouts against a real Postgres (Testcontainers)
./mvnw test

# One measured run: label, pool size, checkout, orders/s, page views/s, duration
bin/run.sh a-pool10-inside 10 pay-inside       20 200 60s
bin/run.sh b-pool50-inside 50 pay-inside       20 200 60s
bin/run.sh c-pool10-after  10 pay-after-commit 20 200 60s

# The full comparison: the three runs above, three times each
bin/matrix.sh

# How far the fixed checkout goes: five times the load
PRE_VUS=200 bin/run.sh cap-after-100 10 pay-after-commit 100 1000 60s

# One burst, every request timed: twenty orders at once, then one product page
python3 bin/timeline.py

# The tests, one line each
bin/tests.sh

# Does Tomcat refuse connections once its 200 threads are busy? Hold idle connections, then try a real request
python3 bin/connections.py 1000 5000 8100 8180 8200 8300
```

Each run writes `runs/<label>/`: the k6 summary, the app's own metrics every
2 seconds, a thread dump taken at the midpoint, what Postgres sessions were
waiting on at that moment, and the number of paid orders in the database.
`run.sh` pre-allocates 6,000 load users by default, because with too few, k6
runs out of users to send requests and reports them as dropped, which looks
like the app failing when it is not.

Your numbers will differ from these. The shape should not: paying inside the
transaction, a queue of seconds and an idle CPU; paying after the commit, the
length of one payment call.

The free [design sheet](/downloads/spring-boot-transactional-flash-sale.pdf)
has both checkouts, the row lock, the failure test and every measured result
on a few pages you can keep next to your editor.

## In one line

Never hold a database lock, or a connection, while you wait on someone else's
network call: commit first, call out, then record the result, and build the
job that cleans up when the two disagree.
