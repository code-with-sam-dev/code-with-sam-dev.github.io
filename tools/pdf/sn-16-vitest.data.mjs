/**
 * Spring to Node design sheet, episode 17 in the course list: unit testing NestJS with Vitest.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-testing.sh` (Vitest 5.0.3) and
 * `scripts/verify-testing-v4.sh` (a fresh nest new project, Vitest 4.1.11) in the course
 * repository, and Spring Boot 4.1.1 with Mockito.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-testing.sh and verify-testing-v4.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Test 2: two calls.',
  subtitle: 'Spring Boot to NestJS, episode 17: unit testing with Vitest',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Mockito and Vitest make different choices about mock lifecycle and strictness, and the defaults are version-sensitive.',
  verifiedOn: '2026-09-30',

  intro: [
    'A mock shared by two tests carried its calls into the second test on Vitest 4.1, the version nest new installs at the time of recording. Vitest 5 and Mockito both reported one call each.',
    'clearMocks is the Mockito-like reset. mockReset destroys shared stubs before the first test.',
    'Mockito fails an unused stub; Vitest passes it. A vi.mock factory cannot read a file constant, because the call is hoisted.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Mock and @MockitoBean against vi.fn and overrideProvider', 'Mock lifecycle between tests', 'clearMocks, mockReset, restoreMocks', 'Strict stubs and hoisting'],
    outTitle: 'Not in scope',
    out: ['Fake timers', 'Integration tests: next episode'],
    note: 'Measured on Vitest 5.0.3 and on the Vitest 4.1.11 a fresh nest new installs.',
  },

  scale: {
    title: 'The measurements',
    note: 'One mock shared by two tests, each calling it once.',
    rows: [
      ['MOCKITO, @Mock FIELD', 'calls seen: 1, then 1'],
      ['VITEST 4.1 (nest new today), DEFAULT', 'calls seen: 1, then 2'],
      ['VITEST 5.0, DEFAULT', 'calls seen: 1, then 1'],
      ['clearMocks', 'history cleared, stub kept'],
      ['mockReset', 'describe-scope stub undefined from test 1'],
      ['restoreMocks', 'spy back to the real method'],
      ['UNUSED STUB, MOCKITO', 'UnnecessaryStubbingException'],
      ['UNUSED STUB, VITEST', 'passes, no warning'],
      ['vi.mock FACTORY READS A FILE CONST', 'ReferenceError: before initialization'],
    ],
  },

  sections: [
    {
      id: 'config',
      title: 'On the Vitest a new project gets',
      body: ['@nestjs/schematics 12.0.6 pins "vitest": "^4.1.2", which never reaches 5. Set clearMocks, or upgrade to Vitest 5 deliberately after its migration notes.'],
      code: [{caption: 'vitest.config.ts', lines: [
        "import { defineConfig } from 'vitest/config';",
        '',
        'export default defineConfig({',
        '  test: { clearMocks: true },',
        '});',
      ]}],
      claims: [{text: 'shared mock: Vitest 4.1 default 1 then 2; with clearMocks 1 then 1; Vitest 5.0 default 1 then 1', source: RUN}],
    },
    {
      id: 'override',
      title: 'The container-level swap',
      body: ['@MockitoBean replaces a bean in the Spring test context; overrideProvider replaces a provider in the Nest testing module. At the time of recording, @MockBean is not in Spring Boot 4.'],
      code: [{caption: 'override.spec.ts', lines: [
        'const moduleRef = await Test.createTestingModule({ controllers: [AppController], providers: [AppService] })',
        '  .overrideProvider(AppService)',
        "  .useValue({ getHello: vi.fn().mockReturnValue('stubbed') })",
        '  .compile();',
      ]}],
      claims: [{text: 'overrideProvider: the controller returned "stubbed"; @MockitoBean: the injected bean returned "stubbed"', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Vitest 5.0, nest new installs Vitest 4.1, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a Vitest suite like a Mockito one',
    items: [
      'Check which Vitest major your project is on',
      'On Vitest 4, set clearMocks: true',
      'Do not turn on mockReset with describe-scope stubs',
      'Create shared stubs in beforeEach',
      'Keep vi.mock factories self-contained',
      'In NestJS, prefer overrideProvider over module mocks',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-testing.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'Vitest migration guide', url: 'https://vitest.dev/guide/migration.html'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
