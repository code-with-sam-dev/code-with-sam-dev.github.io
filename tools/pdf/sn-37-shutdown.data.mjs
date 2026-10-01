/**
 * Spring to Node design sheet, episode 38 in the course list: health checks and graceful shutdown.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-health.sh` in the course repository:
 * real processes and a real SIGTERM. Spring Boot 4.1.1; Nest 12.0.3, @nestjs/terminus 12.1.0.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-health.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Deployed. Payment killed.',
  subtitle: 'Spring Boot to NestJS, episode 38: health checks and graceful shutdown',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Graceful shutdown has three separate jobs: stop advertising readiness, finish the work in flight, then exit.',
  verifiedOn: '2026-10-01',

  intro: [
    'A SIGTERM half a second into a three second payment. Nest as created exited in milliseconds; the payment got a connection reset.',
    'Spring Boot 4.1 with Actuator and nothing configured finished the payment and reported readiness 503 while it drained.',
    'enableShutdownHooks finished the payment on Nest but reset new requests at once. A readiness check plus Terminus\'s delay gave Nest the same shape as Spring.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['Actuator health and probes', 'Terminus', 'In-flight requests on SIGTERM', 'Readiness during the drain'],
    outTitle: 'Not in scope',
    out: ['Signals and PID 1 in containers (episode 35)', 'Kubernetes probe tuning'],
    note: 'At the time of recording Spring Boot 4.1 defaults server.shutdown to graceful and enables the health probes.',
  },

  scale: {
    title: 'The measurements',
    note: 'SIGTERM 500 ms into a 3 s payment.',
    rows: [
      ['SPRING 4.1, DEFAULTS', 'payment 200; readiness 503 while serving'],
      ['NEST AS CREATED', 'payment reset; gone in milliseconds'],
      ['NEST, enableShutdownHooks()', 'payment 200; new requests reset'],
      ['NEST, + READINESS + TERMINUS DELAY', 'payment 200; readiness 503 while serving'],
    ],
  },

  sections: [
    {
      id: 'nest',
      title: 'All three jobs on Nest',
      body: ['Enable shutdown hooks, fail readiness from beforeApplicationShutdown, and give the router time with Terminus\'s graceful shutdown delay.'],
      code: [{caption: 'main.ts', lines: ['app.enableShutdownHooks();']}, {caption: 'readiness.ts', lines: [
        '@Injectable()',
        'export class Readiness implements BeforeApplicationShutdown {',
        '  shuttingDown = false;',
        '  beforeApplicationShutdown() {',
        '    this.shuttingDown = true; // the readiness check now reports 503',
        '  }',
        '}',
      ]}, {caption: 'app.module.ts', lines: ['TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 2000 })']}],
      claims: [{text: 'payment 200; readiness 503 while new requests were still served; then refused', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Spring Boot 4.1, @nestjs/terminus 12.1, Nest 12.',

  checklist: {
    title: 'Before you trust a deploy',
    items: [
      'Does readiness fail as soon as shutdown begins?',
      'Does the app keep serving long enough for the router to notice?',
      'Do in-flight requests finish?',
      'Does the signal reach the process in the container?',
      'Is the shutdown timeout shorter than the orchestrator\'s grace period?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-health.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS health checks (Terminus)', url: 'https://docs.nestjs.com/recipes/terminus'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
