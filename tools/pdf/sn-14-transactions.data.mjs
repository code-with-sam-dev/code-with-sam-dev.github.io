/**
 * Spring to Node design sheet, episode 15 in the course list: transactions and idempotency.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-transactions.sh` in the course
 * repository. TypeORM 1.1.1, Spring Boot 4.1.1, Postgres 18.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-transactions.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Debit. No credit.',
  subtitle: 'Spring Boot to NestJS, episode 15: transactions and idempotency',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A transaction only protects work that joins it. A check before an insert does not enforce uniqueness.',
  verifiedOn: '2026-09-30',

  intro: [
    'In TypeORM, only what goes through the transaction\'s manager is in the transaction. A debit saved through the injected repository survived the rollback.',
    'In Spring, injected repositories join the surrounding transaction, but a @Transactional method called through this never crosses the proxy: both rows survived.',
    'Check then insert duplicated on both stacks. A unique constraint allows at most one row; resolve the loser after the failed insert has rolled back.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Transactional against ds.transaction(manager)', 'Self-invocation', 'The idempotency race and the unique constraint', 'The outbox table, inside one transaction'],
    outTitle: 'Not in scope',
    out: ['Publishing the outbox to Kafka: the Kafka episode', 'Propagation modes beyond the default'],
    note: 'One machine, ten concurrent requests. The race counts vary from run to run; the row counts under a constraint do not.',
  },

  scale: {
    title: 'The measurements',
    note: 'Ten concurrent requests with the same idempotency key, the same Postgres 18.',
    rows: [
      ['TypeORM, DEBIT VIA INJECTED REPO, THEN THROW', '1 row left: ["debit"]'],
      ['TypeORM, REPO FROM THE MANAGER', '0 rows left'],
      ['SPRING, @Transactional CALLED THROUGH this', '2 rows left'],
      ['CHECK THEN INSERT, NO CONSTRAINT', 'duplicates on both; count varies by run'],
      ['UNIQUE CONSTRAINT', '1 row; the rest a unique violation (23505)'],
      ['LOSER TRANSLATED AFTER ROLLBACK', 'all 10 callers, the same payment id'],
      ['CATCH INSIDE THE SAME TRANSACTION', 'TypeORM 25P02; Spring Hibernate session failure'],
      ['SAME KEY, OTHER AMOUNT (TypeORM)', '5 x 409 conflict, 1 row'],
      ['SERIALIZABLE, NO CONSTRAINT', '1 row, 9 x 40001; with retry, 1 row'],
      ['OUTBOX, EVENT VIA INJECTED REPO', 'payment 0, outbox 1'],
    ],
  },

  sections: [
    {
      id: 'manager',
      title: 'Everything through the manager',
      body: ['The callback\'s manager is the transaction. Take repositories from it.'],
      code: [
        {caption: 'probes.ts, the fix', lines: [
          'await ds.transaction(async (m) => {',
          '  const repo = m.getRepository(LedgerEntry);',
          "  await repo.save({ note: 'debit' });",
          "  await repo.save({ note: 'credit' });",
          "  throw new Error('boom');",
          '});',
        ]},
        {caption: 'Ep14LedgerService.java: through this, no transaction', lines: [
          'public void postFromInside() {',
          '    this.post();',
          '}',
        ]},
      ],
      claims: [{text: 'debit via injected repository: 1 row left; repository from the manager: 0 rows left', source: RUN}],
    },
    {
      id: 'idempotency',
      title: 'Let the database decide, then translate',
      body: ['A unique constraint on the key allows at most one row. Catch the unique violation outside the failed transaction and return the existing payment. Compare the request too: the same key with a different amount is a conflict, not a replay.'],
      code: [{caption: 'probes.ts', lines: [
        'try {',
        "  return (await repo.save({ idempotencyKey: 'pay-42' })).id;",
        '} catch (e) {',
        "  if ((e as { code?: string }).code !== '23505') throw e;",
        "  return (await repo.findOneByOrFail({ idempotencyKey: 'pay-42' })).id;",
        '}',
      ]}],
      claims: [{text: '10 concurrent requests, one key: all 10 got the same payment id, 1 row, on both stacks', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: TypeORM 1.1, Spring Boot 4.1, Postgres 18.',

  checklist: {
    title: 'Before you ship transactions and idempotency in NestJS',
    items: [
      'Inside ds.transaction, use only the manager and its repositories',
      'In Spring, never rely on @Transactional through this',
      'Put a unique constraint on the idempotency key',
      'Resolve the duplicate after the failed insert has rolled back',
      'Return a conflict when the same key carries a different request',
      'Write the outbox row in the same transaction as the change',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-transactions.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'TypeORM transactions', url: 'https://typeorm.io'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
