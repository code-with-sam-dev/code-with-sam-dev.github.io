/**
 * The Kafka Idempotency Design Sheet, episode 5.
 *
 * Verified 2026-09-13, recorded in production/episode-kafka-05-claims.md.
 *
 * NOTE ON RISK PROFILE, because it differs from every other sheet in the
 * series. This one asserts no Kafka defaults and no protocol behaviour, so it
 * will not rot with a Kafka release. Its claims are about relational database
 * semantics and about concurrency reasoning, which are stable and are easier to
 * state sloppily. The care went into phrasing rather than into dating.
 */
import {CHANNEL_LINKS, repoLink, APACHE_TRADEMARK, CLOSING, SRC} from './kafka-common.mjs';

export const sheet = {
  channel: 'Code with Sam',

  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Idempotency That Holds',
  subtitle: 'The senior engineer answer sheet',
  kicker: 'Senior Software Engineer Interview Questions: Deep Dives',
  strapline: 'Two identical requests, four milliseconds apart. Your check found nothing, twice.',

  verifiedOn: '2026-09-13',

  intro: [
    'Almost everyone can describe idempotency. Far fewer can implement one that survives two duplicates arriving at the same instant, which is the only case that matters.',
    'The gap between those two is a single design decision: whether the duplicate is DETECTED by your code or ARBITRATED by the database.',
    'This sheet is the written form of the episode. Database behaviour is sourced to PostgreSQL 17 documentation. Reasoning that is reasoning rather than documented behaviour says so.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What makes a key an identity rather than a value',
      'Why check-then-act fails under concurrency',
      'The atomic claim, and who wins',
      'Conflict-aware insert, and what it does not fix',
      'Putting the claim and the effect in one transaction',
      'Returning the original result to the loser',
      'Where the boundary stops: remote calls',
    ],
    outTitle: 'Out of scope',
    out: [
      'Kafka producer idempotence, which is a different mechanism with the same word',
      'Distributed locks, which move the problem rather than solving it',
      'Retry policy and dead letter topics, which are episode 6',
      'The transactional outbox, which is episode 7',
    ],
    note: 'The word idempotent is used for at least three different things in this stack. Saying which one you mean is the first mark of a senior answer.',
  },

  scale: {
    title: 'Worked assumptions',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Concurrent duplicate requests', '32, as in the repo test'],
      ['Gap between the first two', '4 ms'],
      ['Time for a SELECT to return', 'about 1 ms'],
      ['Window a check-then-act leaves open', 'the whole gap between the read and the write'],
      ['Duplicates that must be admitted', '0'],
      ['Rows the unique constraint allows', '1, decided by the database'],
    ],
  },

  sections: [
    {
      id: 'identity',
      title: 'The key is an identity, not a value',
      body: [
        'A request id generated fresh on every retry identifies the ATTEMPT. It has to identify the INTENT, and survive across retries, restarts and reassignments.',
        'The client owns it, or it is derived deterministically from the payload. Generated server side per call, it identifies nothing.',
        'Beside it, store a fingerprint of the request. Then the same key arriving with different content is a bug you can detect rather than a silent overwrite.',
      ],
      claims: [
        {
          text: 'An identifier generated at the point of retry cannot deduplicate retries, because each retry produces a new one.',
          source: SRC.FIRST,
        },
        {
          text: 'Storing a fingerprint of the request alongside the key turns key reuse with different content into a detectable conflict rather than an ambiguous one.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'check-then-act',
      title: 'Why the obvious implementation fails',
      body: [
        'Read the table, see nothing, do the work, write the row. It works in every test you will write by hand, because those tests are sequential.',
        'Two duplicates arriving concurrently both read, both see nothing, and both proceed. The window is the whole gap between the read and the write, and it is not closable by making the gap smaller.',
        'THE LINE TO REMEMBER. A read followed by a later write can DETECT duplicates in a quiet system. It cannot ARBITRATE two duplicates arriving concurrently.',
      ],
      claims: [
        {
          text: 'A read followed by a later write cannot arbitrate concurrent duplicates, because both readers observe the same pre-write state.',
          source: SRC.FIRST,
        },
        {
          text: 'The repo test for this episode races thirty two threads on one payment id, and a check-then-act implementation admits more than one of them.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'the-claim',
      title: 'The atomic claim',
      body: [
        'Do not ask whether the key exists. Try to INSERT it, and let the unique constraint decide who wins.',
        'One insert succeeds. Every other one violates the constraint. There is no window because there is no read, and the arbitration happens inside the database rather than inside your process.',
        'The winner does the work. The losers do not. This is the whole mechanism, and it is four lines of SQL.',
      ],
      claims: [
        {
          text: 'A unique constraint ensures that the values in a column, or a group of columns, are unique among all the rows in the table.',
          source: SRC.PG_CONSTRAINTS,
        },
        {
          text: 'A unique constraint violation is how the database arbitrates a race, and the losing transaction learns it lost without ever having read the winner row.',
          source: SRC.PG_CONSTRAINTS,
        },
      ],
    },
    {
      id: 'on-conflict',
      title: 'Conflict-aware insert, and the hedge that matters',
      body: [
        'INSERT ... ON CONFLICT DO NOTHING lets you attempt the claim without treating the loss as an exception, and tells you which happened by whether a row was affected.',
        'It makes the pattern PRACTICAL. It does not make it complete.',
        'That hedge is deliberate. ON CONFLICT resolves the write race. It does not by itself make the surrounding business effect atomic with the claim, and that is the next section.',
      ],
      claims: [
        {
          text: 'INSERT ... ON CONFLICT DO NOTHING avoids inserting a row as its alternative action when a uniqueness violation would occur, without raising an error.',
          source: SRC.PG_UPSERT,
        },
        {
          text: 'Conflict-aware insert resolves the race on the claim row only; the atomicity of anything else in the same request is a separate question.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'one-transaction',
      title: 'The claim and the effect are one transaction, or they are nothing',
      body: [
        'Claim the key, then move the money, then commit. One transaction.',
        'If the effect fails, the transaction rolls back, and the claim rolls back with it. The key is free again and the retry is genuinely a first attempt.',
        'Claim in one transaction and effect in another, and you have built a machine that permanently blocks a payment the moment the second one fails. That failure mode is worse than the duplicate you were preventing.',
      ],
      claims: [
        {
          text: 'A transaction bundles multiple steps into a single all-or-nothing operation, so intermediate states are not visible to other transactions and a failure at any step leaves none of them applied.',
          source: SRC.PG_TX,
        },
        {
          text: 'Committing the claim separately from the effect converts a duplicate risk into a permanent block risk, which is the more expensive of the two for a payment.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'the-loser',
      title: 'What the loser returns',
      body: [
        'The duplicate must not fail. It must return the ORIGINAL result, which means the result has to have been stored with the claim.',
        'A duplicate that returns an error teaches the client to retry, which produces another duplicate. You have built a loop and called it protection.',
        'So the claim row is not a boolean. It holds the key, the fingerprint, the outcome, and when it happened.',
      ],
      claims: [
        {
          text: 'Returning an error to a duplicate invites a further retry, so a correct idempotent endpoint returns the stored original outcome instead.',
          source: SRC.FIRST,
        },
        {
          text: 'Storing the outcome with the claim in the same transaction is what makes returning it to the loser possible at all.',
          source: SRC.PG_TX,
        },
      ],
    },
    {
      id: 'boundary',
      title: 'Where the boundary stops',
      body: [
        'Your local transaction cannot normally make a remote charge atomic with it. The word normally is doing real work in that sentence: it is true for an ordinary HTTP call, and there exist protocols where it is less true.',
        'So pass YOUR key to the provider and require them to deduplicate on it. Then the ambiguous case, request sent and response lost, becomes safe to retry.',
        'And be clear about what idempotency does not give you. It does not give you ordering. It does not give you isolation between different keys. It prevents one thing happening twice, and nothing else.',
      ],
      claims: [
        {
          text: 'A local database transaction cannot normally make an external HTTP side effect atomic with it, because the remote system is not a participant in that transaction.',
          source: SRC.FIRST,
        },
        {
          text: 'Idempotency does not provide ordering or isolation; those are separate properties requiring separate mechanisms.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'answer',
      title: 'The interview answer',
      body: [
        'Idempotency means the same logical operation applied more than once has the same effect as applying it once.',
        'It needs a key that identifies the intent, not the attempt, and it needs the duplicate to be arbitrated by a constraint rather than detected by a read.',
        'The claim and the business effect go in one transaction, and the loser gets the original result back rather than an error.',
        'Then name the boundary: remote calls need the provider to deduplicate on your key, because your transaction does not reach them.',
      ],
      claims: [
        {
          text: 'Leading with the key and the arbitration, rather than with a definition of the word, is what separates an implemented answer from a memorised one.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'Questions to ask before you answer',
    items: [
      'What identifies one logical operation, and who generates it?',
      'Does the key survive a retry, a restart and a reassignment?',
      'Is the duplicate detected by a read, or arbitrated by a constraint?',
      'Are the claim and the effect in the same transaction?',
      'What does the second caller get back?',
      'Is the payload fingerprinted, so key reuse is visible?',
      'Which side effects are outside the transaction boundary?',
      'How long do claims live, and what cleans them up?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('episode-05-idempotency')],
  trademarks: APACHE_TRADEMARK,
  closing: CLOSING,
};
