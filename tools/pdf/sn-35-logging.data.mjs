/**
 * Spring to Node design sheet, episode 36 in the course list: logging, Logback to NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-logging.sh` in the course repository,
 * real processes, one request with X-Request-Id req-42. Logback 1.5.38 in Spring Boot 4.1.1; Nest
 * 12.0.3, nestjs-pino 5.2.1, pino 10.3.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-logging.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Four log lines. Two ids.',
  subtitle: 'Spring Boot to NestJS, episode 36: logging',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Structured logs tell you what happened. Request context tells you which execution it belonged to.',
  verifiedOn: '2026-10-01',

  intro: [
    'Both stacks emit JSON with one switch. Neither switch invents a request id.',
    'Spring\'s MDC is thread local by default: a CompletableFuture and an @Async method lost the id until a TaskDecorator copied it, and the common pool still had nothing.',
    'Nest\'s ConsoleLogger carries no request context. nestjs-pino, through AsyncLocalStorage, carried it on all four lines.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['SLF4J and Logback to Nest\'s Logger', 'JSON logs', 'MDC and TaskDecorator', 'AsyncLocalStorage via nestjs-pino'],
    outTitle: 'Not in scope',
    out: ['Traces (episode 37)', 'Log shipping and retention'],
    note: 'At the time of recording Nest\'s ConsoleLogger has a json option.',
  },

  scale: {
    title: 'The measurements',
    note: 'One request, four places that log, which lines carried req-42.',
    rows: [
      ['SPRING, DEFAULT TEXT', '0 of 4 (MDC not printed)'],
      ['SPRING, ECS JSON', '2 of 4'],
      ['SPRING, ECS + TaskDecorator', '3 of 4'],
      ['NEST, ConsoleLogger TEXT / JSON', '0 of 4'],
      ['NEST, nestjs-pino', '4 of 4'],
    ],
  },

  sections: [
    {
      id: 'nest',
      title: 'Request context on Nest',
      body: ['Take the request id from the header and let AsyncLocalStorage carry it into every log line of that request.'],
      code: [{caption: 'app.module.ts', lines: [
        'LoggerModule.forRoot({',
        '  pinoHttp: {',
        "    genReqId: (req) => String(req.headers['x-request-id'] ?? randomUUID()),",
        '  },',
        '}),',
      ]}, {caption: 'main.ts', lines: ['const app = await NestFactory.create(AppModule, { bufferLogs: true });', 'app.useLogger(app.get(Logger));']}],
      claims: [{text: 'nestjs-pino: controller, service, after an await, in a setTimeout: 4 of 4', source: RUN}],
    },
    {
      id: 'spring',
      title: 'Carry the MDC across threads on Spring',
      body: ['A TaskDecorator copies the MDC onto Spring\'s task executor. Any other executor needs its own propagation.'],
      code: [{caption: 'TaskDecorator', lines: [
        '@Bean',
        'TaskDecorator mdcTaskDecorator() {',
        '  return task -> {',
        '    var context = MDC.getCopyOfContextMap();',
        '    return () -> {',
        '      if (context != null) MDC.setContextMap(context);',
        '      try { task.run(); } finally { MDC.clear(); }',
        '    };',
        '  };',
        '}',
      ]}],
      claims: [{text: 'with the decorator: @Async carried it, CompletableFuture.runAsync did not', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Logback 1.5 in Spring Boot 4.1, Nest 12, nestjs-pino 5.2, pino 10.',

  checklist: {
    title: 'Before you trust your logs in production',
    items: [
      'Is every line JSON, with a level and a logger name?',
      'Does every line of a request carry its request id?',
      'Does the id survive a thread change, an await, a timer?',
      'Is the id taken from the incoming header, or generated?',
      'Does it reach the response, so a client can quote it?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-logging.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS logger', url: 'https://docs.nestjs.com/techniques/logger'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
