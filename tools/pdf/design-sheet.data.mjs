/**
 * The Digital Wallet Design Sheet.
 *
 * Content lives here as data rather than inside the template, for one reason:
 * the video's narration is not locked yet, and when it locks this file is the
 * only thing that changes. The template, the tests and the build stay put.
 *
 * The rule that makes this sheet worth keeping: EVERY technical claim carries
 * the source it was verified against, and the tests refuse to build without
 * one. Anything sourced to nothing is either removed or rewritten until it can
 * be sourced. That is the difference between a cheat sheet and a rumour.
 *
 * Verified 2026-09-11 against PostgreSQL 18 and Apache Kafka 4.3 documentation.
 */

const PG_ISO = 'PostgreSQL 18, Transaction Isolation';
const PG_LOCK = 'PostgreSQL 18, Explicit Locking';
const KAFKA_DESIGN = 'Kafka 4.3, Design: Message Delivery Semantics';
const KAFKA_PRODUCER = 'Kafka 4.3, Producer Configs';
const LIT = 'Standard database literature, not the PostgreSQL manual';
const FIRST = 'First principles, not vendor documentation';
const PROM = 'Prometheus, Histograms and summaries';

import {architectureSvg} from './diagram.mjs';

export const sheet = {
  channel: 'Code with Sam',

  /**
   * The architecture board, on its own page.
   *
   * Declared here rather than hard coded in the template, because the template
   * serves every sheet and this diagram belongs to exactly one of them. The
   * rebalancing sheet rendered this wallet board on page two before the board
   * became per sheet.
   */
  board: {
    title: 'The board we end up with',
    lead: 'Every box below earns its place later in this sheet. Nothing here is decoration, and the numbers are the order a single transfer travels.',
    note: 'The four boxes along the bottom are not components. They are the failures that decide whether the rest of the design is real, and each one is answered in the sections that follow.',
    svg: architectureSvg,
  },

  /*
    The video this sheet belongs to. Until it is published there is no watch
    URL, so this points at the channel and the label says so. The moment the
    video goes live, change the url and the label here and rebuild: that is the
    only edit needed, and the footer link on every page follows.
  */
  video: {
    url: 'https://www.youtube.com/@CodewithSam-Dev',
    label: 'Watch on YouTube',
  },
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Design a Digital Wallet Payment System',
  subtitle: 'The senior engineer answer sheet',
  kicker: 'Senior Software Engineer Interview Questions: Deep Dives',
  strapline: 'One person sends money to another. Everything hard is underneath.',

  verifiedOn: '2026-09-11',

  intro: [
    'A customer sends one hundred. The money leaves their wallet. The service crashes. The receiver never gets it.',
    'That is not mainly a database problem. It is a system design problem, and it is the one this sheet answers.',
    'Every technical statement below was checked against the vendor documentation named beside it. Where something is a general principle rather than a documented behaviour, it says so.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Check a wallet balance',
      'Transfer value between two wallets on the same platform',
      'Transfer status and history',
      'Prevent double spending',
      'Survive retries',
      'Keep an auditable record',
      'Notify both parties after success',
    ],
    outTitle: 'Deliberately out of scope',
    out: [
      'Merchant payments, which bring authorisation versus capture, acquiring, refunds, fees and chargebacks',
      'Agent cash in and cash out',
      'KYC and sanctions screening inside the transaction path',
      'Foreign exchange and cross border settlement',
      'Card and bank rails, custody, airtime, lending',
    ],
    note: 'Narrowing the scope out loud is itself a senior move. A candidate who designs everything designs nothing.',
  },

  scale: {
    title: 'Scale assumptions',
    note: 'These are interview assumptions chosen to make the numbers concrete. They are not published figures from any provider, and no claim is made here about how any named company works.',
    rows: [
      ['Registered wallets', '10 million'],
      ['Daily active users', '1 million'],
      ['Transfers per day', '3 million'],
      ['Average rate', 'about 35 per second'],
      ['Designed peak', 'about 1,000 per second'],
    ],
  },

  sections: [
    {
      id: 'naive',
      title: 'The answer most candidates give, and why it fails',
      body: [
        'Read the sender balance. Subtract in application code. Write the new number back. Then do the same in reverse for the receiver.',
        'Two things kill it, and a senior interviewer is waiting for both.',
      ],
      claims: [
        {
          text: 'PostgreSQL runs at Read Committed by default, so a SELECT sees only data committed before that statement began, and two SELECTs in one transaction can see different data.',
          source: PG_ISO,
        },
        {
          text: 'Read Committed prevents dirty reads, but permits nonrepeatable reads, phantom reads and serialization anomalies.',
          source: PG_ISO,
        },
        {
          text: 'Two transfers that read the same starting balance and each write an absolute result will silently overwrite one another. This is what the literature calls a lost update. The PostgreSQL manual does not use that phrase, so do not attribute it to them.',
          source: LIT,
        },
        {
          text: 'Debiting the sender and crediting the receiver as two separate committed steps creates a window where the money exists nowhere. A crash inside that window is not recoverable by retrying, because the first step already committed.',
          source: FIRST,
        },
      ],
    },
    {
      id: 'ledger',
      title: 'Ledger, not a mutable balance',
      body: [
        'Stop storing the balance as a number you edit. Store what happened, as entries that never change, and derive the balance from them.',
        'Double entry means every movement is written as a matched pair: one account debited, another credited, in one journal entry, summing to zero. The invariant is not "the balance looks right", it is "the entries balance".',
        'A mutable balance can be wrong with no evidence. A ledger cannot be wrong quietly: if it is wrong, the entries do not sum, and that is detectable.',
      ],
      claims: [
        {
          text: 'A single transaction commits all of its row changes or none of them, so both sides of the entry land together or neither does.',
          source: PG_ISO,
        },
        {
          text: 'Holding a reserved or pending balance separately from the posted balance earns its place only when completion depends on something that cannot join the transaction: a card authorisation, a bank payout, an external settlement provider. For two wallets inside one consistency boundary it is ceremony, because the transaction already solves it.',
          source: FIRST,
        },
      ],
    },
    {
      id: 'concurrency',
      title: 'Two transfers at once',
      body: [
        'Correctness under concurrency is a choice you make explicitly, and the interviewer wants to hear which one you chose and why.',
      ],
      claims: [
        {
          text: 'SELECT FOR UPDATE locks the rows it returns so they cannot be locked, modified or deleted by other transactions until the current transaction ends.',
          source: PG_LOCK,
        },
        {
          text: 'Row level locks do not affect ordinary reads. They block only writers and lockers to the same row, so a plain SELECT still sees the row.',
          source: PG_LOCK,
        },
        {
          text: 'At Read Committed, SELECT FOR UPDATE waits for a competing transaction and then locks and returns the updated row.',
          source: PG_LOCK,
        },
        {
          text: 'At Repeatable Read or Serializable it does not wait. An error is thrown if the row to be locked has changed since the transaction started. The same statement, two behaviours, decided by isolation level.',
          source: PG_LOCK,
        },
        {
          text: 'Repeatable Read and Serializable transactions can fail with a serialization error, and the documented remedy is to abort and retry the whole transaction from the beginning. If you choose those levels, retry is part of your design, not an afterthought.',
          source: PG_ISO,
        },
        {
          text: 'PostgreSQL Repeatable Read is stronger than the SQL standard requires. The standard permits phantom reads at that level; PostgreSQL does not allow them.',
          source: PG_ISO,
        },
      ],
    },
    {
      id: 'idempotency',
      title: 'The retry that must not pay twice',
      body: [
        'A client times out and retries. The first request may have succeeded. The network cannot tell you which.',
        'The fix is an idempotency key supplied by the caller, stored with the result of the first attempt. The second arrival returns the stored result rather than moving money again.',
      ],
      claims: [
        {
          text: 'The key is scoped to the operation, not to the user, and it must be persisted in the same transaction that performs the transfer. Stored afterwards, a crash between the two leaves the money moved and the key missing, which is the exact bug it was meant to prevent.',
          source: FIRST,
        },
        {
          text: 'The same key arriving with a different request body is a client error, not a duplicate. Returning the original result would hide a real bug, so reject it.',
          source: FIRST,
        },
      ],
    },
    {
      id: 'outbox',
      title: 'Telling the rest of the world, without lying',
      body: [
        'The transfer committed. Now a notification must go out, and reporting and risk want to know.',
        'Writing to the database and publishing to a broker are two systems. They cannot commit together, so one of them can succeed alone. Publish first and you can announce money that never moved. Publish after and you can move money nobody hears about.',
        'The outbox pattern makes the message part of the same transaction: the event is inserted into an outbox table alongside the ledger entries, and a separate publisher reads that table and sends it.',
      ],
      claims: [
        {
          text: 'The outbox makes the decision to send atomic with the money movement. It does not make the send itself exactly once: the publisher can crash after sending and before marking the row, so the same event can go out twice. Consumers must still be idempotent.',
          source: FIRST,
        },
        {
          text: 'Kafka names three delivery semantics. At most once, messages may be lost but are never redelivered. At least once, messages are never lost but may be redelivered. Exactly once, each message is processed once and only once.',
          source: KAFKA_DESIGN,
        },
        {
          text: 'The Kafka producer sets enable.idempotence to true by default, which stops a retry writing a duplicate copy into the log. But it is disabled silently if conflicting configurations are set and it was not explicitly enabled, and it requires acks=all, retries above zero, and at most five in flight requests per connection.',
          source: KAFKA_PRODUCER,
        },
        {
          text: 'Producer idempotence is not end to end exactly once processing. It means the producer does not duplicate on retry. What your consumer does with the message is a separate problem.',
          source: KAFKA_PRODUCER,
        },
        {
          text: 'A Kafka consumer reads uncommitted transactional messages by default. Aborted transaction messages are visible unless the consumer asks for read_committed.',
          source: KAFKA_DESIGN,
        },
      ],
    },
    {
      id: 'observability',
      title: 'Proving it works, and proving what happened',
      body: [
        'Most candidates answer this by naming tools. Prometheus, Grafana, done. The senior answer is not which tools, it is what you measure and what you wake somebody up for.',
        'In a payment system the thing worth alerting on is an invariant, not a symptom. CPU at 90 percent is a symptom. A ledger that does not balance is money, and it is the one page-someone-at-3am alert this design has.',
        'The four that actually matter here: does the ledger balance, how far behind is the outbox publisher, how many transfers are stuck in a non terminal state, and how often is the idempotency key being hit. That last one is free duplicate-detection telemetry: a sudden rise means a client is retrying much more than it should be, and that is usually the first sign something upstream is broken.',
        'And one thread through all of it. A correlation id issued at the gateway, carried on every log line, every span and every event, is what turns "it failed somewhere" into "it failed here". Without it the money is auditable and the request is not.',
      ],
      claims: [
        {
          text: 'A Prometheus summary calculates quantiles inside the instrumented program and exposes them directly. A histogram exposes bucketed counts, and the quantile is calculated on the server by histogram_quantile().',
          source: PROM,
        },
        {
          text: 'Precomputed summary quantiles cannot be aggregated across instances. The documentation is blunt about it: averaging the quantiles yields statistically nonsensical values, and it marks avg of a 95th percentile series as BAD. If you want a percentile across a fleet, you need histograms.',
          source: PROM,
        },
        {
          text: 'The accuracy of histogram_quantile is bounded by the width of the bucket the quantile falls in, so buckets chosen badly give a confident and wrong number.',
          source: PROM,
        },
        {
          text: 'Knowing the difference between those two, and why you cannot average percentiles, separates someone who has run a system from someone who has configured one.',
          source: FIRST,
        },
      ],
    },
    {
      id: 'xa',
      title: 'Why not a distributed transaction',
      body: [
        'The textbook answer to "make the database write and the broker publish atomic" is a distributed transaction. XA is the X/Open standard for one; JTA is the Java API over it. It is a fair thing to raise, and knowing why it is not used is worth more than knowing it exists.',
        'The reason is not that two phase commit is wrong. It is that it takes two willing participants, and the thing on the other side usually cannot play.',
      ],
      claims: [
        {
          text: 'Kafka documents two phase commit as the classic way to coordinate a consumer position with its output, and explains that it stores the offset with the output instead, because many of the output systems a consumer writes to will not support a two phase commit.',
          source: KAFKA_DESIGN,
        },
        {
          text: 'Where XA still genuinely fits is two resources that both implement it, such as a relational database and a JMS broker, under a transaction manager. That is a narrower world than it was, which is why the outbox became the common answer.',
          source: FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'What a senior engineer notices',
    items: [
      'What happens when this request is retried',
      'What happens when two of these run at the same time',
      'What happens if it crashes between the two writes',
      'Is the balance the source of truth, or the ledger',
      'How do I prove what happened six months from now',
      'Which steps must be synchronous, and which are consequences',
      'What happens when the notification fails after the money moved',
      'What did I deliberately leave out, and can I say why',
    ],
  },

  /*
    Every account the channel owns. Facebook is included here even though it is
    kept OUT of captions on platforms that do not linkify, where a raw
    profile.php id would have to be retyped by hand. In a PDF the link is
    clickable, so that objection does not apply and leaving it out would just
    be an omission.
  */
  links: [
    {label: 'Site', url: 'https://code-with-sam-dev.github.io'},
    {label: 'YouTube', url: 'https://www.youtube.com/@CodewithSam-Dev'},
    {label: 'LinkedIn', url: 'https://www.linkedin.com/company/code-with-sam-dev'},
    {label: 'X', url: 'https://x.com/CodeWithSamDev'},
    {label: 'TikTok', url: 'https://www.tiktok.com/@codewithsamdev'},
    {label: 'Instagram', url: 'https://www.instagram.com/codewithsamdev'},
    {label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594191065024'},
    {label: 'GitHub', url: 'https://github.com/code-with-sam-dev'},
    {label: 'Contact', url: 'https://code-with-sam-dev.github.io/contact'},
    {label: '☕ Buy me a coffee', url: 'https://buymeacoffee.com/codewithsam'},
    {label: 'Buy me sadza', url: 'https://buymeacoffee.com/codewithsam'},
  ],

  trademarks:
    'Technology marks on the board are the property of their respective owners and appear only to identify the technology in the box they sit in. Nothing here implies any endorsement.',

  closing:
    'If this was useful, a like and a subscribe help more than you would think. And tell me in the comments which system you want taken apart next.',
};
