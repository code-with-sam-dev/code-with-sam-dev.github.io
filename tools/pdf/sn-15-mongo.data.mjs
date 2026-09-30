/**
 * Spring to Node design sheet, episode 16 in the course list: MongoDB with Mongoose.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-mongo.sh` in the course
 * repository. MongoDB 8.3.11, Mongoose 9.10.3, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-mongo.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Debit vanished.',
  subtitle: 'Spring Boot to NestJS, episode 16: MongoDB with Mongoose',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Changing frameworks did not remove the race. Validation belongs to the write path, not the field.',
  verifiedOn: '2026-09-30',

  intro: [
    'Two requests loaded the same account and each saved its own debit. The balance ended at 50 instead of 20, on Spring Data MongoDB and on Mongoose alike, with no error.',
    'Detect stale state with @Version or optimisticConcurrency, or avoid the read-modify-write with an atomic $inc.',
    'Validation depends on the write path on both stacks, and $inc walks past Mongoose update validators. Put the rule in the filter.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['@Document and MongoRepository against Schema and Model', 'Lost updates and optimistic concurrency', 'Validation by write path', 'Casting and strict mode'],
    outTitle: 'Not in scope',
    out: ['Multi-document transactions', 'populate against DBRef'],
    note: 'One machine, one account, the same MongoDB for both stacks.',
  },

  scale: {
    title: 'The measurements',
    note: 'Balance 100, debits of 30 and 50, and a rule of minimum 0.',
    rows: [
      ['TWO LOADS, TWO SAVES', 'balance 50 on both stacks, expected 20'],
      ['@Version / optimisticConcurrency', 'second save rejected, balance 70'],
      ['ATOMIC $inc', 'balance 20 on both stacks'],
      ['SPRING save(), @Min(0)', 'saved -500; rejected with ValidatingEntityCallback'],
      ['MONGOOSE save(), min: 0', 'ValidationError'],
      ['MONGOOSE updateOne()', 'stored -500; rejected with runValidators'],
      ['DIRECT UPDATE, BOTH STACKS', 'stored'],
      ['$inc -500 WITH runValidators', 'stored, balance -400'],
      ['$inc WITH balance >= 500 IN THE FILTER', 'matched 0, balance 100'],
    ],
  },

  sections: [
    {
      id: 'concurrency',
      title: 'Detect it, or avoid it',
      body: ['Optimistic concurrency keeps the read-modify-write and rejects stale state. An atomic update removes the read entirely.'],
      code: [
        {caption: 'probes.ts', lines: [
          "new Schema(accountShape, { optimisticConcurrency: true })",
          '',
          'Account.updateOne({ _id }, { $inc: { balance: -30 } })',
        ]},
        {caption: 'Ep15GuardedAccount.java', lines: ['@Version', 'private Long version;']},
      ],
      claims: [{text: 'two concurrent debits of 30 and 50 from 100: 50 unguarded, 70 plus an error with a version check, 20 with $inc', source: RUN}],
    },
    {
      id: 'filter',
      title: 'Put the rule in the filter',
      body: ['Mongoose update validators only run on $set, $unset, $push, $addToSet, $pull and $pullAll. For $inc, make the rule part of the match.'],
      code: [{caption: 'probes.ts', lines: [
        'await Account.updateOne(',
        '  { _id, balance: { $gte: 500 } },',
        '  { $inc: { balance: -500 } },',
        ');',
      ]}],
      claims: [{text: '$inc -500 on 100 with runValidators: -400; with the rule in the filter: matched 0, balance 100', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Mongoose 9.10, MongoDB 8.3, Spring Boot 4.1.',

  checklist: {
    title: 'Before you ship Mongoose where you had Spring Data MongoDB',
    items: [
      'Turn on optimisticConcurrency where you read, change and save',
      'Prefer one atomic update when the change allows it',
      'Pass runValidators on updates, and know it skips $inc',
      'Put numeric rules for $inc in the filter',
      'Remember strict mode drops undeclared fields silently',
      'In Spring, register ValidatingEntityCallback if you rely on @Min',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-mongo.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'Mongoose validation', url: 'https://mongoosejs.com/docs/validation.html'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. MongoDB is a trademark of MongoDB, Inc. This is an independent, ' +
    'unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
