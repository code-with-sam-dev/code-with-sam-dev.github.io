/**
 * Spring to Node design sheet, episode 28 in the course list: RabbitMQ with NestJS microservices.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-rabbitmq.sh` in the course
 * repository, against rabbitmq 4.1 with real processes. @nestjs/microservices 12.0.3, amqplib
 * 2.2.0, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-rabbitmq.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '19,000 redeliveries. Or one.',
  subtitle: 'Spring Boot to NestJS, episode 28: RabbitMQ with NestJS microservices',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Acknowledgement is the real contract. Once the broker thinks a message is finished, failure after that is yours to handle.',
  verifiedOn: '2026-10-01',

  intro: [
    'A payment that always fails: Spring Boot\'s listener container redelivered it over 19,000 times in ten seconds. Nest\'s defaults delivered it once, and the queue was empty afterwards.',
    'With manual acknowledgement the message stayed, and came back after a restart. With a dead letter queue, both stacks parked it after one attempt.',
    'Nest wraps messages as { pattern, data }. Spring sends bare JSON with a type header, and Nest dropped it.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@RabbitListener and @EventPattern', 'Acknowledgement and requeue defaults', 'Dead letter queues', 'The message envelope'],
    outTitle: 'Not in scope',
    out: ['Exchanges and routing in depth', 'Publisher confirms'],
    note: 'At the time of recording Nest\'s RabbitMQ transport defaults to noAck: true.',
  },

  scale: {
    title: 'The measurements',
    note: 'A payment that always fails, then three good ones.',
    rows: [
      ['SPRING BOOT DEFAULTS, 10 s', 'over 19,000 deliveries; still in the queue'],
      ['NEST DEFAULTS (noAck true)', '1 delivery; queue empty'],
      ['NEST noAck false, ACK ON SUCCESS', 'kept; redelivered after a restart'],
      ['DEAD LETTER QUEUE, BOTH', '1 attempt; parked'],
      ['NEST READING SPRING\'S MESSAGE', 'no pattern: handled 0, gone'],
    ],
  },

  sections: [
    {
      id: 'ack',
      title: 'Acknowledge on purpose',
      body: ['Turn acknowledgements on in Nest and acknowledge after the handler succeeds; reject without requeue when you give up, and let the queue\'s dead letter exchange take it.'],
      code: [{caption: 'payments.consumer.ts', lines: [
        "@EventPattern('payment.created')",
        'handle(@Payload() payment: Payment, @Ctx() context: RmqContext) {',
        '  const channel = context.getChannelRef();',
        '  const message = context.getMessage();',
        '  try {',
        '    settle(payment);',
        '    channel.ack(message);',
        '  } catch {',
        '    channel.nack(message, false, false); // to the dead letter queue',
        '  }',
        '}',
      ]}],
      claims: [{text: 'with a dead letter queue: one attempt, the failing payment parked, on both stacks', source: RUN}],
    },
    {
      id: 'spring',
      title: 'Cap the Spring requeue',
      body: ['Spring Boot\'s listener container requeues a failed delivery by default. Turn that off, or add a retry interceptor, and give the queue a dead letter exchange.'],
      code: [{caption: 'application.properties', lines: ['spring.rabbitmq.listener.simple.default-requeue-rejected=false']}],
      claims: [{text: 'Boot defaults: over 19,000 deliveries in ten seconds', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/microservices 12, amqplib 2.2, Spring Boot 4.1, RabbitMQ 4.1.',

  checklist: {
    title: 'Before you trust a RabbitMQ consumer',
    items: [
      'Is the message acknowledged before or after your code runs?',
      'What happens when the handler throws?',
      'Is there a limit on requeues?',
      'Does every queue have a dead letter queue?',
      'Do producer and consumer agree on the envelope?',
      'What is the prefetch?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-rabbitmq.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS RabbitMQ', url: 'https://docs.nestjs.com/microservices/rabbitmq'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. RabbitMQ is a trademark of Broadcom. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
