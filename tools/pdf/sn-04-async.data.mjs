/**
 * Spring to Node, Episode 4 design sheet (episode 5 in the course list): async and
 * the event loop.
 *
 * EVERY NUMBER HERE WAS RUN, on 2026-09-29, by `scripts/verify-async.sh` in the
 * course repository. Node 22.22.2, NestJS 12.0.1, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-29, by scripts/verify-async.sh in the course repository.';
const NODE = 'Node.js documentation: the event loop, "Don\'t Block the Event Loop", and worker_threads, checked 2026-09-29.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Slow Handler. Everyone Waits.',
  subtitle: 'Spring Boot to NestJS, episode 4: async and the event loop',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'In the normal NestJS request path, your handlers share one event-loop thread.',
  verifiedOn: '2026-09-29',

  intro: [
    'In Spring MVC, Tomcat gives each request a thread from its pool. While the pool has capacity, a handler that blocks occupies its own thread and the others carry on.',
    'In NestJS, your handlers share one event-loop thread. The Node.js documentation says it precisely: a single JavaScript thread is used by default. Occupy it, and unrelated requests wait.',
    'Versions on this sheet were current on 29 September 2026: Node 22, NestJS 12, Spring Boot 4.1.1.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What one busy handler costs every other request',
      'Why await helps only when what it awaits yields',
      'A benchmark that measured itself, and how to avoid it',
      'What blocks the event loop, and the documented ways out',
      'Where Spring\'s @Async executor went',
    ],
    outTitle: 'Not in scope',
    out: [
      'Spring WebFlux and MVC async support (Callable, DeferredResult)',
      'Thread pool sizes: none is named, because none is needed here',
    ],
    note: 'The Spring handler sleeps and the NestJS one stays busy: not the same workload. What is compared is an unrelated request while one handler cannot progress.',
  },

  scale: {
    title: 'The measurement',
    note: 'The same 1.5 seconds. Three different costs to everyone else.',
    rows: [
      ['SPRING MVC, BLOCKING', 'slow 1513 ms, ping during it 4 ms'],
      ['NESTJS, SYNCHRONOUS', 'slow 1500 ms, ping during it 1402 ms'],
      ['NESTJS, AWAITING A TIMER', 'slow 1500 ms, ping during it 2 ms'],
      ['ONE-PROCESS BENCHMARK', 'meant to send at 100 ms, sent at 1513 ms, timed 4 ms'],
      ['PBKDF2SYNC', 'ping during it 1329 ms'],
      ['PBKDF2 (ASYNC)', 'ping during it 1 ms, on Node\'s worker pool'],
    ],
  },

  sections: [
    {
      id: 'blocking',
      title: 'The handler that stops everyone',
      body: ['A handler that keeps the thread busy for 1.5 seconds. A ping sent 100 ms later waited for the rest of it.'],
      code: [{caption: 'nestjs-api/src/ep04-async/blocking.ts', lines: [
        "@Get('slow')",
        'slow() {',
        '  const until = Date.now() + BLOCK_MS;',
        '  while (Date.now() < until) {',
        '    /* spin */',
        '  }',
        '  return { blockedMs: BLOCK_MS };',
        '}',
      ]}],
      claims: [{text: '"a single JavaScript thread is used by default"', source: NODE}, {text: 'Ping during it: 1402 ms.', source: RUN}],
    },
    {
      id: 'await',
      title: 'The one change',
      body: ['The handler still takes 1.5 seconds. It awaits a real timer, suspends, and control returns to the event loop, so the ping runs.'],
      code: [{caption: 'nestjs-api/src/ep04-async/non-blocking.ts', lines: [
        "@Get('slow')",
        'async slow() {',
        '  await new Promise((r) => setTimeout(r, WAIT_MS));',
        '  return { waitedMs: WAIT_MS };',
        '}',
      ]}],
      claims: [{text: 'Awaiting a genuinely asynchronous operation lets the handler stay pending without occupying the event loop. Ping: 2 ms.', source: RUN}],
    },
    {
      id: 'crypto',
      title: 'What really blocks',
      body: ['Large JSON parsing and stringifying, complex regular expressions, long loops that never yield, and synchronous crypto, zlib and fs calls. Some Node functions offload their own work: asynchronous pbkdf2 runs on the worker pool.'],
      code: [{caption: 'nestjs-api/src/ep04-async/crypto.ts', lines: [
        "@Get('hash-sync')",
        'hashSync() {',
        "  return { key: pbkdf2Sync('secret', 'salt', ITERATIONS, 64, 'sha512').toString('hex').slice(0, 8) };",
        '}',
        '',
        "@Get('hash-async')",
        'async hashAsync() {',
        "  const key = await pbkdf2Async('secret', 'salt', ITERATIONS, 64, 'sha512');",
        "  return { key: key.toString('hex').slice(0, 8) };",
        '}',
      ]}],
      claims: [
        {text: '"the Event Loop should orchestrate client requests, not fulfill them itself"', source: NODE},
        {text: '"Workers (threads) are useful for performing CPU-intensive JavaScript operations. They do not help much with I/O-intensive work."', source: NODE},
      ],
    },
    {
      id: 'interview',
      title: 'The questions this answers',
      body: ['Why can one slow NestJS handler delay every other request?', 'When does await help, and when does it not?', 'What is the difference between Node\'s worker pool and worker_threads?', 'Where did Spring\'s @Async go?', 'Why can a benchmark in the same process hide the problem it measures?'],
      code: [],
      claims: [],
    },
  ],

  scaleNote: 'Node 22.22.2, NestJS 12.0.1, Spring Boot 4.1.1, on 29 September 2026.',

  checklist: {
    title: 'Before you ship a NestJS handler',
    items: [
      'Keep event-loop work short',
      'Await only helps when what it awaits yields',
      'Use the async version of crypto, zlib and fs',
      'Break long CPU work into pieces that yield, or use a worker thread',
      'Put heavy jobs on a queue',
      'Never time a server from inside its own process',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-async.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'Node.js: Don\'t Block the Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with ' +
    'Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
