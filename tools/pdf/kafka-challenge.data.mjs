/**
 * The Kafka Architecture Challenge Design Sheet, episode 10.
 *
 * Verified 2026-09-13, recorded in production/episode-kafka-10-claims.md.
 *
 * Nine challenges, each with a first-order answer that is easy and a
 * second-order effect that is the actual assessment. The claim checked hardest
 * was challenge two: partition count can be increased and never decreased, and
 * increasing it re-maps existing keys under the default partitioner. Both are
 * correct, and together they are why it is the best question here.
 *
 * THE SECTION TO PROTECT IN ANY EDIT is the last one. A series that ends by
 * telling you to use everything it taught is selling rather than teaching.
 */
import {CHANNEL_LINKS, repoLink, APACHE_TRADEMARK, CLOSING, SRC} from './kafka-common.mjs';

export const sheet = {
  channel: 'Code with Sam',

  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Architecture Challenge',
  subtitle: 'The senior engineer answer sheet',
  kicker: 'Senior Software Engineer Interview Questions: Deep Dives',
  strapline: 'Nine changes to one design. The first-order answer is easy. That is not what is being marked.',

  verifiedOn: '2026-09-13',

  intro: [
    'Each challenge below changes one thing about a working payment pipeline. Answer it before reading on.',
    'The first-order answer is easy and almost everyone gets it. The interview is decided by the second-order effect, and by the two questions at the end that no blog post can prepare you for.',
    'Kafka behaviour is sourced to Apache Kafka 4.3 documentation. Reasoning that is reasoning says so.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Consumers against partitions, and the parallelism ceiling',
      'Changing the partition count, and its three consequences',
      'Crash after the effect',
      'Retry topics against business ordering',
      'The ambiguous external call',
      'The relay that stops',
      'A second consumer group',
      'The two bonus traps',
    ],
    outTitle: 'Out of scope',
    out: [
      'Rebuilding the pipeline itself, which is episode 9',
      'Cluster operations, broker tuning and capacity',
      'Kafka Streams, which changes several of these answers',
      'Provider specific payment API behaviour',
    ],
    note: 'Every challenge here has a correct short answer and a better long one. The long one names what it cost.',
  },

  scale: {
    title: 'Worked assumptions',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Starting partitions', '3'],
      ['Consumers deployed', '6'],
      ['Consumers doing work', '3'],
      ['Consumers idle', '3'],
      ['Partitions after the change', '6'],
      ['Partitions that can ever be removed', '0'],
    ],
  },

  sections: [
    {
      id: 'ceiling',
      title: 'One: three partitions, six consumers',
      body: [
        'Three consumers get one partition each. Three sit idle. A rebalance happened and achieved nothing.',
        'Partition count is the parallelism CEILING for one consumer group. Consumers beyond it are standby capacity, not speed.',
        'That is not waste, incidentally. Standby capacity fails over faster than a new pod starts. It is just not throughput.',
      ],
      claims: [
        {
          text: 'Each partition is consumed by exactly one member of a consumer group, so the number of partitions bounds the number of usefully active consumers in that group.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'Adding consumers beyond the partition count triggers a rebalance without increasing throughput.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'repartition',
      title: 'Two: three partitions become six, and this is the best question here',
      body: [
        'FIRST ORDER: the ceiling doubled.',
        'SECOND ORDER, and this is the answer being marked: the same key may now hash to a different partition, so records for one account can end up split across two partitions with no ordering promise between them. Old records stay where they were. New ones may not.',
        'THIRD: you can never reduce the count again. Whatever you pick, you are keeping.',
        'Anyone can say more parallelism. The interview turns on what it cost.',
      ],
      claims: [
        {
          text: 'The number of partitions for a topic can be increased but never decreased.',
          source: SRC.KAFKA_TOPICS,
        },
        {
          text: 'Under the default partitioner a keyed record is assigned by hashing the key over the current partition count, so changing the count changes where existing keys land.',
          source: SRC.KAFKA_PRODUCER,
        },
        {
          text: 'Ordering is guaranteed within a partition, so a key whose records span two partitions has no ordering guarantee between them.',
          source: SRC.KAFKA_TOPICS,
        },
      ],
    },
    {
      id: 'crash',
      title: 'Three: the effect succeeds, then the consumer dies',
      body: [
        'It replays. That part is not in doubt and it is not a defect.',
        'Whether the customer is charged twice is decided entirely by YOUR idempotency, not by anything in Kafka.',
        'An answer that reaches for a Kafka setting here has misplaced the boundary, which is the thing the question is testing.',
      ],
      claims: [
        {
          text: 'Kafka guarantees at-least-once delivery by default, so a record processed before an uncommitted crash is delivered again.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'Whether a redelivery produces a second effect is a property of the application, not of the broker.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'retry-ordering',
      title: 'Four: move failures to a retry topic',
      body: [
        'Event A fails and is delayed thirty seconds. Event B for the same account succeeds immediately. A returns and succeeds SECOND.',
        'Partition ordering intact. Business ordering inverted.',
        'That is a real trade rather than a bug, and the answer they want is you making it knowingly and naming the accounts or operations it is unacceptable for.',
      ],
      claims: [
        {
          text: 'Retry topics preserve partition ordering while reordering the work, because the delayed record rejoins after later records have been processed.',
          source: SRC.FIRST,
        },
        {
          text: 'Retrying in place instead preserves work ordering and blocks the partition behind the failing record.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'ambiguous',
      title: 'Five: the external provider response is lost',
      body: [
        'The request left. The provider may have charged the customer. You know nothing.',
        'Retry only if they will deduplicate, which means passing YOUR key to them and requiring it to be honoured.',
        'This is the ambiguous failure, the hardest class in distributed systems, and it is only safe because the key exists. Without it the honest answer is that you cannot retry and cannot proceed, and a human has to reconcile.',
      ],
      claims: [
        {
          text: 'A lost response leaves the caller unable to distinguish a request that was not processed from one that was processed with an undelivered acknowledgement.',
          source: SRC.FIRST,
        },
        {
          text: 'Passing a caller-generated idempotency key to a remote participant is what converts an ambiguous failure into a safely retryable one.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'relay',
      title: 'Six: the outbox relay stops',
      body: [
        'Payments keep committing. Kafka is healthy. Consumers are healthy and idle.',
        'Nothing is lost, and everything stops arriving.',
        'Only the age of the oldest unpublished row can see it. If you have not built that panel, this outage is discovered by a customer.',
      ],
      claims: [
        {
          text: 'A stopped relay between a database and Kafka produces no error in either system, because neither is failing.',
          source: SRC.FIRST,
        },
        {
          text: 'The age of the oldest unpublished outbox row is the only local signal that detects a stopped relay.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'second-group',
      title: 'Seven: add a second consumer group',
      body: [
        'No, analytics does not steal messages from notifications. Consumer groups are independent, each with its own committed offsets over the same records.',
        'This one is genuinely simple, and it is here on purpose.',
        'Not every question has a trap, and a candidate who invents one to look thorough has just demonstrated the opposite.',
      ],
      claims: [
        {
          text: 'Each consumer group maintains its own committed offsets, so multiple groups consume the same records independently.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'A record is retained according to the topic retention policy rather than being removed on consumption, which is what makes independent groups possible.',
          source: SRC.KAFKA_TOPICS,
        },
      ],
    },
    {
      id: 'bonus',
      title: 'The two bonus traps',
      body: [
        '"WE ENABLED TRANSACTIONS, SO IT IS EXACTLY ONCE." Your first question is not how. It is: exactly once ACROSS WHAT? Kafka transactions cover records and input offsets inside Kafka. They do not reach a database or an HTTP call.',
        '"CAN WE REPLAY FROM THE DEAD LETTER TOPIC?" Only if the identity outlived the record. Is the claim still present, or has it been cleaned up? Does the replay preserve the original key? Is anything downstream order sensitive about it arriving now?',
        'That second one is the subtlest question in the series, and it is the one most likely to be waved through in a real review.',
      ],
      claims: [
        {
          text: 'A Kafka transaction can atomically produce records to multiple topic partitions and commit the consumed input offsets in the same transaction.',
          source: SRC.KAFKA_TX,
        },
        {
          text: 'Exactly-once delivery for other destination systems generally requires cooperation with such systems, but Kafka provides the primitives which makes implementing this feasible.',
          source: SRC.KAFKA_DESIGN,
        },
        {
          text: 'A replay is safe only where the idempotency identity for that operation still exists; if claims have been cleaned up, the replay is a new first attempt.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'final-trap',
      title: 'The final trap, and it is the one worth keeping',
      body: [
        'Do not copy every mechanism in this series into every Kafka application.',
        'A low risk analytics pipeline does not need a payments architecture. Idempotency claims, an outbox, retry topics and invariant checks all cost something to build and more to operate, and on the wrong workload that cost buys nothing.',
        'Knowing which of these to LEAVE OUT is the same skill as knowing how to build them, and it is the question with the highest signal in this entire sheet: what would you not build here, and why?',
      ],
      claims: [
        {
          text: 'Every reliability mechanism carries a build and operational cost, so applying one where its failure mode is not material is a net loss.',
          source: SRC.FIRST,
        },
        {
          text: 'Articulating what a design deliberately omits, and why, distinguishes an engineer who has operated systems from one who has read about them.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'The seven questions to ask of any design',
    items: [
      'What is the ordering boundary, and what chose it?',
      'What identifies one logical operation?',
      'When does progress become durable, relative to the effect?',
      'Which failures retry, and which never do?',
      'Where does atomicity stop?',
      'What is invisible while everything is green?',
      'What would you deliberately not build here?',
      'And for each answer above: what did it cost?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('episode-10-challenge')].filter(Boolean),
  trademarks: APACHE_TRADEMARK,
  closing: CLOSING,
};
