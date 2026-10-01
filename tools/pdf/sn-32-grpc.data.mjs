/**
 * Spring to Node design sheet, episode 33 in the course list: gRPC with NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-grpc.sh` in the course repository,
 * one payments.proto served by both stacks as real processes. @nestjs/microservices 12.0.3,
 * @grpc/grpc-js 1.14.5, @grpc/proto-loader 0.8.1, Spring gRPC 1.0.3 on Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-grpc.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '1999 plus 1. "19991".',
  subtitle: 'Spring Boot to NestJS, episode 33: gRPC',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Same proto, different runtime types. The proto is shared; the language mapping is not.',
  verifiedOn: '2026-10-01',

  intro: [
    'One payments.proto with an int64 amount: Spring\'s handler got a long, so 1999 plus 1 was 2000.',
    'Nest passes its loader options straight to proto-loader. With none, the amount was a Long object: 1999 plus 1 joined strings, and zero was not equal to 0.',
    'A client deadline stopped the waiting on both stacks. The server still completed the charge on both.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@GrpcMethod and the generated base class', 'int64 and the loader options', 'A throwing handler', 'Deadlines and cancellation'],
    outTitle: 'Not in scope',
    out: ['Streaming RPCs', 'TLS and auth metadata'],
    note: 'At the time of recording the Spring gRPC starters move into Spring Boot from 4.2.',
  },

  scale: {
    title: 'The measurements',
    note: 'One proto, both servers, a grpc-js client.',
    rows: [
      ['INT64 1999 + 1, SPRING', '2000'],
      ['INT64 1999 + 1, NEST DEFAULTS', '"19991" (a Long object)'],
      ['INT64, NEST longs: Number', '2000'],
      ['9007199254740993, longs: Number', 'arrived as ...992'],
      ['A HANDLER THAT THROWS', 'UNKNOWN, masked on both'],
      ['300 ms DEADLINE, 1 s CHARGE', 'charged anyway, both'],
      ['CANCELLATION CHECKED FIRST', 'skipped, both'],
    ],
  },

  sections: [
    {
      id: 'longs',
      title: 'Choose the int64 representation',
      body: ['Number is exact only through 2^53 minus 1. String keeps every value and makes the arithmetic yours. Pick for the range your proto allows.'],
      code: [{caption: 'main.ts', lines: [
        'NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {',
        '  transport: Transport.GRPC,',
        '  options: {',
        "    package: 'payments',",
        "    protoPath: join(import.meta.dirname, 'payments.proto'),",
        '    loader: { longs: Number, defaults: true },',
        '  },',
        '});',
      ]}],
      claims: [{text: 'longs: Number: 1999 plus 1 was 2000; 9007199254740993 arrived as 9007199254740992', source: RUN}],
    },
    {
      id: 'cancel',
      title: 'Stop the work, not just the wait',
      body: ['Check for cancellation before the step with the side effect, and make that step idempotent: cancellation can race with completion.'],
      code: [{caption: 'payments.controller.ts', lines: [
        "@GrpcMethod('Payments', 'Charge')",
        'async charge(request: ChargeRequest, metadata: Metadata, call: ServerUnaryCall<ChargeRequest, ChargeReply>) {',
        '  const quote = await this.prepare(request);',
        '  if (call.cancelled) return;',
        '  return this.ledger.chargeOnce(request.paymentId, quote);',
        '}',
      ]}],
      claims: [{text: 'cancellation checked before the side effect: completed 0, skipped 1 on both stacks', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/microservices 12, grpc-js 1.14, proto-loader 0.8, Spring gRPC 1.0 on Spring Boot 4.1.',

  checklist: {
    title: 'Before you move a gRPC service to Nest',
    items: [
      'What does the loader turn int64 into?',
      'Can any int64 in the proto exceed 2^53?',
      'Are zero values present, or missing, in the handler?',
      'Does the handler stop work when the client gives up?',
      'Is every side effect idempotent?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-grpc.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS gRPC', url: 'https://docs.nestjs.com/microservices/grpc'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. gRPC is a trademark of The Linux Foundation. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
