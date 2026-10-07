/**
 * Spring Boot to Python (FastAPI): Where Your Code Runs. The design sheet.
 *
 * EVERY SNIPPET IS COPIED VERBATIM from github.com/code-with-sam-dev/spring-to-python,
 * from the file named in its caption. Snippets marked "excerpt" are lines taken
 * unchanged, indentation included; an overlay is one deliberate mistake laid
 * over a scratch copy of an app.
 *
 * EVERY RESULT (timing, status code, row count, connection count) is quoted from
 * the repository's evidence/ transcripts, recorded on 2026-10-07 by
 * scripts/verify.sh (repository commit 85f2b03) with Python 3.14.8, FastAPI 0.142.2, Pydantic 2.13.5,
 * Uvicorn 0.54.0, SQLAlchemy 2.1.4, psycopg 3.3.6, Spring Boot 4.1.1 on Java 25
 * and PostgreSQL 17.
 *
 * Code pairs are drawn with {pair: [spring, fastapi]}: Spring on the left,
 * FastAPI on the right, as in the video.
 */
import {CHANNEL_LINKS} from './channel-links.mjs';

const REPO_URL = 'https://github.com/code-with-sam-dev/spring-to-python';

const SRC = {
  EVIDENCE: 'Measured on a real run, 2026-10-07: evidence/ in the repository, reproduced by scripts/verify.sh.',
  SCOPE: 'FastAPI 0.142.2, the Depends(scope=...) docstring, printed by experiments/scope_doc.py into evidence/fastapi-scope.log.',
};

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Your thread just changed.',
  subtitle: 'Spring Boot to Python (FastAPI): where your code runs, on one payments service built twice',
  kicker: 'For Spring developers',
  strapline: 'Your instinct is right about the shape of the code and wrong about where it runs.',
  verifiedOn: '2026-10-07',

  intro: [
    'One small payments service, built twice, layer for layer: a Spring Boot controller, service, pricing component, provider client and store, against a FastAPI router, service, pricing function, httpx provider client and SQLAlchemy store. Same SQL, same rules, the same slow payment provider.',
    'Spring MVC gives you strong defaults for where your code runs, how long your objects live and where your transactions start. FastAPI makes each of those boundaries explicit, and one keyword, def or async def, decides which thread your request runs on.',
    'At the time of writing, October 2026: Python 3.14.8, FastAPI 0.142.2 (still before 1.0), Pydantic 2.13.5, Uvicorn 0.54.0, SQLAlchemy 2.1.4 and psycopg 3.3.6, against Spring Boot 4.1.1 on Java 25. Newer versions may differ.',
  ],

  scope: {
    inTitle: 'This service exercised',
    in: [
      'Type hints against Java types, and validation at the API boundary',
      'def against async def, and AnyIO\'s thread limit',
      'Dependency lifetime, lifespan objects and worker processes',
      'SQLAlchemy transactions inside a FastAPI dependency, and BackgroundTasks',
    ],
    outTitle: 'Not covered',
    out: [
      'Alembic migrations, settings and testing patterns',
      'SQLAlchemy\'s async engine',
      'Footprint and startup comparisons',
      'Gunicorn, containers and Kubernetes tuning',
    ],
    note: 'Every mistake is an overlay in the repository, laid over a scratch copy of an app, and scripts/verify.sh measures all of them on your machine.',
  },

  scale: {
    title: 'The boundary ladder',
    note: 'Measured, not asserted: AnyIO\'s default limiter is 40 tokens and Tomcat\'s default is 200 threads (evidence/defaults.log); 40 blocking def calls took 2.12 s and the 41st took 4.1 s; a dependency was built once per request, a lifespan object once per process; four workers, four copies of memory.',
    rows: [
      ['Request: where the handler runs', 'Spring: a Tomcat request thread (200 by default). FastAPI: async def on the event loop, def on an AnyIO thread (40 at once by default)'],
      ['Service: how long objects live', 'Spring: singleton bean by default. FastAPI: a dependency per request, a lifespan object per process'],
      ['Database: where the transaction ends', 'Spring: @Transactional, when the method returns. FastAPI: SQLAlchemy session.begin(), ended by the dependency scope'],
      ['Instance: work after the response', 'Spring: in-memory @Async dies with the JVM. FastAPI: BackgroundTasks dies with the worker'],
      ['Scale out: copies of memory', 'Spring: one per JVM, so one per replica. FastAPI: one per Uvicorn worker, --workers 4 is four'],
    ],
  },

  sections: [
    {
      id: 'hook',
      title: 'One word. Ten times slower.',
      body: [
        'Both provider clients block for the two seconds the provider takes. In Spring that blocks one request thread. Inside async def it blocks the event loop, so every other request on that worker waits, the health check included.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: ProviderClient.java (excerpt)', lines: [
            '    public void charge(String orderRef, long amount) {',
            '        http.post().uri("/charges")',
            '                .body(Map.of("order_ref", orderRef,',
            '                        "amount", amount))',
            '                .retrieve().toBodilessEntity();',
            '    }',
          ]},
          {caption: 'FastAPI: overlays/async-blocking, payments/api.py (excerpt)', lines: [
            '@router.post("/payments", status_code=201)',
            'async def create(',
            '    new: NewPayment,',
            '    tasks: BackgroundTasks,',
            '    service: PaymentService = Depends(payment_service),',
            '    receipt_sender: Receipts = Depends(receipts),',
            ') -> Payment:',
            '    payment = service.create(new)',
          ]},
        ]},
        {caption: 'Ten payments at once (evidence/hook-*.log)', lines: [
          'FastAPI, async def:  10 payments in 20.32 s, /health answered in 18.08 s, status codes {201: 10}',
          'FastAPI, def:        10 payments in 2.1 s, /health answered in 0.0 s, status codes {201: 10}',
          'Spring:              10 payments in 2.26 s, /health answered in 0.0 s, status codes {201: 10}',
        ], note: 'The labels on the left are added; each result is copied from its own transcript.'},
      ],
      claims: [
        {text: 'A blocking client inside async def: 10 payments 20.32 s, /health 18.08 s. The same endpoint as def: 2.1 s. Spring RestClient against the same provider: 2.26 s.', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'types',
      title: 'These look like Java types. They are not.',
      body: [
        'Python annotations are read by tools, not enforced when the code runs. Run mypy in the build. At the HTTP boundary, Pydantic does use them, and the error is a 422, not Spring\'s 400: a change to your API contract if you are porting a service.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: Pricing.java (excerpt)', lines: [
            '    public long total(long unitPrice, int quantity) {',
            '        return unitPrice * quantity;',
            '    }',
          ]},
          {caption: 'FastAPI: payments/pricing.py', lines: [
            'def total(unit_price: int, quantity: int) -> int:',
            '    return unit_price * quantity',
          ]},
        ]},
        {caption: 'total("5", 3) on each side (evidence/types.log, excerpt)', lines: [
          'experiments/TypesChecked.java:10: error: incompatible types: String cannot be converted to long',
          '',
          '$ PYTHONPATH=fastapi-payments python experiments/types_checked.py',
          '\'555\'',
          '',
          'experiments/types_checked.py:3: error: Argument 1 to "total" has incompatible type "str"; expected "int"  [arg-type]',
        ]},
        {pair: [
          {caption: 'Spring: NewPayment.java (excerpt)', lines: [
            'public record NewPayment(',
            '        @NotBlank String orderRef,',
            '        @Positive long unitPrice,',
            '        @Positive int quantity,',
            '        @Size(min = 3, max = 3) String currency) {',
            '}',
          ]},
          {caption: 'FastAPI: payments/schemas.py (excerpt)', lines: [
            'class NewPayment(BaseModel):',
            '    order_ref: str = Field(min_length=1)',
            '    unit_price: int = Field(gt=0)',
            '    quantity: int = Field(gt=0)',
            '    currency: str = Field(min_length=3, max_length=3)',
          ]},
        ]},
        {caption: 'The string "5" for unit_price (evidence/validation-coercion.log)', lines: [
          '{"id":22,"order_ref":"order-5","total":15,"currency":"GBP","status":"CAPTURED"} HTTP 201',
        ], note: 'Pydantic\'s lax mode turned "5" into 5 at the boundary: a total of 15, not \'555\'.'},
        {caption: 'A negative unit price (evidence/validation.log)', lines: [
          '{"detail":[{"type":"greater_than","loc":["body","unit_price"],"msg":"Input should be greater than 0","input":-5,"ctx":{"gt":0}}]}',
          'HTTP 422',
          '',
          '{"timestamp":"2026-10-07T19:26:45.903Z","status":400,"error":"Bad Request","path":"/payments"}',
          'HTTP 400',
        ]},
      ],
      claims: [
        {text: 'javac refuses total("5", 3); Python returns \'555\'; mypy rejects it. Through the API, "5" becomes 5 and the total is 15. An invalid body is 422 in FastAPI and 400 in Spring.', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'loop',
      title: 'def or async def decides the thread',
      body: [
        'Two clean fixes: a plain def, which FastAPI runs on a worker thread instead of the loop, or an async client with an await, which frees the loop while the provider thinks. What you must not do is put blocking work directly on the event loop. This is an event loop problem, not a GIL one: Python 3.14\'s optional free-threaded build does not rescue it.',
      ],
      code: [
        {pair: [
          {caption: 'FastAPI: experiments/fastapi_threads.py (excerpt), fix one', lines: [
            '@app.post("/payments/blocking")',
            'def blocking() -> dict[str, str]:',
            '    with httpx.Client(timeout=30) as client:',
            '        return client.post(f"{PROVIDER}/charges").json()',
          ]},
          {caption: 'FastAPI: experiments/fastapi_threads.py (excerpt), fix two', lines: [
            '@app.post("/payments/awaited")',
            'async def awaited() -> dict[str, str]:',
            '    async with httpx.AsyncClient(timeout=30) as client:',
            '        sent = await client.post(f"{PROVIDER}/charges")',
            '        return sent.json()',
          ]},
        ]},
        {caption: 'Ten calls each, no database in the way (evidence/threads-fastapi.log, excerpt)', lines: [
          '$ load http://127.0.0.1:8096 /payments/blocking-in-async 10',
          '10 payments in 20.17 s, /health answered in 19.95 s, status codes {200: 10}',
          '$ load http://127.0.0.1:8096 /payments/awaited 10',
          '10 payments in 2.1 s, /health answered in 0.0 s, status codes {200: 10}',
          '$ load http://127.0.0.1:8096 /payments/blocking 10',
          '10 payments in 2.06 s, /health answered in 0.0 s, status codes {200: 10}',
        ]},
      ],
      claims: [
        {text: 'Blocking in async def: 20.17 s. Awaited AsyncClient: 2.1 s. Plain def: 2.06 s.', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'limit',
      title: 'Forty took two seconds. Forty one took four.',
      body: [
        'FastAPI hands plain def endpoints to Starlette, which runs them on AnyIO\'s thread pool, and AnyIO\'s default limiter allows 40 at once. The limit is AnyIO\'s, not FastAPI\'s. It is one line to raise, but the same limiter is shared with your synchronous dependencies, and in the full app the database connection pool is the next queue. Raising one limit moves the queue. It does not remove it.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: experiments/spring-threads (excerpt)', lines: [
            '    @PostMapping("/payments/blocking")',
            '    Map<?, ?> blocking() {',
            '        return provider.post().uri("/charges")',
            '                .retrieve().body(Map.class);',
            '    }',
          ]},
          {caption: 'FastAPI: overlays/limiter-100, payments/main.py (excerpt)', lines: [
            '@asynccontextmanager',
            'async def lifespan(app: FastAPI):',
            '    limiter = to_thread.current_default_thread_limiter()',
            '    limiter.total_tokens = 100',
          ]},
        ]},
        {caption: 'The two defaults, read from the installed versions (evidence/defaults.log)', lines: [
          'AnyIO default thread limiter: 40 tokens',
          'Spring Boot 4.1.1, server.tomcat.threads.max default: 200',
        ]},
        {caption: 'Seconds for N blocking calls at once (evidence/threads-*.log)', lines: [
          'N                     40      41      100',
          'FastAPI def           2.12    4.1     6.25',
          'FastAPI, limit 100    2.14    2.14    2.29',
          'Spring MVC            2.1     2.09    2.24',
        ], note: 'Arranged as a table; every figure is copied from the transcripts. /health answered within 0.01 s in every run.'},
      ],
      claims: [
        {text: 'Default limiter: 40 calls 2.12 s, 41 calls 4.1 s, 100 calls 6.25 s. Raised to 100 tokens: 2.14, 2.14 and 2.29 s. Defaults recorded in the run: "AnyIO default thread limiter: 40 tokens", "server.tomcat.threads.max default: 200".', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'lifetime',
      title: 'How long does this object live?',
      body: [
        'In Spring, singleton is the default bean scope. In FastAPI, a Depends function is called on every request, its value cached within that request. Build expensive clients once, in the lifespan, and keep them in app state. But once means once per process.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: ProviderClient.java (excerpt)', lines: [
            '@Component',
            'public class ProviderClient {',
            '',
            '    private final RestClient http;',
            '',
            '    public ProviderClient(',
            '            @Value("${provider.url}") String url) {',
            '        this.http = RestClient.create(url);',
            '    }',
          ]},
          {caption: 'FastAPI: payments/main.py (excerpt)', lines: [
            '@asynccontextmanager',
            'async def lifespan(app: FastAPI):',
            '    app.state.sessions = db.connect()',
            '    app.state.provider = ProviderClient(PROVIDER_URL)',
            '    yield',
            '    app.state.provider.close()',
          ]},
        ]},
        {caption: 'Three requests to experiments/lifetime.py (evidence/lifetime.log, excerpt)', lines: [
          '{"same_object_twice_in_one_request":true,"built":{"per_request":1,"lifespan":1},...}',
          '{"same_object_twice_in_one_request":true,"built":{"per_request":2,"lifespan":1},...}',
          '{"same_object_twice_in_one_request":true,"built":{"per_request":3,"lifespan":1},...}',
        ], note: 'Shortened with "..."; the pid and object id are in the transcript.'},
        {caption: 'Five payments, counted by the provider (evidence/lifetime-*.log)', lines: [
          'provider client built per request: {"charges":5,"distinct_connections":5}',
          'provider client built in the lifespan: {"charges":5,"distinct_connections":1}',
          'spring, one ProviderClient bean: {"charges":5,"distinct_connections":1}',
          '',
          'worker processes seen: 4  lifespan objects seen: 4',
        ]},
      ],
      claims: [
        {text: 'Per request: 1, 2, 3 gateways built, the same object twice within one request, one lifespan object. With --workers 4: four processes, four lifespan objects.', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'transaction',
      title: '201 Created. Zero rows.',
      body: [
        'Three steps. 1: a session from a yield dependency with no transaction. Closing an uncommitted session rolls back silently: 201, and the row never exists. 2: add SQLAlchemy\'s boundary, session.begin(). Now it commits, but after the response, because a yield dependency defaults to the request scope. 3: Depends(get_session, scope="function") commits before the response, which matches Spring\'s @Transactional.',
        'The commit is SQLAlchemy\'s. When it happens is FastAPI\'s. Spring does not wrap your code in a transaction either, unless you declare one.',
      ],
      code: [
        {pair: [
          {caption: 'Step 1: overlays/no-transaction, payments/deps.py (excerpt)', lines: [
            'def get_session(request: Request) -> Iterator[Session]:',
            '    with request.app.state.sessions() as session:',
            '        yield session',
          ]},
          {caption: 'Step 2: overlays/commit-after-response, payments/deps.py (excerpt)', lines: [
            'def get_session(request: Request) -> Iterator[Session]:',
            '    with request.app.state.sessions() as session:',
            '        with session.begin():',
            '            yield session',
            '',
            '    session: Session = Depends(get_session),',
          ]},
        ]},
        {pair: [
          {caption: 'Spring: PaymentService.java (excerpt)', lines: [
            '    @Transactional',
            '    public Payment create(NewPayment in) {',
            '        long amount = pricing.total(',
            '                in.unitPrice(), in.quantity());',
            '        Optional<Long> found = store.find(in.orderRef());',
          ]},
          {caption: 'Step 3: payments/deps.py (excerpt)', lines: [
            'def payment_service(',
            '    request: Request,',
            '    session: Session = Depends(',
            '        get_session, scope="function"',
            '    ),',
            ') -> PaymentService:',
          ]},
        ]},
        {caption: 'Rows in Postgres after HTTP 201 (evidence/transaction-*.log)', lines: [
          'step 1, no begin:        right after the 201: payments: 0   five seconds later: payments: 0',
          'step 2, request scope:   right after the 201: payments: 0   five seconds later: payments: 1',
          'step 3, function scope:  right after the 201: payments: 1   five seconds later: payments: 1',
          'spring @Transactional:   right after the 201: payments: 1   five seconds later: payments: 1',
        ], note: 'One payment per case, each answered HTTP 201. The case labels are added and the receipt counts left out; the full lines are in the transcripts.'},
        {caption: 'Why step 2 commits late (evidence/fastapi-scope.log, excerpt)', lines: [
          '* `"request"`: start the dependency before the *path operation',
          '  function* that handles the request (similar to when using',
          '  `"function"`), but end **after** the response is sent back to',
          '  the client. So, the dependency function will be executed',
          '  **around** the **request** and response cycle.',
        ]},
      ],
      claims: [
        {text: 'No begin: 201 and 0 rows, still 0 five seconds later. Request scope: 0 rows right after the 201, 1 five seconds later. Function scope and Spring: 1 row right after the 201.', source: SRC.EVIDENCE},
        {text: 'The "function" scope ends the dependency before the response is sent; the "request" scope ends it after.', source: SRC.SCOPE},
      ],
    },
    {
      id: 'background',
      title: 'Work after the response is not a queue',
      body: [
        'BackgroundTasks runs the receipt after the response has gone, in the worker\'s memory. Kill the worker half a second after the 201 and the receipt never arrives. Spring\'s in-memory @Async loses it the same way when the JVM dies. If the work matters, put it in an outbox table or a message broker.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: ReceiptService.java (excerpt)', lines: [
            '    @Async',
            '    public void send(long paymentId)',
            '            throws InterruptedException {',
            '        Thread.sleep(2000);',
          ]},
          {caption: 'FastAPI: payments/api.py (excerpt)', lines: [
            '    payment = service.create(new)',
            '    tasks.add_task(receipt_sender.send, payment.id)',
            '    return payment',
          ]},
        ]},
        {caption: 'evidence/background.log and background-spring.log (excerpt)', lines: [
          'not killed, receipts: 1',
          'worker killed half a second later, receipts: 1',
          'spring @Async, JVM killed, receipts: 0',
        ], note: 'The FastAPI count stays at 1: the first payment\'s receipt arrived, the second never did.'},
      ],
      claims: [
        {text: 'Each killed process answered HTTP 201 and its receipt was never written.', source: SRC.EVIDENCE},
      ],
    },
    {
      id: 'workers',
      title: 'Workers are processes',
      body: [
        'uvicorn --workers 4 is four processes, each with its own copy of memory. With an in-memory idempotency dictionary, the same order sent eight times was charged seven times. Several Spring replicas have the same problem; what differs is that one flag creates the boundary on one host.',
      ],
      code: [
        {pair: [
          {caption: 'Spring: overlays/in-memory-idempotency (excerpt)', lines: [
            '    private final Map<String, Long> seen =',
            '            new ConcurrentHashMap<>();',
          ]},
          {caption: 'FastAPI: overlays/in-memory-idempotency (excerpt)', lines: [
            'seen: dict[str, int] = {}',
          ]},
        ]},
        {caption: 'order-42, eight times, one after another (evidence/workers-*.log, excerpt)', lines: [
          'FastAPI, --workers 4:  HTTP 201 twice, HTTP 500 six times',
          'provider: {"charges":7,"distinct_connections":4}',
          'rows in payments: 1',
          '',
          'Spring, one JVM:       HTTP 201 eight times',
          'provider: {"charges":1,"distinct_connections":1}',
        ], note: 'The status lines are summarised; each HTTP line is in the transcript. The unique column refused the duplicate rows, after the provider had charged them. The second 201 landed on the worker that had already inserted the row, so it answered without charging.'},
      ],
      claims: [
        {text: 'Four workers: 7 charges over 4 connections, 1 row, 6 server errors. One Spring JVM: 1 charge.', source: SRC.EVIDENCE},
      ],
    },
  ],

  scaleNote: 'Recorded 7 October 2026 with Python 3.14.8, FastAPI 0.142.2, SQLAlchemy 2.1.4, Spring Boot 4.1.1 on OpenJDK 25.0.4 and PostgreSQL 17 (evidence/versions.log).',

  checklist: {
    title: 'Starting a FastAPI service, as a Spring developer',
    items: [
      'Run mypy in the build: the runtime does not enforce your annotations',
      'Decide your error contract: FastAPI validation answers 422, Spring answers 400',
      'Never call a blocking client inside async def: use def, or an async client with await',
      'Know the thread budget: AnyIO allows 40 def calls at once by default, shared with sync dependencies',
      'Build expensive clients once, in the lifespan; a Depends function runs on every request',
      'Wrap the session in session.begin() and use Depends(..., scope="function") so the commit lands before the response',
      'Assert the database in your tests, not just the status code: a 201 can have no row behind it',
      'Put work that matters in an outbox or a broker, not BackgroundTasks or in-memory @Async',
      'Treat every Uvicorn worker as a separate instance: no in-memory state you rely on for correctness',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The repository: both services, the overlays, and scripts/verify.sh', url: REPO_URL},
    {label: 'FastAPI: concurrency and async / await', url: 'https://fastapi.tiangolo.com/async/'},
    {label: 'FastAPI: dependencies with yield', url: 'https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/'},
    {label: 'AnyIO: working with threads', url: 'https://anyio.readthedocs.io/en/stable/threads.html'},
    {label: 'SQLAlchemy: transactions and connection management', url: 'https://docs.sqlalchemy.org/en/latest/orm/session_transaction.html'},
    {label: 'Uvicorn: deployment', url: 'https://www.uvicorn.org/deployment/'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Spring and Spring Boot are trademarks of ' +
    'Broadcom. Python is a trademark of the Python Software Foundation. ' +
    'PostgreSQL is a trademark of the PostgreSQL Community Association. FastAPI, ' +
    'Starlette, AnyIO, Pydantic, Uvicorn, SQLAlchemy, httpx and mypy are the ' +
    'property of their respective owners. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing:
    'If this was useful, a like and a subscribe help more than you would think. ' +
    'And tell me in the comments which stack you want Spring Boot compared with next.',
};
