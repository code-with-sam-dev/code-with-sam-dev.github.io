/**
 * Spring to Node design sheet, episode 19 in the course list: Testcontainers for NestJS tests.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-testcontainers.sh` in the course
 * repository. Testcontainers for Node 12.2.0, for Java 2.0.5, Spring Boot 4.1.1, postgres:18-alpine.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-testcontainers.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Fresh DB. Still 2.',
  subtitle: 'Spring Boot to NestJS, episode 19: Testcontainers',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A container gives you a clean database per run, not per test. Where you own it decides what shares it.',
  verifiedOn: '2026-09-30',

  intro: [
    'Two tests against a Postgres container, run twice: 1 then 2, and again 1 then 2, on both stacks. Runs are clean; tests inside a run still share.',
    'One container per class or file isolates them, at the price of a start each. One shared container starts once and shares its data: counts followed the run order.',
    'Container for the run, reset for the test.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Container and @ServiceConnection against PostgreSqlContainer', 'Container lifecycle: per class, per file, per run', 'Vitest globalSetup with provide and inject'],
    outTitle: 'Not in scope',
    out: ['Container reuse between runs', 'Other databases'],
    note: 'Timings are this machine with a cached image; they vary.',
  },

  scale: {
    title: 'The measurements',
    note: 'Each test inserts one row, then counts.',
    rows: [
      ['CONTAINER PER RUN, RUN TWICE (BOTH STACKS)', '1, 2 and 1, 2'],
      ['CONTAINER START, THIS MACHINE', 'about 1.1 to 1.6 s'],
      ['SPRING, THREE CLASSES, OWN @Container', 'three starts; each class saw 1'],
      ['NEST, THREE CONTAINER STARTS AND STOPS', 'about 4.1 to 4.5 s'],
      ['SPRING, ONE CONTAINER IN A BASE CLASS', 'one start; 1, 2, 3 in class order'],
      ['NEST, ONE CONTAINER FROM globalSetup', 'one start; 1, 2, 3 in file order, order changed between runs'],
    ],
  },

  sections: [
    {
      id: 'wiring',
      title: 'The mapping',
      body: ['Spring declares a static container and lets @ServiceConnection wire the DataSource. Nest starts the container and passes its URI to TypeOrmModule.'],
      code: [
        {caption: 'Ep18ContainerTest.java', lines: [
          '@Container',
          '@ServiceConnection',
          'static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:18-alpine");',
        ]},
        {caption: 'fresh.spec.ts', lines: [
          "container = await new PostgreSqlContainer('postgres:18-alpine').start();",
          "TypeOrmModule.forRoot({ type: 'postgres', url: container.getConnectionUri(), entities: [Note], synchronize: true }),",
        ]},
      ],
      claims: [{text: 'container per run, two tests, run twice: 1, 2 and 1, 2 on both stacks', source: RUN}],
    },
    {
      id: 'shared',
      title: 'One container for the run',
      body: ['Started once in globalSetup, handed to every file. Pair it with a reset before each test so file order cannot leak into results.'],
      code: [{caption: 'global-setup.ts', lines: [
        'export async function setup(project: TestProject) {',
        "  container = await new PostgreSqlContainer('postgres:18-alpine').start();",
        "  project.provide('pgUri', container.getConnectionUri());",
        '}',
      ]}],
      claims: [{text: 'three files, one shared container: 1, 2, 3 in whichever order the files ran', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Testcontainers for Node 12.2, for Java 2.0, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a Testcontainers suite',
    items: [
      'A container per run is not isolation per test',
      'Decide who owns the container: class, file, or run',
      'For one container per run, use globalSetup with provide and inject',
      'Reset data before each test',
      'Expect results to depend on order if you share without a reset',
      'Measure start-up on your machine, not a blog\'s',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-testcontainers.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'Testcontainers for Node.js', url: 'https://node.testcontainers.org'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Docker is a trademark of Docker, Inc. This is an independent, ' +
    'unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
