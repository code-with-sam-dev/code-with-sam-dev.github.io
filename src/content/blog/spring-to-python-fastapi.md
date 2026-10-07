---
title: 'Spring Boot to Python (FastAPI): Where Your Code Runs'
youtube: 'MiKxQV7OZGE'
cover: '/covers/spring-to-python-fastapi.jpg'
description: 'One payments service built twice, in Spring Boot and in FastAPI, layer for layer. A Spring developer''s instinct is right about the shape of the code and wrong about where it runs: types, def against async def, AnyIO''s thread limit, object lifetime, a 201 with no row behind it, background work and worker processes, each measured on both stacks.'
pubDate: 2026-10-07
sheet: '/downloads/spring-to-python-fastapi.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-python'
tags: ['spring-boot', 'python', 'fastapi', 'java']
series: 'Spring Boot to Other Stacks'
duration: '14:40'
draft: false
---

A payments endpoint in FastAPI. It calls a payment provider that takes two
seconds to answer. Ten customers pay at the same time, and ten payments take
two seconds:

```text
$ load http://127.0.0.1:8099 /payments 10 --body "$PAYMENT"
10 payments in 2.1 s, /health answered in 0.0 s, status codes {201: 10}
```

Now change one word. Put `async` in front of `def`:

```python
@router.post("/payments", status_code=201)
async def create(
    new: NewPayment,
    tasks: BackgroundTasks,
    service: PaymentService = Depends(payment_service),
    receipt_sender: Receipts = Depends(receipts),
) -> Payment:
    payment = service.create(new)
    tasks.add_task(receipt_sender.send, payment.id)
    return payment
```

```text
$ load http://127.0.0.1:8099 /payments 10 --body "$PAYMENT"
10 payments in 20.32 s, /health answered in 18.08 s, status codes {201: 10}
```

Twenty seconds. And a health check that has nothing to do with payments waited
eighteen seconds for an answer. If that health check is your liveness probe and
it fails often enough, the pod is restarted, even though the real problem is a
blocked event loop.

The same code in Spring Boot, against the same provider:

```text
$ load http://127.0.0.1:8098 /payments 10 --body "$SPRING_PAYMENT"
10 payments in 2.26 s, /health answered in 0.0 s, status codes {201: 10}
```

A Spring developer's instinct is right about the shape of this code. It is
wrong about where it runs. This article is the written version of the episode.
It explains why one word did that, and the other places where the Spring mental
model stops transferring: types, threads, object lifetimes, transactions,
background work and processes.

Everything here ran for real, on one machine. Every number, status code and
log line quoted below is copied from the transcripts in the repository's
`evidence/` folder, and one script, `scripts/verify.sh`, reproduces all of
them. The last section shows how.

## Versions, at the time of writing

At the time of writing, in October 2026: Python 3.14.8, FastAPI 0.142.2,
Pydantic 2.13.5, Uvicorn 0.54.0, SQLAlchemy 2.1.4, psycopg 3.3.6 and httpx
0.28.1, against Spring Boot 4.1.1 on Java 25 (OpenJDK 25.0.4), with PostgreSQL
17. The run records them in `evidence/versions.log`. FastAPI is still before
version 1.0, so expect it to move. Check the release notes for the versions you
are actually running.

## The application, built twice

The same small payments service, layer for layer:

| | Spring Boot | FastAPI |
| --- | --- | --- |
| Web layer | `PaymentController` | `payments/api.py`, a router |
| Service | `PaymentService`, `@Transactional` | `payments/service.py` |
| Pricing | `Pricing` | `payments/pricing.py`, a function |
| Provider client | `ProviderClient`, `RestClient` | `payments/provider.py`, `httpx` |
| Store | `PaymentStore`, `JdbcClient` | `payments/store.py`, SQLAlchemy |
| Receipts | `ReceiptService`, `@Async` | `payments/receipts.py`, `BackgroundTasks` |
| Validation | Bean Validation | Pydantic |

