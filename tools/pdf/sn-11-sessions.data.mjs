/**
 * Spring to Node design sheet, episode 12 in the course list: CORS, cookies and sessions.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-sessions.sh` in the course
 * repository. Node 22.22.2, Express 5.2.1, express-session 1.19.0, NestJS 12, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-sessions.sh in the course repository.';
const SESSION = 'express-session 1.19.0 README, read 2026-09-30.';
const BOOT = 'spring-boot-web-server 4.1.1 configuration metadata, read 2026-09-30.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '10,000 sessions. No expiry.',
  subtitle: 'Spring Boot to NestJS, episode 12: CORS, cookies and sessions',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'The concept transfers. The infrastructure defaults do not.',
  verifiedOn: '2026-09-30',

  intro: [
    'A session is a cookie carrying an identifier, plus state on the server, on both stacks.',
    'Spring\'s servlet container provides the server side with a 30 minute timeout. In NestJS on Express you install express-session, and inherit its MemoryStore and its lack of expiry.',
    'CORS is enforced by the browser on both, in two paths, and which origins you trust is your decision on both.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'express-session in NestJS on Express, and its defaults',
      'The Set-Cookie headers both stacks send',
      'CORS for a simple request and for a preflighted one',
      'Credentialed CORS: reflected origins, Spring\'s wildcard rule',
    ],
    outTitle: 'Not in scope',
    out: ['CSRF protection: a separate subject', 'What browsers do with a missing SameSite'],
    note: 'Preflight pass or fail is the Fetch standard\'s check applied by the script, not a real browser.',
  },

  scale: {
    title: 'The measurements',
    note: 'Nothing configured unless stated.',
    rows: [
      ['NODE_ENV=development', 'no warning'],
      ['NODE_ENV=production', 'MemoryStore warning'],
      ['10,000 ONE-TIME VISITORS', '10,000 sessions held, 2 s later 10,000'],
      ['cookie maxAge / expires', 'null / null'],
      ['SPRING SESSION TIMEOUT', '1800 s, reported'],
      ['SIMPLE GET, ANY CONFIG', 'handler ran 1x'],
      ['PREFLIGHTED PUT, none / listed origin', 'real PUT not sent'],
      ['origin: true + credentials', 'reflects https://evil.example'],
    ],
  },

  sections: [
    {
      id: 'session',
      title: 'Register a session, and choose its store and expiry',
      body: ['express-session keeps sessions in a MemoryStore unless you give it another store, and sets no cookie maxAge unless you do. Choose both before production.'],
      code: [
        {caption: 'sessions.ts (repository)', lines: [
          "import session from 'express-session';",
          '',
          "app.use(session({ secret: 'demo-only', resave: false, saveUninitialized: false }));",
        ]},
        {caption: 'the Spring side, for comparison', lines: [
          '@GetMapping("/visit")',
          'public Map<String, Object> visit(HttpSession session) { ... }',
          '',
          '# default: server.servlet.session.timeout=30m',
        ]},
      ],
      claims: [
        {text: 'MemoryStore "is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process"', source: SESSION},
        {text: 'cookie.maxAge: "By default, no maximum age is set."', source: SESSION},
        {text: 'server.servlet.session.timeout default 30m', source: BOOT},
      ],
    },
    {
      id: 'cors',
      title: 'CORS: two browser paths',
      body: ['A simple GET is sent for real; CORS decides whether the page may read the answer. A preflighted request is checked with OPTIONS first, and if that fails the real request is never sent. CORS is browser enforcement, not server side authorization.'],
      code: [{caption: 'origins you trust, by name', lines: [
        "app.enableCors({ origin: ['https://app.example'], credentials: true });",
      ]}],
      claims: [
        {text: 'Simple GET from https://evil.example: handler ran once under all four configurations; preflighted PUT: not sent with nothing configured or with a listed origin', source: RUN},
        {text: 'origin: true with credentials: true reflected https://evil.example with credentials allowed; Spring allowedOriginPatterns("*") did the same', source: RUN},
      ],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: express-session 1.19, Express 5.2, Spring Boot 4.1.',

  checklist: {
    title: 'Before you ship sessions in NestJS',
    items: [
      'Replace MemoryStore with a real store',
      'Set cookie.maxAge, and secure in production',
      'Set NODE_ENV=production so the package can warn you',
      'List trusted origins by name when credentials are on',
      'Never origin: true with credentials: true',
      'Treat CORS as browser policy, not authorization',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-sessions.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'express-session', url: 'https://github.com/expressjs/session'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
