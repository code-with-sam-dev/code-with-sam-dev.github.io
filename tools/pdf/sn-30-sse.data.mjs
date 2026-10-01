/**
 * Spring to Node design sheet, episode 31 in the course list: server sent events with NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-sse.sh` in the course repository,
 * with every server a real process and the eventsource 5.1.2 client. Nest 12, rxjs 7.8.2,
 * Spring Boot 4.1.1 on Tomcat 11.0.24.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-sse.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '33 updates, sent again.',
  subtitle: 'Spring Boot to NestJS, episode 31: server sent events',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A stream needs a lifetime and a resume point. The client remembers where it was; the server still has to honor that cursor.',
  verifiedOn: '2026-10-01',

  intro: [
    'A real EventSource on a Spring Boot SSE stream for 70 s: the stream timed out every 30 s, the client reconnected by itself, and 33 ids arrived more than once.',
    'The 30 s was Tomcat\'s async timeout default, which Spring Boot leaves in place. Nest imposed no timeout in the same test.',
    'Neither stack honoured Last-Event-ID until the endpoint read it. Then both resumed where the client left off.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['SseEmitter and @Sse', 'Stream lifetime', 'Last-Event-ID and reconnects', 'Cleanup and compression'],
    outTitle: 'Not in scope',
    out: ['Proxy heartbeats (not measured)', 'Slow consumers (see the WebSockets episode)'],
    note: 'At the time of recording Tomcat\'s async timeout default is 30000 ms.',
  },

  scale: {
    title: 'The measurements',
    note: 'One event a second, each with an id.',
    rows: [
      ['SPRING, NO TIMEOUT ARGUMENT', 'ended after 31 s (Tomcat default)'],
      ['NEST, @Sse', 'open after 70 s'],
      ['RECONNECT, HEADER NOT READ', 'both restarted at 1'],
      ['RECONNECT, HEADER READ', 'both resumed at 4'],
      ['EVENTSOURCE, SPRING, 70 s', '3 connections, 33 repeated'],
      ['EVENTSOURCE, SPRING, HEADER READ', '3 connections, 0 repeated'],
      ['CLIENT LEAVES / COMPRESSION ON', 'same on both'],
    ],
  },

  sections: [
    {
      id: 'resume',
      title: 'Honour the cursor',
      body: ['EventSource sends Last-Event-ID on every reconnect. Read it and continue from the next id; in a real system that means events you can read back by id.'],
      code: [{caption: 'payments.controller.ts', lines: [
        "@Sse('payments')",
        "payments(@Headers('last-event-id') lastEventId?: string): Observable<MessageEvent> {",
        '  const start = lastEventId ? Number(lastEventId) + 1 : 1;',
        '  return this.events.from(start); // your store, read by id',
        '}',
      ]}],
      claims: [{text: 'header read: both stacks resumed at 4; with EventSource, 0 repeated ids', source: RUN}],
    },
    {
      id: 'timeout',
      title: 'Set the lifetime on purpose',
      body: ['In Spring, pass a timeout to the emitter or set spring.mvc.async.request-timeout. In Nest, end the Observable when the stream should end.'],
      code: [{caption: 'PaymentsStream.java', lines: ['SseEmitter emitter = new SseEmitter(Duration.ofMinutes(30).toMillis());']}, {caption: 'application.properties', lines: ['spring.mvc.async.request-timeout=30m']}],
      claims: [{text: 'no timeout argument: the stream ended after 31 s, onTimeout fired', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Nest 12, RxJS 7.8, Spring Boot 4.1 on Tomcat 11.',

  checklist: {
    title: 'Before you ship an SSE endpoint',
    items: [
      'How long does a stream live, and who decided?',
      'Does every event carry an id?',
      'Does the endpoint read Last-Event-ID?',
      'Can you read past events back by id?',
      'Does a proxy close idle connections? Then send heartbeats.',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-sse.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS server sent events', url: 'https://docs.nestjs.com/techniques/server-sent-events'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Apache Tomcat is a trademark of the Apache Software Foundation. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
