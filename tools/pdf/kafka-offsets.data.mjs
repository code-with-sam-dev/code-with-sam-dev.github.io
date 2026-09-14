/**
 * The Kafka Offsets and Delivery Semantics Design Sheet, episode 4.
 *
 * Verified 2026-09-12 against Apache Kafka 4.3 documentation, recorded in
 * production/episode-kafka-04-claims.md in the video project.
 *
 * This is the most version sensitive sheet in the series after episode 3: it
 * asserts four Kafka defaults, and a default is the fastest thing in any
 * document to become quietly wrong. Every one is dated in the table that
 * carries it.
 */
import {CHANNEL_LINKS, repoLink, APACHE_TRADEMARK, CLOSING, SRC} from './kafka-common.mjs';

export const sheet = {
  channel: 'Code with Sam',

  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Kafka Offsets and Delivery',
  subtitle: 'The senior engineer answer sheet',
  kicker: 'Senior Software Engineer Interview Questions: Deep Dives',
  strapline: 'The payment succeeded. The commit did not. Both of those are true at once.',

  verifiedOn: '2026-09-12',

  intro: [
    'An offset is not a pointer to what your application did. It is a record of what your consumer group said it had done.',
    'Everything difficult about delivery semantics follows from the gap between those two sentences, and every interview answer that sounds senior is really an answer about where that gap sits in your code.',
    'Every Kafka statement below was checked against Apache Kafka 4.3 documentation, named beside it, on the date at the foot of this sheet.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What an offset actually records, and for whom',
      'At-most-once and at-least-once, both halves of each',
      'Auto commit, and the window it opens',
      'Manual commit, sync against async',
      'Where exactly-once is real and where it is marketing',
      'Storing the offset with the output',
      'Isolation level, and the last stable offset',
    ],
    outTitle: 'Out of scope',
    out: [
      'Broker log segment layout and retention',
      'Kafka Streams, which manages offsets on your behalf',
      'Consumer group rebalancing, which is episode 3',
      'The transactional outbox, which is episode 7',
    ],
    note: 'Delivery semantics questions get answered too broadly. Naming the boundary is most of the answer.',
  },

  scale: {
    title: 'Worked assumptions',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Records per poll', '500, the max.poll.records default'],
      ['Processing time per record', '40 ms'],
      ['Auto commit interval', '5 seconds, the default'],
      ['Records processed in one interval', 'about 125'],
      ['Records at risk when the process dies', 'up to one full interval of work'],
      ['Payment value at risk', 'whatever 125 payments are worth to you'],
    ],
  },

  sections: [
    {
      id: 'what-an-offset-is',
      title: 'What an offset actually records',
      body: [
        'An offset is a position in one partition. A committed offset is a position stored for one consumer GROUP, against one partition.',
        'Not per consumer. Not per process. Per group. That is why a partition handed to a different member resumes from a group level fact rather than from anything the previous owner held in memory.',
        'And it records intent to resume, not completion of work. Nothing in Kafka knows whether your side effect happened.',
      ],
      claims: [
        {
          text: 'Offsets are stored per partition per consumer group, so a reassignment resumes from the last committed position rather than from wherever the previous owner had reached.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'The broker has no knowledge of what an application did with a record, so a committed offset can never be evidence that the work completed.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'the-two-orderings',
      title: 'The two orderings, and both halves of each',
      body: [
        'Commit BEFORE processing and you can lose work: the offset says done, the crash says otherwise, and nothing replays it. That is at-most-once.',
        'Commit AFTER processing and you can repeat work: the effect landed, the crash beat the commit, and the record comes back. That is at-least-once, and it is the default.',
        'THE HALF MOST ANSWERS DROP. At-most-once needs the producer to stop retrying as well. A retrying producer can reintroduce exactly the duplication the early commit was meant to prevent, so commit ordering alone does not buy you at-most-once.',
      ],
      claims: [
        {
          text: 'Kafka guarantees at-least-once delivery by default, and allows users to implement at-most-once delivery by disabling retries on the producer and committing offsets in the consumer prior to processing a batch of messages.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'Choosing a delivery semantic is choosing which failure you are willing to have, because a system that never loses and never repeats requires cooperation beyond the broker.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'auto-commit',
      title: 'Auto commit, and the window it opens',
      body: [
        'At the time of writing, September 2026, on Kafka 4.3, enable.auto.commit defaults to true and auto.commit.interval.ms defaults to 5000.',
        'That is convenient and it is a five second window in which the offset can move past work that is still in flight, or lag behind work that is already finished. Which direction hurts you depends on what your consumer does.',
        'Auto commit is not wrong. It is a default chosen for the common case of a consumer whose only side effect is inside Kafka. A payment consumer is not that case.',
      ],
      claims: [
        {text: 'enable.auto.commit defaults to true on Kafka 4.3.', source: SRC.KAFKA_CONSUMER},
        {text: 'auto.commit.interval.ms defaults to 5000 milliseconds on Kafka 4.3.', source: SRC.KAFKA_CONSUMER},
        {
          text: 'Automatic commits happen on a timer relative to poll calls rather than relative to the completion of application work, so the two can drift apart in either direction.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'manual-commit',
      title: 'Manual commit, and the sync against async trade',
      body: [
        'Committing synchronously blocks until the broker acknowledges, and retries on retriable errors. It is slower and it is certain.',
        'Committing asynchronously does not block, which is faster and means a failed commit is discovered later, if at all. A common shape is async during the loop and a final sync on shutdown, so speed is bought where a mistake is cheap and certainty is paid for where it is not.',
        'Neither of these makes your processing idempotent. They only narrow the window.',
      ],
      claims: [
        {
          text: 'commitSync blocks until the commit is acknowledged or fails, while commitAsync returns immediately and reports the outcome through a callback.',
          source: SRC.KAFKA_CONSUMER,
        },
        {
          text: 'Narrowing the window between the effect and the commit reduces how often a duplicate happens and cannot reduce it to never.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'exactly-once',
      title: 'Where exactly-once is real, and where it is a slogan',
      body: [
        'Inside Kafka, reading from a topic, processing, and writing back to a topic, exactly-once is real. A transactional producer commits the output records and the input offsets together, and a read_committed consumer only sees committed output.',
        'The moment an effect leaves Kafka, that guarantee stops at the boundary. Kafka says so itself.',
        'So the honest answer in an interview is a question back: exactly once ACROSS WHAT? Name the systems that must agree. That is the sentence that separates a senior answer from a memorised one.',
      ],
      claims: [
        {
          text: 'Exactly-once delivery for other destination systems generally requires cooperation with such systems, but Kafka provides the primitives which makes implementing this feasible.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'Transactional producers with read-committed isolation level can be used to provide exactly-once delivery when reading, processing and writing data on Kafka topics.',
          source: SRC.KAFKA_DESIGN,
        },
      ],
    },
    {
      id: 'offset-with-output',
      title: 'Store the offset with the output',
      body: [
        'If the output of processing lands in your own database, put the offset there too, in the same transaction as the result. Then there is no gap to lose work in, because there is no second commit.',
        'Kafka explicitly supports this: offset storage is not required to live in Kafka.',
        'This is the cleanest exactly-once you will get against an external system, and it costs you the built in offset tooling, which is a real trade rather than a free win.',
      ],
      claims: [
        {
          text: 'Consumer applications need not use Kafka built-in offset storage; they can store offsets in a store of their own choosing. This allows storing both the offset and results of consumption in the same system atomically, which gives exactly once semantics.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'Managing offsets yourself means group tooling and lag monitoring no longer see your true position, so the observability has to be rebuilt around your own store.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'isolation',
      title: 'Isolation level, and the offset that blocks',
      body: [
        'At the time of writing, September 2026, on Kafka 4.3, isolation.level defaults to read_uncommitted. A consumer left on the default will read records from transactions that were later aborted.',
        'Set to read_committed, a consumer reads only up to the last stable offset, which is one less than the offset of the first open transaction.',
        'That has a consequence worth knowing: a long running open transaction BLOCKS a read_committed consumer from advancing past it. The consumer is not broken and the lag is real. Somebody left a transaction open.',
      ],
      claims: [
        {text: 'isolation.level defaults to read_uncommitted on Kafka 4.3.', source: SRC.KAFKA_CONSUMER},
        {
          text: 'read_committed will only return messages up to the last stable offset, which is the one less than the offset of the first open transaction.',
          source: SRC.KAFKA_CONSUMER,
        },
        {text: 'enable.idempotence defaults to true on the producer on Kafka 4.3.', source: SRC.KAFKA_PRODUCER},
      ],
    },
    {
      id: 'answer',
      title: 'The interview answer',
      body: [
        'An offset is committed progress for a consumer group on a partition. It records where to resume, not what was done.',
        'Commit before processing and you risk losing work. Commit after and you risk repeating it. At-least-once is the default and the honest starting point.',
        'Exactly-once is real inside Kafka, using a transactional producer and read_committed. Outside Kafka it needs the other system to cooperate, and the cheapest cooperation is storing the offset alongside the output.',
        'Then say what you would DO: make the effect idempotent, commit after, and know which isolation level you are on.',
      ],
      claims: [
        {
          text: 'Answering with the trade rather than with a definition, and then naming the mitigation, is what distinguishes a senior answer from a correct one.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'Questions to ask before you answer',
    items: [
      'Where does the side effect live, inside Kafka or outside it?',
      'Is auto commit on, and what is the interval?',
      'Is the commit before or after the effect?',
      'Is the effect idempotent, and keyed on what?',
      'What isolation level are the consumers on?',
      'Could the offset be stored with the output instead?',
      'Which systems must agree for exactly-once to mean anything here?',
      'What happens to in flight work when this process is killed?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('episode-04-offsets')],
  trademarks: APACHE_TRADEMARK,
  closing: CLOSING,
};
