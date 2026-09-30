/**
 * Spring to Node design sheet, episode 14 in the course list: TypeORM migrations, relations
 * and queries.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-relations.sh` in the course
 * repository. TypeORM 1.1.1, Spring Boot 4.1.1 with Hibernate 7.4.5, Postgres 18.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-relations.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'N+1. Or nothing.',
  subtitle: 'Spring Boot to NestJS, episode 14: TypeORM migrations, relations and queries',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Same relation, opposite default. A generated migration is a diff: read it.',
  verifiedOn: '2026-09-30',

  intro: [
    'JPA can fetch a lazy collection when you touch it: 21 queries for 20 orders. This TypeORM mapping leaves it unloaded unless you ask: 1 query, and 0 lines counted.',
    'Paging a one-to-many must page the parents: a plain LIMIT on the join returned 5 rows from 3 orders.',
    'A generated migration is a schema diff. Run on real rows, the type change failed safely on a NOT NULL column and nulled every value on a nullable one.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@OneToMany and @ManyToOne on both stacks', 'Loading relations: lazy against explicit', 'Paging a one-to-many', 'Generated migrations, run on rows'],
    outTitle: 'Not in scope',
    out: ['Transactions: next episode', 'TypeORM lazy relations with Promise types'],
    note: 'One relation shape, one machine. The counts show behaviour, not constants.',
  },

  scale: {
    title: 'The measurements',
    note: '20 orders, 3 lines each, the same schema on both stacks.',
    rows: [
      ['LOOP OVER order.lines, NOT FETCHED', 'Spring 21 queries, 60 lines; TypeORM 1 query, 0 lines'],
      ['FETCH UP FRONT', 'join fetch / relations option: 1 query, 60 lines each'],
      ['PLAIN LIMIT 5 OFFSET 5 ON THE JOIN', '5 rows from 3 orders'],
      ['TypeORM PAGE 2 OF 5 WITH LINES', '2 queries, ORD-6 to ORD-10, 15 lines'],
      ['GENERATED, RENAME', 'RENAME COLUMN, values kept'],
      ['GENERATED, TYPE CHANGE, NOT NULL', 'DROP + ADD NOT NULL: refused, rolled back'],
      ['GENERATED, TYPE CHANGE, NULLABLE', 'DROP + ADD: ran, every value null'],
      ['HAND WRITTEN USING CAST', 'refused "abc", kept everything'],
    ],
  },

  sections: [
    {
      id: 'relations',
      title: 'Ask for the relation',
      body: ['With this TypeORM mapping a relation is undefined unless requested. Request it, and for this one-to-many it arrives in one query.'],
      code: [
        {caption: 'probes.ts', lines: [
          '@OneToMany(() => OrderLine, (line) => line.order)',
          'lines!: OrderLine[];',
          '',
          "const withLines = await orders.find({ relations: { lines: true }, order: { id: 'ASC' } });",
        ]},
        {caption: 'the Spring side', lines: [
          '@Query("select distinct o from Ep13Order o join fetch o.lines order by o.id")',
          'List<Ep13Order> findAllWithLines();',
        ]},
      ],
      claims: [{text: 'Lazy collection loop: 21 queries; join fetch: 1 query; TypeORM without relations: order.lines undefined', source: RUN}],
    },
    {
      id: 'migrations',
      title: 'Read a generated migration before it runs',
      body: ['The rename was right. The type change dropped and re-added the column: on a NOT NULL column Postgres refused it; on a nullable column it ran and every value became null. A hand-written USING cast refused bad data instead.'],
      code: [{caption: 'the hand-written alternative', lines: [
        'ALTER TABLE "ep13_stock" ALTER COLUMN "quantity" TYPE integer USING "quantity"::integer',
      ]}],
      claims: [{text: 'nullable column, generated DROP COLUMN then ADD integer: rows after [null, null] from ["123", "abc"]', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: TypeORM 1.1, Spring Boot 4.1, Hibernate 7.4.',

  checklist: {
    title: 'Before you ship relations and migrations in TypeORM',
    items: [
      'Request relations explicitly where you read them',
      'Do not trust a count computed from an unloaded relation',
      'Page the parent rows, not the joined rows',
      'Read every generated migration before running it',
      'Write type changes by hand, with a USING cast',
      'Run migrations against a copy of real data first',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-relations.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'TypeORM', url: 'https://typeorm.io'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
