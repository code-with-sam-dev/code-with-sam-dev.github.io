/**
 * Spring to Node design sheet, episode 18 in the course list: integration tests with PostgreSQL.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-integration.sh` in the course
 * repository against Postgres 18. Spring Boot 4.1.1, Vitest 5.0.3, TypeORM 1.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-integration.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Test 2: two rows.',
  subtitle: 'Spring Boot to NestJS, episode 18: integration tests with PostgreSQL',
  kicker: 'For Java developers moving to NestJS',
  strapline: '@DataJpaTest gives you rollback as part of the test slice. A Nest testing module gives you the application, not database isolation.',
  verifiedOn: '2026-09-30',

  intro: [
    'Two tests against a real Postgres, each inserting one row and counting: 1 and 1 under @DataJpaTest, 1 and 2 in Nest, and 3 and 4 on the next run.',
    'The rollback comes from the test transaction. A plain @SpringBootTest also counted 1 and 2, and a test transaction stops at a real HTTP request on both stacks.',
    'For this suite, truncating before each test was the reliable boundary, with care for foreign keys and shared databases.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@DataJpaTest and @SpringBootTest against a Nest testing module', 'MockMvc against supertest', 'Where a test transaction stops', 'Resetting data between tests'],
    outTitle: 'Not in scope',
    out: ['Testcontainers: next episode', 'Parallel test databases'],
    note: 'One Postgres 18 from compose, test files run one at a time.',
  },

  scale: {
    title: 'The measurements',
    note: 'Two tests, one row each, then count.',
    rows: [
      ['SPRING @DataJpaTest', '1, then 1'],
      ['SPRING @SpringBootTest, NO @Transactional', '1, then 2'],
      ['NEST TESTING MODULE, TYPEORM', '1, then 2; next run 3, then 4'],
      ['NEST, QUERYRUNNER TRANSACTION PER TEST', 'the injected repository\'s row survived'],
      ['@Transactional TEST, MockMvc', '0 rows afterwards'],
      ['@Transactional TEST, REAL HTTP', '1 row afterwards'],
      ['NEST, SUPERTEST INSIDE A ROLLED-BACK TRANSACTION', '1 row afterwards'],
      ['NEST, TRUNCATE BEFORE EACH TEST', '1, then 1'],
    ],
  },

  sections: [
    {
      id: 'reset',
      title: 'Reset the data before each test',
      body: ['It works whichever connection did the write, for repository tests and requests alike. Truncate related tables together or cascade, and do not let parallel files share one database.'],
      code: [{caption: 'cleanup.spec.ts', lines: [
        'beforeEach(async () => {',
        "  await dataSource.query('TRUNCATE ep17_notes_clean RESTART IDENTITY');",
        '});',
      ]}],
      claims: [{text: 'two tests with TRUNCATE before each: 1 and 1', source: RUN}],
    },
    {
      id: 'transaction',
      title: 'Where a test transaction stops',
      body: ['A QueryRunner transaction only covers writes made through runner.manager. The injected repository and a supertest request use their own connections.'],
      code: [{caption: 'cleanup.spec.ts', lines: [
        "await notes.save({ text: 'injected' });              // kept",
        "await runner.manager.save(CleanNote, { text: 'runner' }); // rolled back",
      ]}],
      claims: [{text: 'after both rolled-back tests, 1 row left: "injected"', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Vitest 5.0, TypeORM 1.1, Spring Boot 4.1, Postgres 18.',

  checklist: {
    title: 'Before you trust a NestJS integration suite',
    items: [
      'Decide how each test gets clean data',
      'Truncate before each test for HTTP tests',
      'Use a test transaction only when every write goes through its manager',
      'Truncate related tables together, or cascade',
      'Do not let parallel test files share one database',
      'Build the testing module once per file where you can',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-integration.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS testing', url: 'https://docs.nestjs.com/fundamentals/testing'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
