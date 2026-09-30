/**
 * Spring to Node design sheet, episode 21 in the course list: NestJS rate limiting and throttling.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-throttle.sh` in the course
 * repository. @nestjs/throttler 6.7.1, Bucket4j 8.14.0, Spring Boot 4.1.1, Redis 8.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-throttle.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Wrong user. Blocked.',
  subtitle: 'Spring Boot to NestJS, episode 21: rate limiting and throttling',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'The limit number is the easy part. A rate limiter is a choice of identity, trust boundary and shared state.',
  verifiedOn: '2026-09-30',

  intro: [
    'Behind a proxy with default settings, client two\'s first request was refused on both stacks: every request carried the proxy\'s address.',
    'Trusting the whole X-Forwarded-For header let a client choose its own key: six requests, six 200s. Trusting the one hop you control stopped it after three.',
    'In memory, two instances allowed six of three and a restart reset the count. Redis allowed three and kept it.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@nestjs/throttler and Bucket4j in a servlet filter', 'Proxy trust: Express trust proxy, Spring forward-headers-strategy', 'Keying by a verified user', 'Shared storage in Redis', 'Window edge behaviour'],
    outTitle: 'Not in scope',
    out: ['Gateway and CDN limits', 'Sliding-window algorithms in depth'],
    note: 'Spring Boot has no built-in throttler here; Bucket4j in a filter is one common way to build it.',
  },

  scale: {
    title: 'The measurements',
    note: 'Three a minute; the edge probe three per two seconds.',
    rows: [
      ['BEHIND A PROXY, DEFAULT, CLIENT TWO FIRST REQUEST', '429 on both'],
      ['KEY FOR "attacker, 203.0.113.7"', 'one hop / native: 203.0.113.7; trust all / framework: attacker'],
      ['CLIENT WRITES ITS OWN HEADER, SIX REQUESTS', 'trust all: six 200s; one hop: three, then 429'],
      ['SAME ADDRESS, BOB AFTER ALICE x3', 'by address 429; by user 200'],
      ['TWO INSTANCES, SIX ALTERNATING', 'in memory 6 allowed; Redis 3'],
      ['RESTART AFTER 200 200 200 429', 'in memory next 200; Redis next 429'],
      ['2.2 s REQUEST, THREE PER 2 s', 'Spring 200; Nest 429 (blockDuration defaults to ttl)'],
    ],
  },

  sections: [
    {
      id: 'mapping',
      title: 'The mapping',
      body: ['Nest: ThrottlerModule sets the budget, ThrottlerGuard as APP_GUARD enforces it, keyed by req.ip unless you override getTracker. Spring: a Bucket4j bucket per key in a OncePerRequestFilter.'],
      code: [
        {caption: 'app.ts', lines: [
          'imports: [ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 3 }] })],',
          'providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],',
        ]},
        {caption: 'RateLimitFilter.java', lines: [
          'Bucket bucket = bucketFor.apply(scope + identity(request));',
          'ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);',
          'if (probe.isConsumed()) { chain.doFilter(request, response); return; }',
          'response.setHeader("Retry-After", String.valueOf(seconds));',
          'response.setStatus(429);',
        ]},
      ],
      claims: [{text: 'five requests at three a minute: 200 200 200 429 429 on both, Retry-After 60', source: RUN}],
    },
    {
      id: 'redis',
      title: 'Share the count',
      body: ['A ThrottlerStorage backed by Redis, so every instance counts the same hits. Bucket4j has a Lettuce proxy manager for the same job.'],
      code: [{caption: 'redis-storage.ts', lines: [
        'async increment(key: string, ttl: number, limit: number) {',
        "  const replies = await this.redis.multi().incr(key).pexpire(key, ttl, 'NX').pttl(key).exec();",
        '  const totalHits = Number(replies![0][1]);',
        '  const seconds = Math.ceil(Number(replies![2][1]) / 1000);',
        '  const isBlocked = totalHits > limit;',
        '  return { totalHits, timeToExpire: seconds, isBlocked, timeToBlockExpire: isBlocked ? seconds : 0 };',
        '}',
      ]}],
      claims: [{text: 'two instances, one Redis, six requests: three allowed; the count survived a restart', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: @nestjs/throttler 6.7, Bucket4j 8.14, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a rate limit',
    items: [
      'What is the key: the address, or a verified user?',
      'Behind a proxy, trust only the path you control',
      'Strip client-supplied forwarded headers at the edge',
      'More than one instance? Share the count',
      'Test the window edge, not just the count',
      'Broad abuse limits often belong at the gateway',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-throttle.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS rate limiting', url: 'https://docs.nestjs.com/security/rate-limiting'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Redis is a trademark of Redis Ltd. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
