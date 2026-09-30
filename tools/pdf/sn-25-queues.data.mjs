/**
 * Spring to Node design sheet, episode 26 in the course list: background jobs and queues.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-queues.sh` in the course
 * repository, with real processes and SIGKILL. @nestjs/bullmq 12.0.0, bullmq 6.3.10, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-queues.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Crashed. Nothing sent.',
  subtitle: 'Spring Boot to NestJS, episode 26: background jobs and queues',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Fast response is not the guarantee. Durable handoff is.',
  verifiedOn: '2026-10-01',

  intro: [
    'Five receipts handed to @Async or to a promise nobody awaited were gone after a crash: zero sent, on both stacks.',
    'In a BullMQ queue, four waiting jobs survived at once and the one that was running came back after stall detection.',
    'A job that recorded a charge and then died ran again: at least once. And a payment committed before a crash never reached the queue.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Async and unawaited promises', 'BullMQ with @nestjs/bullmq', 'Crashes, stalls, retries, concurrency', 'The database-to-queue gap'],
    outTitle: 'Not in scope',
    out: ['Spring Batch in depth', 'Kafka (next episode)'],
    note: 'Spring Batch with a job repository is a durable model; @Async is not.',
  },

  scale: {
    title: 'The measurements',
    note: 'Real processes, SIGKILL.',
    rows: [
      ['FIVE 2 s RECEIPTS, CRASH 1 s IN', '@Async 0; bare promise 0; BullMQ 4, then the fifth after 62 s'],
      ['CHARGE RECORDED, THEN THE PROCESS DIED', 'charged 2 times'],
      ['A JOB THAT FAILS ONCE', 'default: 1 attempt, failed; attempts 3: sent'],
      ['TEN 500 ms JOBS', 'concurrency 1: 5.1 s; 5: 1.1 s (Spring 5.3 s, 1.3 s)'],
      ['COMMIT, THEN CRASH BEFORE queue.add', 'payment 1, receipt job 0'],
    ],
  },

  sections: [
    {
      id: 'queue',
      title: 'Put the work in a queue',
      body: ['BullMQ stores jobs in Redis and a worker takes them. Set attempts and backoff; the default is one attempt, one job at a time.'],
      code: [
        {caption: 'receipts.controller.ts', lines: ["await this.receipts.add('receipt', { id, ms }, { attempts: 3, backoff: { type: 'exponential', delay: 200 } });"]},
        {caption: 'receipts.processor.ts', lines: [
          "@Processor('receipts', { concurrency: 5 })",
          'export class ReceiptsProcessor extends WorkerHost {',
          '  async process(job: Job<{ id: string }>) {',
          '    // send the receipt: safe to run twice',
          '  }',
          '}',
        ]},
      ],
      claims: [{text: 'crash 1 s in: four waiting jobs sent within 12 s; the running one after stall detection', source: RUN}],
    },
    {
      id: 'gap',
      title: 'The gap before the queue',
      body: ['A durable queue protects work after it enters the queue. Writing the payment and adding the job are two systems; write an outbox row in the same transaction and relay it.'],
      code: [{caption: 'the outbox, as a concept', lines: ['BEGIN;', "INSERT INTO payments (id) VALUES ('pay_1');", "INSERT INTO outbox (topic, payload) VALUES ('receipt', '{\"id\":\"pay_1\"}');", 'COMMIT;', '-- a relay reads the outbox and adds the job']}],
      claims: [{text: 'commit then crash before queue.add: one payment, no receipt job', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/bullmq 12, bullmq 6.3, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust background work',
    items: [
      'Does it survive a crash, or live only in memory?',
      'Can the job run twice safely?',
      'How many attempts, with what backoff?',
      'How many jobs at once?',
      'What happens to a job that was running when the process died?',
      'How does the job get from your database into the queue?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-queues.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS queues', url: 'https://docs.nestjs.com/techniques/queues'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Redis is a trademark of Redis Ltd. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
