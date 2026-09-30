/**
 * Spring to Node design sheet, episode 23 in the course list: retries and circuit breakers.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-resilience.sh` in the course
 * repository. Spring Framework 7.0.9, Resilience4j 2.4.0, @nestjs/resilience 0.0.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-resilience.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One request. Nine calls.',
  subtitle: 'Spring Boot to NestJS, episode 23: retries and circuit breakers',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A retry multiplies calls, and two retry layers multiply each other. Retry at one layer, only what is safe to repeat, and let a breaker stop new calls once failure is established.',
  verifiedOn: '2026-09-30',

  intro: [
    'One request while the payments API was down became nine calls, on both stacks: two retry layers, three attempts each.',
    'Spring\'s maxRetries counts retries; Nest\'s attempts counts calls. @Retryable with no settings made four calls a second apart.',
    'The same breaker settings let five calls through and refused fifteen on Resilience4j and on Nest\'s @CircuitBreaker.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['Spring Framework 7 @Retryable', 'Resilience4j CircuitBreaker', '@nestjs/resilience @Retry and @CircuitBreaker', 'Nested retries, backoff, jitter'],
    outTitle: 'Not in scope',
    out: ['Bulkheads and rate limiters in depth', 'Service meshes'],
    note: 'At the time of recording @nestjs/resilience is version 0.0.1.',
  },

  scale: {
    title: 'The measurements',
    note: 'Three attempts everywhere: Spring maxRetries 2, Nest attempts 3.',
    rows: [
      ['RETRY OVER A RETRYING LAYER', '9 calls on both; 3 with the inner layer off'],
      ['@Retryable, NO SETTINGS', '4 calls at 0, 1000, 2010, 3010 ms'],
      ['RETRY ON A POST', 'Spring method: 3; Nest handler: 1, idempotent: true: 3'],
      ['WHERE IT APPLIES', 'Nest service method: 1 + boot warning; Spring via this: 1'],
      ['20 CALLERS WHILE DOWN', '60 calls on both'],
      ['BREAKER, WINDOW 5, 50 PERCENT, OPEN 1 s', '5 through, 15 refused, then closed'],
    ],
  },

  sections: [
    {
      id: 'retry',
      title: 'The mapping',
      body: ['Spring Framework 7 has @Retryable, enabled by @EnableResilientMethods. @nestjs/resilience puts @Retry on handlers. maxRetries = 2 and attempts: 3 are the same three calls.'],
      code: [
        {caption: 'PaymentsGateway.java', lines: [
          '@Retryable(maxRetries = 2, delay = 200, multiplier = 2, jitter = 50)',
          'public String status() {',
          '    return http.get().uri("/status").retrieve().body(String.class);',
          '}',
        ]},
        {caption: 'payments.controller.ts', lines: [
          "@Get('status')",
          '@Retry({ attempts: 3 })',
          'async status() {',
          '  return (await this.http.get(`${base}/status`)).data;',
          '}',
        ]},
      ],
      claims: [{text: '@Retry over the HTTP client\'s default retries: 9 calls; client retry off: 3', source: RUN}],
    },
    {
      id: 'breaker',
      title: 'The same breaker on both',
      body: ['Count window of five calls, open at 50 percent failures, open for one second, one trial call half-open.'],
      code: [
        {caption: 'Resilience4j', lines: [
          'CircuitBreakerConfig.custom()',
          '    .slidingWindowType(CircuitBreakerConfig.SlidingWindowType.COUNT_BASED)',
          '    .slidingWindowSize(5).minimumNumberOfCalls(5).failureRateThreshold(50)',
          '    .waitDurationInOpenState(Duration.ofSeconds(1)).permittedNumberOfCallsInHalfOpenState(1)',
          '    .build();',
        ]},
        {caption: '@nestjs/resilience', lines: [
          "@CircuitBreaker({ failureRateThreshold: 50, minimumCalls: 5, slidingWindow: { type: 'count', size: 5 }, openDuration: '1s', halfOpenMaxCalls: 1 })",
        ]},
      ],
      claims: [{text: 'twenty calls while down: five reached the API, fifteen refused, on both', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Spring Framework 7.0, Resilience4j 2.4, @nestjs/resilience 0.0.1.',

  checklist: {
    title: 'Before you trust a retry',
    items: [
      'Exactly one retry layer: turn off the ones underneath',
      'Count attempts, not retries, when you translate',
      'Only retry what is safe to repeat',
      'Check the retry actually wraps the call (entrypoints; not via this)',
      'Back off with jitter',
      'A breaker stops new calls once failure is established',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-resilience.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS resilience', url: 'https://docs.nestjs.com/reliability/resilience'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
