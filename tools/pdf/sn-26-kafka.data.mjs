/**
 * Spring to Node design sheet, episode 27 in the course list: Kafka with NestJS microservices.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-kafka.sh` in the course repository,
 * against apache/kafka 4.2.1 with real processes. @nestjs/microservices 12.0.3, kafkajs 2.2.4,
 * Spring Kafka 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-kafka.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Same group. Twice.',
  subtitle: 'Spring Boot to NestJS, episode 27: Kafka with NestJS microservices',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Moving a Kafka consumer is not moving a listener. The group, the failure policy and the wire contract are where the defaults stop matching.',
  verifiedOn: '2026-10-01',

  intro: [
    'Spring and Nest both configured with group payments handled ten messages twenty times: Nest appends -server to the group id.',
    'With the suffix removed, Spring could not join the group at all: the two clients name their partition assignors differently.',
    'A poison message: Spring retried ten times and moved on; Nest kept redelivering and blocked the partition. And Spring refused Nest\'s JSON until given a default type.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@KafkaListener and @EventPattern', 'Consumer groups across stacks', 'Poison messages', 'JSON on the wire'],
    outTitle: 'Not in scope',
    out: ['Exactly-once and transactions', 'Schema registries'],
    note: 'At the time of recording Nest\'s Kafka transport uses kafkajs 2.2.4.',
  },

  scale: {
    title: 'The measurements',
    note: '3 partitions, real processes.',
    rows: [
      ['BOTH GROUP payments, 10 MESSAGES', '20 handled: groups payments and payments-server'],
      ['postfixId \'\'', 'Spring: InconsistentGroupProtocolException, never joined'],
      ['POISON, THEN 5 GOOD, SAME KEY', 'Spring 10 attempts, 5 of 5; Nest 6 attempts, 0 of 5'],
      ['POISON, GOOD ON OTHER KEYS', 'Nest: other partitions flowed'],
      ['SPRING READS NEST\'S JSON', 'refused without a default type; reads it with one'],
    ],
  },

  sections: [
    {
      id: 'group',
      title: 'Check the effective group',
      body: ['Nest appends a role suffix to the group id. Removing it matched the names, but a Spring and a Nest consumer still could not share the group in this setup: move whole groups.'],
      code: [{caption: 'main.ts', lines: ["transport: Transport.KAFKA,", 'options: {', "  client: { clientId: 'payments', brokers: [broker] },", "  consumer: { groupId: 'payments' },", "  postfixId: '',", '},']}],
      claims: [{text: 'both configured with group payments: 20 handlings for 10 messages', source: RUN}],
    },
    {
      id: 'wire',
      title: 'Make the schema the contract',
      body: ['Spring\'s JSON serializer adds a __TypeId__ header with the Java class name. For a topic two languages share, read by default type and ignore type headers.'],
      code: [{caption: 'application.properties', lines: [
        'spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.ErrorHandlingDeserializer',
        'spring.kafka.consumer.properties.spring.deserializer.value.delegate.class=org.springframework.kafka.support.serializer.JacksonJsonDeserializer',
        'spring.kafka.consumer.properties.spring.json.use.type.headers=false',
        'spring.kafka.consumer.properties.spring.json.value.default.type=com.example.Payment',
      ]}],
      claims: [{text: 'with type headers ignored and a default type, Spring read both Spring\'s and Nest\'s messages', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/microservices 12, kafkajs 2.2.4, Spring Kafka 4.1, Kafka 4.2.',

  checklist: {
    title: 'Before you move a Kafka consumer',
    items: [
      'What group id does the broker actually see?',
      'Can the old and new consumers share it? Test it',
      'What happens to a message that always fails?',
      'Does a stuck partition block others?',
      'Is the payload contract a schema, or a Java class name?',
      'Long handlers: check heartbeats',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-kafka.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS Kafka', url: 'https://docs.nestjs.com/microservices/kafka'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Apache Kafka is a trademark of the Apache Software Foundation. This is an ' +
    'independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
