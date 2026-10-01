/**
 * Spring to Node design sheet, episode 30 in the course list: WebSockets with NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-websockets.sh` in the course
 * repository, with every server a real process. @nestjs/websockets 12.1.2, socket.io 4.8.3,
 * ws 8.22.0, @socket.io/redis-adapter 8.3.0, Spring Boot 4.1.1, RabbitMQ 4.1 with STOMP.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-websockets.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One slow client. 48 MB.',
  subtitle: 'Spring Boot to NestJS, episode 30: WebSockets',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A realtime connection is not just a socket. Choose the protocol, how messages cross instances, and what happens when a client cannot keep up.',
  verifiedOn: '2026-10-01',

  intro: [
    'A client that stops reading: Spring closed the session at its 512 KB send buffer limit. NestJS kept it open, with about 48 MB queued for that one socket.',
    'A plain WebSocket client could not connect to Nest\'s default gateway, which speaks Socket.IO. With WsAdapter it could.',
    'Two instances, one client on each: the defaults on both stacks reached one of two. A shared broker reached both.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@MessageMapping and @SubscribeMessage', 'STOMP, Socket.IO and plain WebSocket', 'Fan out across instances', 'Slow clients'],
    outTitle: 'Not in scope',
    out: ['Authentication on the handshake', 'Server sent events (next episode)'],
    note: 'At the time of recording Nest\'s default WebSocket adapter is Socket.IO.',
  },

  scale: {
    title: 'The measurements',
    note: 'Every server a real process; a slow client is one whose TCP socket stopped reading.',
    rows: [
      ['PLAIN CLIENT, NEST DEFAULT GATEWAY', 'failed: socket hang up'],
      ['PLAIN CLIENT, NEST WsAdapter', 'connected, broadcast received'],
      ['TWO INSTANCES, DEFAULTS, BOTH STACKS', 'instance two received 0'],
      ['RABBITMQ RELAY / REDIS ADAPTER', 'both received it'],
      ['SLOW CLIENT, SPRING DEFAULTS', 'closed at the 512 KB limit'],
      ['SLOW CLIENT, NEST', 'about 48 MB queued after 15 s'],
      ['NEST WITH A 512 KB CHECK', 'disconnected; bounded'],
    ],
  },

  sections: [
    {
      id: 'guard',
      title: 'Bound the queue per client',
      body: ['Before every send, check how much is already queued for that client. Past your limit, disconnect it (messages intact, connection lost) or drop and merge updates (connection kept, messages lost). Choose one on purpose.'],
      code: [{caption: 'payments.gateway.ts', lines: [
        'const LIMIT = 512 * 1024;',
        'function send(client: WebSocket, data: string) {',
        '  if (client.readyState !== client.OPEN) return;',
        '  if (client.bufferedAmount > LIMIT) {',
        '    client.terminate();',
        '    return;',
        '  }',
        '  client.send(data);',
        '}',
      ]}],
      claims: [{text: 'with the 512 KB check: terminated once the queue crossed 524288 bytes', source: RUN}],
    },
    {
      id: 'fanout',
      title: 'Fan out across instances',
      body: ['A WebSocket connection lives on one process. Spring needs a broker relay; Nest\'s Socket.IO needs an adapter such as Redis.'],
      code: [{caption: 'main.ts', lines: [
        'const pub = new Redis(url);',
        'const sub = pub.duplicate();',
        'server.adapter(createAdapter(pub, sub));',
      ]}, {caption: 'WebSocketConfig.java', lines: ['registry.enableStompBrokerRelay("/topic").setRelayPort(relayPort);']}],
      claims: [{text: 'two instances: RabbitMQ relay 1 and 1, Redis adapter 1 and 1', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/websockets 12.1, Socket.IO 4.8, ws 8.22, Spring Boot 4.1. Spring\'s defaults: send buffer 512 KB, send time 10 s.',

  checklist: {
    title: 'Before you ship a WebSocket gateway',
    items: [
      'What protocol do your clients speak: Socket.IO, STOMP or plain WebSocket?',
      'Does a broadcast reach clients on every instance?',
      'What happens when one client stops reading?',
      'Disconnect or drop: which promise does each message type need?',
      'How does a client catch up after a reconnect?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-websockets.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS gateways', url: 'https://docs.nestjs.com/websockets/gateways'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. RabbitMQ is a trademark of Broadcom. Redis is a trademark of Redis Ltd. ' +
    'This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
