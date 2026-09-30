/**
 * Spring to Node design sheet, episode 24 in the course list: caching with Redis.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-cache.sh` in the course repository.
 * @nestjs/cache-manager 12.0.0, cache-manager 7.2.9, @keyv/redis 5.1.6, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-cache.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Bob saw Alice.',
  subtitle: 'Spring Boot to NestJS, episode 24: caching with Redis',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A cache is a copy with a key, a lifetime and a fill policy. Get any of the three wrong and it shows.',
  verifiedOn: '2026-09-30',

  intro: [
    'Bob was served Alice\'s cached account on both stacks: Nest keyed by URL, Spring\'s method took no arguments. The verified user in the key fixed it.',
    'No time to live is the default on both Redis setups. A write left the old copy until it was evicted.',
    'Twenty concurrent requests on a cold key loaded it twenty times. sync = true helped only where the cache supports it.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Cacheable, @CacheEvict, sync = true', 'CacheInterceptor, trackBy, CACHE_MANAGER', 'Redis with Spring Data Redis and @keyv/redis', 'Keys, TTL, stampedes, misses'],
    outTitle: 'Not in scope',
    out: ['HTTP caching headers and CDNs', 'Serialization formats'],
    note: 'At the time of recording the Nest docs describe @nestjs/cache-manager.',
  },

  scale: {
    title: 'The measurements',
    note: 'Redis unless stated.',
    rows: [
      ['GET /me AS ALICE, THEN BOB', 'Bob got Alice\'s on both; user in the key fixed it'],
      ['UPDATE, THEN READ', 'stale on both until evicted'],
      ['NO TTL, WAIT 1.2 s', '1 load on both: never expires'],
      ['20 AT ONCE, COLD KEY', 'plain 20; sync: memory 1, Redis default 20, locking 1'],
      ['NEST, SHARING THE IN-FLIGHT LOAD', '1 per process; 2 across two replicas'],
      ['20 GETs FOR A MISSING PAYMENT', 'Spring 1 (null cached); Nest interceptor 20'],
    ],
  },

  sections: [
    {
      id: 'key',
      title: 'Put the user in the key',
      body: ['CacheInterceptor keys by URL; a no-argument @Cacheable shares one key. Anything personal needs the verified user in the key.'],
      code: [
        {caption: 'AccountService.java', lines: ['@Cacheable(cacheNames = "accounts", key = "#user")', 'public Account meFor(String user) {', '    return new Account(user, "alice".equals(user) ? 1200 : 40);', '}']},
        {caption: 'per-user-cache.interceptor.ts', lines: [
          'protected trackBy(context: ExecutionContext): string | undefined {',
          '  const url = super.trackBy(context);',
          "  const user = context.switchToHttp().getRequest<{ headers: Record<string, string> }>().headers['x-user'];",
          '  return url && user ? `${url}:${user}` : undefined;',
          '}',
        ]},
      ],
      claims: [{text: 'with the user in the key, Bob got his own balance on both stacks', source: RUN}],
    },
    {
      id: 'fill',
      title: 'One load for many',
      body: ['sync = true asks the cache to coordinate the load. On Redis it did so only with the locking cache writer. In Nest, share the in-flight promise, per process.'],
      code: [
        {caption: 'CacheConfig.java', lines: ['RedisCacheManager.builder(RedisCacheWriter.lockingRedisCacheWriter(connections))', '    .cacheDefaults(RedisCacheConfiguration.defaultCacheConfig().entryTtl(ttl))', '    .build();']},
        {caption: 'payments.reader.ts', lines: [
          'let load = this.inFlight.get(key);',
          'if (!load) {',
          '  load = this.payments.find(id).then(async (payment) => {',
          '    await this.cache.set(key, payment);',
          '    return payment;',
          '  }).finally(() => this.inFlight.delete(key));',
          '  this.inFlight.set(key, load);',
          '}',
        ]},
      ],
      claims: [{text: 'two replicas, one Redis: locking writer 1 load; Nest in-flight sharing 2', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: @nestjs/cache-manager 12, cache-manager 7, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a cache',
    items: [
      'Is the verified user in the key of anything personal?',
      'What evicts the entry when the data changes?',
      'Is there a time to live at all?',
      'What happens when twenty requests miss at once?',
      'Is a miss cached, and for how long?',
      'Memory is per process; Redis is shared',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-cache.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS caching', url: 'https://docs.nestjs.com/techniques/caching'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Redis is a trademark of Redis Ltd. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
