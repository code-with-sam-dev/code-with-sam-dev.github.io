/**
 * The Kafka Observability Design Sheet, episode 8.
 *
 * Verified 2026-09-13, recorded in production/episode-kafka-08-claims.md.
 *
 * THE RISK PROFILE IS DIFFERENT HERE, and it shaped what is on the page.
 * Dashboard IDs, exporter versions and copy-paste JMX metric paths go stale
 * faster than anything else in this series. So this sheet names NO dashboard
 * ID, NO exporter version and NO metric path. Everything asserted is about what
 * a signal MEANS, which does not rot.
 *
 * No community Grafana dashboard is recommended, deliberately. Those get
 * deleted, renumbered and abandoned, and a document naming one is wrong within
 * a year. The five panels are described instead.
 */
import {CHANNEL_LINKS, repoLink, APACHE_TRADEMARK, CLOSING, SRC} from './kafka-common.mjs';

export const sheet = {
  channel: 'Code with Sam',

  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Kafka Observability',
  subtitle: 'The senior engineer answer sheet',
  kicker: 'Senior Software Engineer Interview Questions: Deep Dives',
  strapline: 'Every service green. Every broker healthy. Payments twenty minutes late.',

  verifiedOn: '2026-09-13',

  intro: [
    'There are three layers worth watching, and most teams build the one that is easiest to build and then wonder why it never catches anything.',
    'Infrastructure says whether Kafka is alive. The pipeline says whether work is flowing. The business layer says whether payments are completing, and completing CORRECTLY. A green first layer says nothing about the third.',
    'Kafka behaviour below is sourced to Apache Kafka 4.3 documentation. Statistical statements are named as statistics. Operational judgements are named as judgements.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The three layers, and which one catches what',
      'Lag, and the two different stories one number tells',
      'Count against age',
      'The correctness failure no infrastructure metric sees',
      'Retry and dead letter signals',
      'Rebalances on the same timeline as lag',
      'Percentiles, and the aggregation error almost everyone makes',
      'Cardinality, and the label that kills a metrics backend',
    ],
    outTitle: 'Out of scope',
    out: [
      'Specific dashboard IDs, which get deleted and renumbered',
      'Exporter versions and copy-paste metric paths',
      'Log aggregation and tracing backends by name',
      'Broker side capacity metrics and cluster sizing',
    ],
    note: 'A metric path in a PDF is wrong within a year. What a signal means is still true in five.',
  },

  scale: {
    title: 'Worked assumptions',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Payments per second', '100'],
      ['Backlog A', '10,000 records, clearing in 2 seconds'],
      ['Backlog B', '10 records, sitting for 2 hours'],
      ['Which one is the incident', 'B, and only age shows it'],
      ['Payments finishing in 100 ms', '99 out of 100'],
      ['The hundredth', '10 seconds'],
      ['What the average says', '199 ms, which sounds fine'],
      ['What the p99 says', '100 ms, because it cannot reach a 1 percent tail'],
      ['What sees it', 'p99.9, or the maximum'],
    ],
  },

  sections: [
    {
      id: 'three-layers',
      title: 'Three layers, and teams usually build one',
      body: [
        'INFRASTRUCTURE: brokers, disks, connections. Is Kafka alive.',
        'PIPELINE: lag, rebalances, retries. Is work flowing.',
        'BUSINESS: are payments completing, and are the results correct.',
        'The outage where everything is green and payments are twenty minutes late lives entirely in the layers nobody built.',
      ],
      claims: [
        {
          text: 'Broker and process level health signals report on the availability of the infrastructure, not on the progress or correctness of application work.',
          source: SRC.FIRST,
        },
        {
          text: 'Kafka exposes broker and client metrics for monitoring, and the application layer is outside what those metrics can observe.',
          source: SRC.KAFKA_MONITORING,
        },
      ],
    },
    {
      id: 'lag',
      title: 'Lag is one number telling two different stories',
      body: [
        'Consumer lag measures how far a consumer group progress is behind the latest available record on a partition. That is genuinely useful and it is not sufficient.',
        'Lag climbing because consumers are slow and lag climbing because producers surged look identical on the graph. One needs investigation and one may be completely fine.',
        'Worse, lag says nothing about whether the outcome was correct. A consumer that processes everything immediately and wrongly has zero lag.',
      ],
      claims: [
        {
          text: 'Consumer lag measures the distance between a consumer group committed position and the latest available record on a partition.',
          source: SRC.KAFKA_MONITORING,
        },
        {
          text: 'Identical lag can indicate slow consumers or a producer surge, and the metric alone cannot distinguish them.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'count-and-age',
      title: 'Count and age answer different questions',
      body: [
        'A backlog of ten thousand records that clears in two seconds is harmless. A backlog of ten records that has sat there for two hours is an incident.',
        'COUNT tells you how many. AGE tells you how long.',
        'For payments, age is the one a customer actually feels, and it is the one most dashboards omit. Alerting on count alone means the small permanent backlog never fires.',
      ],
      claims: [
        {
          text: 'Lag count and lag age answer different questions, and a threshold on count cannot detect a small backlog that never clears.',
          source: SRC.FIRST,
        },
        {
          text: 'The signal a customer experiences is elapsed time to completion, not the number of records outstanding.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'correctness',
      title: 'The signal nobody builds',
      body: [
        'Lag is zero. Every event processed immediately. Every broker metric normal.',
        'And once a day, one transfer creates an unbalanced financial journal.',
        'That is not a health problem. It is a CORRECTNESS problem, and no infrastructure metric will ever see it. The check that catches it is one your team writes: do the debits equal the credits, and is that still true an hour later.',
      ],
      claims: [
        {
          text: 'A correctness invariant violated during otherwise healthy processing produces no signal in infrastructure or pipeline metrics.',
          source: SRC.FIRST,
        },
        {
          text: 'A continuous invariant check over business state is the only layer that can detect a wrong result produced promptly.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'retries',
      title: 'Retries are their own traffic class',
      body: [
        'Counting retries together with normal traffic hides both, because one is a small fraction of the other.',
        'Watch them separately: how many are retrying now, which failure type dominates, how old the oldest retry is, how fast the dead letter topic is growing.',
        'A retry system with no signals fails silently, which is the worst way for it to fail.',
      ],
      claims: [
        {
          text: 'Retry and dead letter traffic measured together with normal traffic obscures both.',
          source: SRC.OPERATIONAL,
        },
        {
          text: 'Dead letter topic growth rate is the signal that distinguishes an isolated bad record from a systematic failure.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'rebalances',
      title: 'Rebalances belong on the same timeline as lag',
      body: [
        'A lag spike at 14:02 that recovers by 14:05 looks like a traffic anomaly. It was a deploy, and a rebalance, and then catch up.',
        'Without rebalance rate on the same dashboard, every deploy looks like a mystery, and a rebalance storm looks like variable traffic.',
        'The consumer exposes rebalance rate and rebalance latency through its own metrics interface, alongside records-lag.',
      ],
      claims: [
        {
          text: 'The consumer exposes rebalance rate and rebalance latency metrics through its own metrics interface, alongside records-lag.',
          source: SRC.KAFKA_METRICS,
        },
        {
          text: 'Alerting on lag alone hides rebalance storms, because the lag signature of a rebalance resembles a traffic spike at typical dashboard resolution.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
    {
      id: 'invisible',
      title: 'The one that is invisible while everything is green',
      body: [
        'The application is healthy. The database is healthy. Kafka is healthy. The outbox publisher has been stopped for six hours.',
        'Nothing is lost. Nothing is delivered. Every dashboard is green.',
        'ALERT ON THE AGE OF THE OLDEST UNPUBLISHED ROW. Nothing else in the system will tell you, because from every component point of view nothing is wrong.',
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
      id: 'percentiles',
      title: 'Percentiles, and the aggregation error almost everyone makes',
      body: [
        'Ninety nine payments finish in 100 ms. One takes ten seconds. The average is 199 ms and says everything is fine.',
        'THE CORRECTION MOST VERSIONS OF THIS NEED. The usual next line is "and the p99 shows it". With one bad request in a hundred, it does not: the p99 sits at the ninety ninth of a hundred sorted observations and the slow one is the hundredth. You need a percentile that can reach the tail you actually care about, which for a one in a hundred event means p99.9 or the maximum.',
        'Choose the percentile for the frequency of the event, not for how senior the number sounds.',
        'And the subtler one, worth saying out loud in an interview: if three instances each compute their own p95, AVERAGING those three does not give you the system wide p95. The maths does not work that way, and the error is not small.',
        'Aggregate the underlying observations, not the summaries.',
      ],
      claims: [
        {
          text: 'An arithmetic mean is insensitive to a small tail, while a percentile is defined by a position in the sorted observations.',
          source: SRC.STATS,
        },
        {
          text: 'A percentile can only reach a tail more frequent than its own complement, so a one in a hundred event is invisible at p99 and visible at p99.9.',
          source: SRC.STATS,
        },
        {
          text: 'Percentiles are not linear, so the mean of per-instance percentiles is not the percentile of the combined population.',
          source: SRC.STATS,
        },
      ],
    },
    {
      id: 'cardinality',
      title: 'Never put a payment id in a metric label',
      body: [
        'One time series per payment, kept forever. High cardinality labels do not degrade gracefully: they take the metrics backend down.',
        'A label is for a BOUNDED set of values. Result success, retry, dead letter. Failure class. Topic name.',
        'When you need to follow one payment, that is what a trace or a log is for. It was never a metrics question.',
      ],
      claims: [
        {
          text: 'Every unique combination of label values creates a new time series, so labels should not be used for unbounded sets of values such as identifiers.',
          source: SRC.PROM_LABELS,
        },
        {
          text: 'Following one specific request is a tracing or logging concern, not a metrics concern, because metrics are aggregates by construction.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'alerts',
      title: 'The test an alert must pass',
      body: [
        'If nobody would do anything about it, it is not an alert.',
        'Would it still fire during an ordinary deploy? If it fires at three in the morning, is that justified?',
        'Alerts nobody acts on train people to ignore the ones that matter, and that training is very hard to undo.',
      ],
      claims: [
        {
          text: 'An alert with no associated action produces alert fatigue, which reduces response to the alerts that do carry one.',
          source: SRC.OPERATIONAL,
        },
        {
          text: 'An alert that fires during routine operations such as a deploy is measuring the operation rather than a fault.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'answer',
      title: 'The first dashboard, in order',
      body: [
        'Lag AGE per consumer group. Rebalance rate. Retry depth and dead letter growth. Age of the oldest unpublished outbox row. Payments completed, with a p99.',
        'Five panels, not fifty. A dashboard nobody reads is worse than no dashboard, because it looks like coverage.',
        'And one invariant check running continuously over the business state, because that is the only thing on this list that can catch a wrong answer delivered on time.',
      ],
      claims: [
        {
          text: 'A small number of panels chosen for what they catch is more effective than a large number chosen for what is available to plot.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'Questions to ask before you answer',
    items: [
      'Which of the three layers does this metric belong to?',
      'Is lag being measured as a count, an age, or both?',
      'What would tell you a correct-looking result was wrong?',
      'Is retry traffic separated from normal traffic?',
      'Is rebalance rate on the same timeline as lag?',
      'Are percentiles computed from observations or averaged from summaries?',
      'Does any label hold an unbounded set of values?',
      'For each alert: what would somebody actually do?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('episode-08-observability')].filter(Boolean),
  trademarks: APACHE_TRADEMARK,
  closing: CLOSING,
};