Same SQL, same business rules, the same provider, and equivalent tests. The
provider is a small stub that answers a charge in two seconds and counts the
connections it was called on. What changes is the stack, so the Spring and
FastAPI choices can sit side by side.

## Types: these look like Java types. They are not

The first thing a Java developer reads. A pricing function, on each side:

```java
// Spring: Pricing.java
@Component
public class Pricing {

    public long total(long unitPrice, int quantity) {
        return unitPrice * quantity;
    }
}
```

```python
# FastAPI: payments/pricing.py
def total(unit_price: int, quantity: int) -> int:
    return unit_price * quantity
```

Call it with the string `"5"` and the number `3`. Java refuses to compile:

```text
experiments/TypesChecked.java:10: error: incompatible types: String cannot be converted to long
        System.out.println(total("5", 3));
                                 ^
```

Python runs it, and multiplying a string repeats it:

```text
$ PYTHONPATH=fastapi-payments python experiments/types_checked.py
'555'
```

Those annotations are not checked when the code runs. They are read by tools.
Run mypy, and it rejects the call:

```text
$ MYPYPATH=fastapi-payments mypy experiments/types_checked.py
experiments/types_checked.py:3: error: Argument 1 to "total" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

So in Python, static type checking is a tool you choose to run. The runtime
does not enforce this annotation the way the Java compiler enforces that
parameter type. Put mypy in the build, the way you would never ship Java
without `javac`.

## At the API boundary: 422, not 400

At the edge of the API, FastAPI and Pydantic do use those annotations. Pydantic
turns the request body into a typed object, with its normal (lax) coercion
rules, and checks the constraints we declared. The two request models:

```java
// Spring: NewPayment.java
public record NewPayment(
        @NotBlank String orderRef,
        @Positive long unitPrice,
        @Positive int quantity,
        @Size(min = 3, max = 3) String currency) {
}
```

```python
# FastAPI: payments/schemas.py
class NewPayment(BaseModel):
    order_ref: str = Field(min_length=1)
    unit_price: int = Field(gt=0)
    quantity: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
```

Lax mode is visible on the wire. Send the unit price as the string `"5"`,
and Pydantic turns it into the number 5 before the service ever sees it:

```text
$ curl -s -w ' HTTP %{http_code}\n' -X POST http://127.0.0.1:8099/payments -H 'content-type: application/json' -d "$STRING_FIVE"
{"id":22,"order_ref":"order-5","total":15,"currency":"GBP","status":"CAPTURED"} HTTP 201
```

A total of 15, not `'555'`: the annotation did nothing inside `total`, but at
the boundary Pydantic used it. Now send a negative unit price to each:

```text
{"detail":[{"type":"greater_than","loc":["body","unit_price"],"msg":"Input should be greater than 0","input":-5,"ctx":{"gt":0}}]}
HTTP 422

{"timestamp":"2026-10-07T19:26:45.903Z","status":400,"error":"Bad Request","path":"/payments"}
HTTP 400
```

FastAPI answers 422. Spring answers 400. The body is a different shape too. If
you are porting a service, that is a change to your API contract, and every
client that checks for a 400 will notice.

## def or async def decides the thread

Now the hook. Why did one word make it ten times slower?

Spring MVC gives every request a thread from Tomcat's pool. A blocking call
blocks that one thread, and the others carry on.

A Uvicorn worker has an event loop, running many requests on one thread. An
`async def` function gives other work a turn only when it reaches an `await`
that can yield control. The provider client is the blocking `httpx` client, and
there is no `await` around that call:

```python
# FastAPI: payments/provider.py
class ProviderClient:
    """The payment provider, over a blocking client."""

    def __init__(self, base_url: str):
        self.http = httpx.Client(base_url=base_url,
                                 timeout=10)

    def charge(self, order_ref: str, amount: int) -> None:
        body = {"order_ref": order_ref, "amount": amount}
        response = self.http.post("/charges", json=body)
        response.raise_for_status()
