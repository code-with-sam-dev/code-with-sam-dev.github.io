/**
 * Spring to Node design sheet, episode 25 in the course list: scheduled jobs and cron.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-schedule.sh` and
 * `scripts/failover.mjs` in the course repository. @nestjs/schedule 12.0.2, @nestjs/locks 0.0.1,
 * ShedLock 7.10.1, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-schedule.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Two pods. Every job twice.',
  subtitle: 'Spring Boot to NestJS, episode 25: scheduled jobs and cron',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A schedule says when a job may start. Not how many processes start it, whether runs overlap, or what happens when the one running it dies.',
  verifiedOn: '2026-09-30',

  intro: [
    'Two instances ran every tick twice, on Spring Boot and on NestJS: every process schedules every job.',
    'ShedLock on Redis and Nest\'s @OnOneInstance with a Redis store stopped it. Nest\'s default in-memory lock store did not.',
    'Killed mid-run, the job moved in about four seconds under a renewed 3 s lease and nearly ten under a fixed 10 s ShedLock maximum.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Scheduled, @Cron, @Interval', 'ShedLock and @nestjs/locks', 'Overlap, capacity, failures', 'A real crash of the lock holder'],
    outTitle: 'Not in scope',
    out: ['Queues and background workers (next episode)', 'Kubernetes CronJobs'],
    note: 'At the time of recording @nestjs/locks is version 0.0.1.',
  },

  scale: {
    title: 'The measurements',
    note: 'Two instances unless stated.',
    rows: [
      ['A JOB EVERY SECOND, 3 s', '6 runs, every tick twice, both stacks'],
      ['@OnOneInstance, DEFAULT MEMORY STORE', 'still every tick twice'],
      ['ShedLock / @OnOneInstance ON REDIS', '3 runs, no tick twice'],
      ['2.5 s JOB EVERY SECOND, ONE INSTANCE', 'Nest @Cron 3 at once; waitForCompletion 1; Spring 1'],
      ['HEARTBEAT BESIDE AN 800 ms JOB', 'Spring pool 1: 920 ms gap; Node thread-holding: 1035 ms'],
      ['KILLED 1 s INTO A 4 s JOB', 'lease 3 s: 4.0, 3.9 s; ShedLock 10 s: 9.7, 9.6 s'],
    ],
  },

  sections: [
    {
      id: 'lock',
      title: 'Lock the job in a shared store',
      body: ['Without a lock, every instance runs every tick. With one, at most one instance runs it while the lease holds. Not exactly once: a tick can still be missed.'],
      code: [
        {caption: 'Jobs.java', lines: ['@Scheduled(cron = "* * * * * *")', '@SchedulerLock(name = "payments:settle", lockAtLeastFor = "500ms")', 'public void settleOnce() { ... }']},
        {caption: 'jobs.ts', lines: ["@Cron('* * * * * *')", "@OnOneInstance({ key: 'payments:settle' })", 'settleOnce() { ... }']},
      ],
      claims: [{text: 'two instances, Redis store: 3 runs in 3 s, no tick twice, on both', source: RUN}],
    },
    {
      id: 'overlap',
      title: 'Overlap',
      body: ['A plain Nest @Cron starts a new run every tick even while the last one runs. waitForCompletion stops that in one process; @WithoutOverlapping stops it through the lock.'],
      code: [{caption: 'jobs.ts', lines: ["@Cron('* * * * * *', { waitForCompletion: true })", 'async report() { ... }', '', "@Cron('* * * * * *')", "@WithoutOverlapping({ key: 'payments:report' })", 'async reportAlone() { ... }']}],
      claims: [{text: 'a 2.5 s job every second: plain @Cron 3 at once; either fix 1', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: @nestjs/schedule 12, @nestjs/locks 0.0.1, ShedLock 7.10, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a scheduled job',
    items: [
      'How many instances will run it?',
      'Is the lock store shared by all of them?',
      'Can a run overlap the last one?',
      'What else shares its thread or event loop?',
      'How long until another instance takes over after a crash?',
      'Missed ticks are not caught up: process what is due',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement: scripts/verify-schedule.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS distributed locks', url: 'https://docs.nestjs.com/reliability/locks'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Redis is a trademark of Redis Ltd. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
