/**
 * The Kafka Ordering Design Sheet, episode 1.
 *
 * The oldest promise on the channel. Episode 1 shipped on 2026-09-10 and the
 * sheet it implied never existed, which is exactly the gap the 2026-09-16
 * stock take was run to find.
 *
 * THE PAGE THAT EARNS THE SHEET is the section on the consumer, because it is
 * the half of the answer almost nobody gives. Kafka can deliver in perfect
 * order and the application can still apply the writes out of order, and that
 * failure survives code review, passes tests under light load, and appears in
 * production at volume.
 */
import {CHANNEL_LINKS, repoLink, APACHE_TRADEMARK, CLOSING, SRC} from './kafka-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/watch?v=Oa9vjdg232g', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Kafka Ordering',
  subtitle: 'One partition is one ordered stream. One topic is not',
  kicker: 'For software engineers: the answer that survives the follow-up',
  strapline:
    'Kafka delivered A, B, C in order. Your consumer applied C, A, B. Both sentences are true at the same time.',
  verifiedOn: '2026-09-16',

  intro: [
    '"We are using Kafka, so ordering is guaranteed." That sentence turns up in interviews, in design reviews, and in incident write-ups. It is half true, and the missing half is where systems break.',
    'Kafka does guarantee ordering, within a partition. Everything else on this page follows from that one qualifier, including the failure that is not Kafka’s fault at all.',
    'Every Kafka statement below was checked against the Apache Kafka documentation named beside it, on the date at the foot of this sheet.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why the topic is the wrong unit to reason about',
      'How the key decides the partition, and why you do not want global ordering',
      'The failure that happens after Kafka has already done its job correctly',
      'Why a dead letter topic is an ordering decision, not only an error one',
      'What adding partitions does to key routing, which catches teams late',
    ],
    outTitle: 'Out of scope',
    out: [
      'Exactly once semantics, which is episode 4 and a different question',
      'The outbox pattern, which is episode 8',
      'Broker tuning. Nothing here needs a configuration change to reproduce',
      'Any claim that one partition count is correct for your system',
    ],
    note:
      'Read the consumer section first if you only read one. It is the half of the answer that separates someone who has operated Kafka from someone who has read about it.',
  },

  scale: {
    title: 'What is guaranteed, and where it stops',
    note:
      'The left column is the unit. Ordering is a property of exactly one of these, and most wrong answers come from attaching it to the wrong row.',
    rows: [
      ['Partition', 'Strictly ordered. Appended one after another, read in that order'],
      ['Topic', 'A collection of partitions. No order across them, and never will be'],
      ['Key', 'Hashed to choose a partition, so one key means one ordered log'],
      ['Consumer', 'Can destroy the order it was handed, and usually does it for speed'],
      ['Retry', 'Skipping a failed record reorders the entity it belonged to'],
      ['Partition count', 'Changes the modulus, so it changes where a key lands'],
    ],
  },

  sections: [
    {
      id: 'unit',
      title: 'The topic is the wrong unit',
      body: [
        'A topic is not an ordered stream. It is a collection of partitions, and each partition is its own ordered log.',
        'Inside one partition the rule is strict. If A was appended before B, no consumer will ever see B before A.',
        'Across partitions Kafka promises nothing, and that is the design rather than an apology. Refusing to order across partitions is exactly what lets it scale horizontally.',
      ],
      claims: [
        {
          text: 'A topic is a category to which records are published, and for each topic Kafka maintains a partitioned log; each partition is an ordered, immutable sequence of records appended to.',
          source: SRC.KAFKA_TOPICS,
        },
        {
          text: 'Ordering is a property of a partition, not of a topic, so it cannot be claimed for a topic with more than one partition.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'key',
      title: 'The key decides the partition, and you do not want global ordering',
      body: [
        'If ordering only exists inside a partition, the question becomes how to get the events that must stay ordered into the same one. That is the message key.',
        'Produce with a key and Kafka hashes it to choose a partition, so the same key deterministically reaches the same ordered log. For a payment system the natural key is the payment id, and the initiated, authorized and completed events for one payment then travel together, in order.',
        'Say the trade-off out loud in an interview, because it is the part that shows judgement: you do NOT want global ordering. Global ordering means one partition, which means one consumer, which means no scalability. You want ordering for the entity that needs it and parallelism everywhere else.',
      ],
      claims: [
        {
          text: 'The default partitioner selects the partition from a hash of the key when a key is present, so records with the same key are written to the same partition.',
          source: SRC.KAFKA_PRODUCER,
        },
        {
          text: 'Choosing per-entity ordering rather than global ordering is a deliberate trade of throughput against scope of guarantee.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'consumer',
      title: 'The part most people miss, and it is not Kafka',
      body: [
        'Kafka can deliver your messages in perfect order and your application can still process them out of order.',
        'A consumer polls a partition and receives A, B, C, correctly ordered. To go faster it hands each record to a thread pool. Three threads run at once. C is small and finishes first, then A, then B. The database now holds state applied as C, A, B.',
        'Kafka did its job exactly. The application undid it. This is the failure that survives code review, passes tests under light load, and shows up in production at volume.',
        'If ordering matters for an entity, the work for that entity has to be sequential, typically one consumer thread per partition rather than a fan out inside the consumer.',
      ],
      claims: [
        {
          text: 'Delivery order and processing order are separate properties; a broker guarantee about the first says nothing about the second.',
          source: SRC.FIRST,
        },
        {
          text: 'Concurrency introduced inside a consumer is the point at which an application forfeits the ordering it was given.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'retries',
      title: 'Retries and dead letter topics are an ordering decision',
      body: [
        'Add failure and it gets worse. B fails, C succeeds. If the retry strategy moves on and comes back to B later, C has been applied before B and the business state is wrong, even though every individual message was eventually processed successfully.',
        'So "just add a dead letter topic" is an incomplete answer. Sending B to a dead letter topic and continuing with C is a decision to abandon ordering for that entity. Sometimes that is acceptable. For a payment it usually is not.',
        'When ordering genuinely matters, the safest behaviour is to stop consuming that partition until the failed record is resolved. That costs throughput on one partition and protects correctness, and being able to state that trade-off is what a senior answer sounds like.',
      ],
      claims: [
        {
          text: 'Routing a failed record aside and continuing with the next one reorders the entity those records belong to.',
          source: SRC.FIRST,
        },
        {
          text: 'Halting a partition on failure trades throughput on that partition for correctness of the entity it carries.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'partition-count',
      title: 'The caveat that catches teams late',
      body: [
        'Key to partition mapping depends on the NUMBER of partitions. The default partitioner hashes the key and takes it modulo the partition count. Add partitions and the modulus changes, so the same key can start landing somewhere else.',
        'Records already written stay where they are. New records for that key may go elsewhere. For a window of time one entity’s events are split across two partitions, and ordering for that entity is broken.',
        'This is not an argument against ever adding partitions. It is an argument that partition count is an architectural decision rather than a scaling knob to turn casually. If strict per-entity ordering is critical, think about partition growth before production scale rather than after.',
      ],
      claims: [
        {
          text: 'Partition selection for a keyed record is a function of the key and the current number of partitions, so changing the count changes the destination for existing keys.',
          source: SRC.KAFKA_PRODUCER,
        },
        {
          text: 'Records already written are never moved when partitions are added, so the split is temporary but the reordering during it is real.',
          source: SRC.KAFKA_TOPICS,
        },
      ],
    },
    {
      id: 'interview',
      title: 'The answer that survives the follow-up',
      body: [
        'Do not answer "Kafka guarantees ordering". Answer "one partition is one ordered stream, one topic is not", and then say what you do about it.',
        'Name the key as the mechanism, name per-entity ordering as the goal, and name the consumer as the place the guarantee is most often thrown away. Three sentences and you have covered the whole of it.',
        'Then add the cost. Sequential processing per partition limits throughput for that partition. Halting on failure limits it further. An answer with a cost in it is the one that sounds like experience rather than like reading.',
      ],
      claims: [
        {
          text: 'Naming where a guarantee stops, and what it costs to keep it, distinguishes an operator from a reader.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you claim ordering in a design review',
    items: [
      'Which entity actually needs ordering, and which does not?',
      'What is the key, and does every event for that entity carry it?',
      'Is anything inside the consumer concurrent?',
      'How many threads touch one partition?',
      'What happens to the next record when one fails?',
      'Is the dead letter route an accepted loss of ordering, and who accepted it?',
      'How many partitions, and who decides when that changes?',
      'What happens to in-flight keys the day the count changes?',
      'Can I demonstrate the broken case on my own machine?',
      'Can I state what per-entity ordering costs in throughput?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('episode-01-ordering')].filter(Boolean),
  trademarks: APACHE_TRADEMARK,
  closing: CLOSING,
};