```

```java
// Spring: ProviderClient.java, also blocking
    public void charge(String orderRef, long amount) {
        http.post().uri("/charges")
                .body(Map.of("order_ref", orderRef,
                        "amount", amount))
                .retrieve().toBodilessEntity();
    }
```

Both clients block. The difference is what they block. In Spring, one request
thread. In `async def`, the event loop thread sits inside the call for two
seconds, so every other request on that loop, the health check included, waits.
Ten payments, one after another: twenty seconds.

To see it with nothing else in the way, `experiments/fastapi_threads.py` has
three versions of the same call:

```python
@app.post("/payments/blocking-in-async")
async def blocking_in_async() -> dict[str, str]:
    with httpx.Client(timeout=30) as client:
        return client.post(f"{PROVIDER}/charges").json()


@app.post("/payments/blocking")
def blocking() -> dict[str, str]:
    with httpx.Client(timeout=30) as client:
        return client.post(f"{PROVIDER}/charges").json()


@app.post("/payments/awaited")
async def awaited() -> dict[str, str]:
    async with httpx.AsyncClient(timeout=30) as client:
        sent = await client.post(f"{PROVIDER}/charges")
        return sent.json()
```

```text
$ load http://127.0.0.1:8096 /payments/blocking-in-async 10
10 payments in 20.17 s, /health answered in 19.95 s, status codes {200: 10}

$ load http://127.0.0.1:8096 /payments/awaited 10
10 payments in 2.1 s, /health answered in 0.0 s, status codes {200: 10}

$ load http://127.0.0.1:8096 /payments/blocking 10
10 payments in 2.06 s, /health answered in 0.0 s, status codes {200: 10}
```

For this call there are two clean fixes. A plain `def`: FastAPI sees a function
that is not async and runs it on a worker thread instead of the loop. Or make
the whole call async: the async `httpx` client, and an `await` in front of the
call, so the loop is free while the provider thinks. What you must not do is
put blocking work directly on the event loop.

And because someone will say it: this is an event loop problem, not a GIL
problem. Python 3.14 has an optional free-threaded build, and it does not
rescue blocking code on this loop.

## The 41st request

So plain `def` is safe. Until you count:

```text
$ load http://127.0.0.1:8096 /payments/blocking 40
40 payments in 2.12 s, /health answered in 0.0 s, status codes {200: 40}

$ load http://127.0.0.1:8096 /payments/blocking 41
41 payments in 4.1 s, /health answered in 0.0 s, status codes {200: 41}

$ load http://127.0.0.1:8096 /payments/blocking 100
100 payments in 6.25 s, /health answered in 0.0 s, status codes {200: 100}
```

FastAPI hands plain `def` endpoints to Starlette, which runs them through
AnyIO's thread pool. AnyIO's default limiter allows 40 of them at once. The
41st waits for a free slot. The limit belongs to AnyIO, reached through
Starlette, not to FastAPI itself. Both defaults are recorded in the run:

```text
$ python experiments/limiter_default.py
AnyIO default thread limiter: 40 tokens

Spring Boot 4.1.1, server.tomcat.threads.max default: 200
```

The same endpoint in Spring MVC, on Tomcat's default pool of 200 threads:

```java
// Spring: experiments/spring-threads, ThreadsApplication.java
    @PostMapping("/payments/blocking")
    Map<?, ?> blocking() {
        return provider.post().uri("/charges")
                .retrieve().body(Map.class);
    }
```

```text
$ load http://127.0.0.1:8095 /payments/blocking 40
40 payments in 2.1 s, /health answered in 0.0 s, status codes {200: 40}

$ load http://127.0.0.1:8095 /payments/blocking 41
41 payments in 2.09 s, /health answered in 0.0 s, status codes {200: 41}

$ load http://127.0.0.1:8095 /payments/blocking 100
100 payments in 2.24 s, /health answered in 0.01 s, status codes {200: 100}
```

### Raising the limit

The limit is one line. In the lifespan, take AnyIO's default thread limiter and
set its total tokens:

```python
# FastAPI: overlays/limiter-100, payments/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    limiter = to_thread.current_default_thread_limiter()
    limiter.total_tokens = 100
    app.state.sessions = db.connect()
    app.state.provider = ProviderClient(PROVIDER_URL)
    yield
    app.state.provider.close()
```

```text
$ load http://127.0.0.1:8096 /payments/blocking 40
40 payments in 2.14 s, /health answered in 0.0 s, status codes {200: 40}

$ load http://127.0.0.1:8096 /payments/blocking 41
41 payments in 2.14 s, /health answered in 0.0 s, status codes {200: 41}

$ load http://127.0.0.1:8096 /payments/blocking 100
100 payments in 2.29 s, /health answered in 0.0 s, status codes {200: 100}
```

That proves the limit is configurable. It does not prove 100 is right. Every
extra thread has a cost, the same limiter is shared with your synchronous
dependencies, and another limited resource may simply become the next queue.
That is why these numbers come from `experiments/` and not from the full
payments app: in the full app, each request holds a database connection while
the provider answers, so the connection pool is the first limit you hit.
Raising one limit moves the queue. It does not remove it.

## How long does this object live?

In Spring, singleton is the default bean scope. Within one application context,
ask for the provider client a thousand times and you get the same object:

```java
// Spring: ProviderClient.java
@Component
public class ProviderClient {

    private final RestClient http;

    public ProviderClient(
            @Value("${provider.url}") String url) {
        this.http = RestClient.create(url);
    }
```

In FastAPI, the thing you inject is whatever a dependency function returns.
Write a function that builds a gateway, and FastAPI calls it on every request.
`experiments/lifetime.py` counts:

```python
def gateway() -> PaymentGateway:
    return PaymentGateway("per_request")


def fraud_check(g: PaymentGateway = Depends(gateway)):
    return g


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.gateway = PaymentGateway("lifespan")
    yield
```

```text
$ curl -s -X POST http://127.0.0.1:8096/charge
{"same_object_twice_in_one_request":true,"built":{"per_request":1,"lifespan":1},"pid":6433,"lifespan_object":4425245632}
$ curl -s -X POST http://127.0.0.1:8096/charge
{"same_object_twice_in_one_request":true,"built":{"per_request":2,"lifespan":1},"pid":6433,"lifespan_object":4425245632}
$ curl -s -X POST http://127.0.0.1:8096/charge
{"same_object_twice_in_one_request":true,"built":{"per_request":3,"lifespan":1},"pid":6433,"lifespan_object":4425245632}
```

Three requests, three gateways. Within one request the value is cached: ask
for the same dependency twice and you get the same object. The next request
starts again. The lifespan object is built once.

Usually that does not matter. It matters when the object is expensive. Build
the provider client inside the dependency, and every payment gets a new client
and a new connection:

```python
# FastAPI: overlays/provider-per-request, payments/deps.py
def payment_service(
    request: Request,
    session: Session = Depends(
        get_session, scope="function"
    ),
) -> PaymentService:
    provider = ProviderClient(PROVIDER_URL)
    return PaymentService(PaymentStore(session), provider)
```

Build it once, in the lifespan, and keep it in app state:

```python
# FastAPI: payments/main.py
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.sessions = db.connect()
    app.state.provider = ProviderClient(PROVIDER_URL)
    yield
    app.state.provider.close()
```

Five payments each, counted by the provider:

```text
provider client built per request: {"charges":5,"distinct_connections":5}
provider client built in the lifespan: {"charges":5,"distinct_connections":1}
spring, one ProviderClient bean: {"charges":5,"distinct_connections":1}
```

But notice what "once" means here. Once per process. Run the same experiment
under Uvicorn with four workers:

```text
worker processes seen: 4  lifespan objects seen: 4
```

Hold on to that. It comes back.

## 201 Created, nothing saved

Now the one that loses money. The session comes from a dependency with
`yield`. It opens a session, hands it to the request, and closes it afterwards:

```python
# FastAPI: overlays/no-transaction, payments/deps.py
def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.sessions() as session:
        yield session
```

The store inserts the payment, and the endpoint answers 201. Then look in
Postgres:

```text
{"id":31,"order_ref":"order-42","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201

right after the 201: payments: 0, receipts: 0
five seconds later:    payments: 0, receipts: 1
```

Zero rows, and still zero five seconds later. The receipt was written (it uses
its own transaction), and the payment it refers to does not exist. Closing a
session that was never committed rolls the work back, silently. Nothing failed,
nothing logged, and the client was told it worked.

The fix happens in three steps, and the middle one is the surprise.

### Step 1: add the boundary, SQLAlchemy's session.begin()

SQLAlchemy has a transaction boundary: `session.begin()`. Wrap the session in
it inside the dependency, and the work commits when the block ends:

```python
# FastAPI: overlays/commit-after-response, payments/deps.py
def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.sessions() as session:
        with session.begin():
            yield session


def payment_service(
    request: Request,
    session: Session = Depends(get_session),
) -> PaymentService:
```

### Step 2: the 201 arrives before the commit

Pay again:

```text
{"id":32,"order_ref":"order-42","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201

right after the 201: payments: 0, receipts: 0
five seconds later:    payments: 1, receipts: 1
```

The 201 came back with zero rows in Postgres. Five seconds later, one. FastAPI
is doing exactly what its dependency scope says. Here is the docstring for
`Depends(scope=...)` in the installed FastAPI, printed by
`experiments/scope_doc.py`:

```text
FastAPI 0.142.2, Depends(scope=...):
* `"function"`: start the dependency before the *path operation
  function* that handles the request, end the dependency after the
  *path operation function* ends, but **before** the response is
  sent back to the client. So, the dependency function will be
  executed **around** the *path operation **function***.
* `"request"`: start the dependency before the *path operation
  function* that handles the request (similar to when using
  `"function"`), but end **after** the response is sent back to
  the client. So, the dependency function will be executed
  **around** the **request** and response cycle.
```

A dependency with `yield` defaults to the request scope, so its code after the
`yield`, our commit, runs after the response has been sent. In this run the
commit came after the receipt task as well. A commit that fails at that point
is too late to change the answer the client already has.

### Step 3: function scope commits before the response

The fix is one argument. With `scope="function"`, FastAPI runs the code after
the `yield` when the endpoint function returns, before the response is sent.
This is the repository's correct app:

```python
# FastAPI: payments/deps.py
def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.sessions() as session:
        with session.begin():
            yield session


def payment_service(
    request: Request,
    session: Session = Depends(
        get_session, scope="function"
    ),
) -> PaymentService:
    provider = request.app.state.provider
    return PaymentService(PaymentStore(session), provider)
```

```text
{"id":33,"order_ref":"order-42","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201

right after the 201: payments: 1, receipts: 0
five seconds later:    payments: 1, receipts: 1
```

In Spring, the boundary is declared with `@Transactional`, and it commits when
the service method returns, before the controller answers:

```java
// Spring: PaymentService.java
    @Transactional
    public Payment create(NewPayment in) {
        long amount = pricing.total(
                in.unitPrice(), in.quantity());
        Optional<Long> found = store.find(in.orderRef());
        long id;
        if (found.isEmpty()) {
            provider.charge(in.orderRef(), amount);
            id = store.insert(in, amount);
        } else {
            id = found.get();
        }
        return new Payment(id, in.orderRef(), amount,
                in.currency(), "CAPTURED");
    }
```

```text
{"id":34,"orderRef":"order-42","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201

right after the 201: payments: 1, receipts: 0
five seconds later:    payments: 1, receipts: 1
```

Be fair to both sides here. Spring does not wrap your code in a transaction
either, unless you declare one. And notice who did what in FastAPI: the commit
is SQLAlchemy's, `session.begin()`. When it happens is FastAPI's, the
dependency scope. Session lifetime and transaction commit are separate
decisions, and in FastAPI both of them are yours.

## Work after the response

After the payment, the customer gets a receipt. FastAPI's `BackgroundTasks`
runs it after the response has gone. The closest in-process Spring comparison
is an `@Async` method:

```java
// Spring: ReceiptService.java
    @Async
    public void send(long paymentId)
            throws InterruptedException {
        Thread.sleep(2000);
        jdbc.sql("INSERT INTO receipts (payment_id)"
                        + " VALUES (?)")
                .param(paymentId).update();
    }
```

```python
# FastAPI: payments/receipts.py (excerpt)
    def send(self, payment_id: int) -> None:
        time.sleep(2)
        with self.sessions.begin() as session:
            session.execute(
                text("INSERT INTO receipts (payment_id)"
                     " VALUES (:id)"),
                {"id": payment_id},
            )
```

```python
# FastAPI: payments/api.py (excerpt)
    payment = service.create(new)
    tasks.add_task(receipt_sender.send, payment.id)
    return payment
```

Let the first payment run, and its receipt arrives. Then pay again, and kill
the worker half a second after the 201:

```text
{"id":50,"order_ref":"order-1","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201
not killed, receipts: 1

{"id":51,"order_ref":"order-2","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201
worker killed half a second later, receipts: 1
```

The count stays at one: the second receipt never arrives. The task lived in
that process's memory, and the process is gone.

Spring's in-memory `@Async` does exactly the same. Kill the JVM straight after
the 201:

```text
{"id":52,"orderRef":"order-42","total":1500,"currency":"GBP","status":"CAPTURED"} HTTP 201
spring @Async, JVM killed, receipts: 0
```

Neither of them is a queue. If the work matters, it belongs in something
durable, an outbox table or a message broker, not in the memory of the process
that answered.

## Workers are processes

On one machine, one way to get more out of a FastAPI service is Uvicorn with
`--workers 4`. That is not four threads. It is four processes, each with its
own copy of everything in memory, as the lifespan count above already showed.

Here is a service that remembers which orders it has already charged, in a
dictionary in memory. The same deliberate mistake on both sides:

```java
// Spring: overlays/in-memory-idempotency, PaymentService.java (excerpt)
    private final Map<String, Long> seen =
            new ConcurrentHashMap<>();

        Optional<Long> found = Optional.ofNullable(
                seen.get(in.orderRef()));
        long id;
        if (found.isEmpty()) {
            provider.charge(in.orderRef(), amount);
            id = store.insert(in, amount);
            seen.put(in.orderRef(), id);
```

```python
# FastAPI: overlays/in-memory-idempotency, payments/service.py (excerpt)
seen: dict[str, int] = {}

        found = seen.get(new.order_ref)
        if found is None:
            self.provider.charge(new.order_ref, amount)
            found = self.store.insert(new, amount)
            seen[new.order_ref] = found
```

The same order, `order-42`, sent eight times, one after another, to four
Uvicorn workers:

```text
HTTP 201
HTTP 500
HTTP 201
HTTP 500
HTTP 500
HTTP 500
HTTP 500
HTTP 500

provider: {"charges":7,"distinct_connections":4}
rows in payments: 1
```

The provider charged one order seven times, over four connections, one per
process. Postgres's unique column refused the duplicate rows, so six requests
got a server error after the card had already been charged. The second 201 is
a request that happened to land on the worker that had already inserted the
row: its dictionary remembered the order, so it answered without charging.
Every other process had its own dictionary, and a process only remembers an
order once its insert succeeds.

The same code in one Spring JVM, eight requests:

```text
HTTP 201
HTTP 201
HTTP 201
HTTP 201
HTTP 201
HTTP 201
HTTP 201
HTTP 201

provider: {"charges":1,"distinct_connections":1}
```

Charged once. That is not because
Spring is safer. Run several Spring replicas with in-memory idempotency and you
have exactly the same distributed state problem. The surprise is only that one
Uvicorn flag creates that process boundary on a single machine.

One more honest note: idempotency in both correct services is a lookup
followed by a unique column. Two concurrent requests with the same reference
can both pass the lookup, and the unique column then refuses the second row
after the provider has charged it. Production code reserves the reference
first. These runs send their requests one after another, on purpose.

## The boundary ladder

Everything above, on one ladder:

| Boundary | Spring Boot (MVC) | FastAPI |
| --- | --- | --- |
| **Request**: where the handler runs | a Tomcat request thread | `async def`: the event loop. `def`: an AnyIO worker thread, 40 at once by default |
| **Service**: how long objects live | singleton is the default bean scope | a dependency value is cached for one request; a lifespan value is held for one process |
| **Database**: where the transaction ends | `@Transactional`, commits when the method returns | SQLAlchemy's `session.begin()`; the dependency scope decides when it ends, so use `scope="function"` |
| **Instance**: work after the response | in-memory `@Async` dies with the JVM | `BackgroundTasks` dies with the worker |
| **Scale out**: copies of memory | one per JVM, so one per replica | one per Uvicorn worker, so `--workers 4` is four copies on one host |

FastAPI is not a smaller Spring. Many of the boundaries a Spring developer
expresses through framework defaults and annotations are assembled differently
here. Know which layer owns each boundary, and the code stops being surprising.

## Interview questions this answers

1. What does a blocking call inside `async def` do to the other requests on
   that worker?
2. How many plain `def` requests run at once by default, whose limit is that,
   and what limits you after you raise it?
3. Why might a FastAPI dependency open a new connection on every request, and
   where should the client live instead?
4. What commits a SQLAlchemy session, and when does a `yield` dependency's
   cleanup run relative to the response?
5. Is `BackgroundTasks` a queue? Is `@Async`?
6. What does `--workers 4` do to an in-memory cache or idempotency set?
7. And what does `total("5", 3)` return?

## The repository, and reproducing every number

All the code is in
[spring-to-python](https://github.com/code-with-sam-dev/spring-to-python):

- `spring-payments/` and `fastapi-payments/`: the two services, correct
  versions.
- `overlays/`: one deliberate mistake each (`async-blocking`, `no-transaction`,
  `commit-after-response`, `provider-per-request`, `in-memory-idempotency`,
  `limiter-100`), laid over a scratch copy of an app, never the app itself.
- `experiments/`: small apps that isolate one effect with no database in the
  way: the thread limit, object lifetime, the types and the scope docstring.
- `provider-stub/`: the payment provider that answers in two seconds and
  counts connections.

You need Docker, JDK 25 and Python 3.14:

```bash
python3.14 -m venv .venv
.venv/bin/pip install \
  fastapi==0.142.2 uvicorn==0.54.0 pydantic==2.13.5 httpx==0.28.1 \
  sqlalchemy==2.1.4 "psycopg[binary]==3.3.6" pytest==9.1.1 mypy
scripts/verify.sh
```

`scripts/verify.sh` starts Postgres from `compose.yaml` and the provider stub,
runs both test suites, then measures every claim in this article. Each claim
asserts what it expects and stops the script if it does not hold, so a run
that finishes is a run where every claim held. The transcripts land in
`evidence/`, and every terminal block above is copied from them.

The free [design sheet](/downloads/spring-to-python-fastapi.pdf) has the
boundary ladder, each finding with the Spring and FastAPI code side by side,
the three transaction steps and a checklist for starting a FastAPI service, on
a few pages you can keep next to your editor.
