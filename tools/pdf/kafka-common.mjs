/**
 * What every Kafka sheet in the series shares.
 *
 * Written once because it went wrong once: the link block shipped with seven
 * entries where there should have been nine, and it shipped that way because
 * the list was retyped rather than referenced. Nine sheets retyping it is nine
 * chances to drop one.
 *
 * The video URL is deliberately NOT here. It is the one field that differs per
 * sheet and the one a reader actually clicks, so it stays where a missing value
 * is obvious.
 */

export {CHANNEL_LINKS} from './channel-links.mjs';

/**
 * Episode modules that ACTUALLY EXIST in the kafka-payments repository today.
 *
 * This list is the fix for SEVEN broken links that shipped inside downloadable
 * design sheets. Every sheet from episode 4 onward pointed at a module
 * directory that has never been pushed, so the one thing a reader keeps after
 * the video ended handed them a 404.
 *
 * The failure was structural rather than careless: the link was DERIVED from
 * the sheet name, so it always looked right and was never checked against the
 * repository. Deriving a URL guarantees it is well formed. It guarantees
 * nothing about whether it resolves.
 *
 * Add a module here on the day it is pushed, not on the day it is written.
 */
const PUBLISHED_MODULES = new Set(['episode-01-ordering', 'episode-03-rebalancing']);

/**
 * The series repo, with the module named per sheet, or NOTHING.
 *
 * A missing link costs a reader one click of curiosity. A link that 404s costs
 * the channel its credibility, which is the entire product.
 */
export const repoLink = (module) =>
  PUBLISHED_MODULES.has(module)
    ? {
        label: 'Runnable code',
        url: `https://github.com/code-with-sam-dev/kafka-payments/tree/main/${module}`,
      }
    : null;

export const APACHE_TRADEMARK =
  'Apache Kafka and the Kafka logo are trademarks of the Apache Software Foundation. ' +
  'PostgreSQL and its logo are trademarks of the PostgreSQL Community Association. ' +
  'They appear here only to identify the technology being discussed. Nothing here ' +
  'implies endorsement by, or affiliation with, any of them.';

export const CLOSING =
  'If this was useful, a like and a subscribe help more than you would think. ' +
  'And tell me in the comments which system you want taken apart next.';

/** Source labels, shared so a typo cannot create a second spelling of one source. */
export const SRC = {
  KAFKA_DESIGN: 'Kafka 4.3, Design: Message Delivery Semantics',
  KAFKA_CONSUMER: 'Kafka 4.3, Consumer Configs',
  KAFKA_PRODUCER: 'Kafka 4.3, Producer Configs',
  KAFKA_TX: 'Kafka 4.3, Design: Transactions',
  KAFKA_TOPICS: 'Kafka 4.3, Topics and Logs',
  KAFKA_MONITORING: 'Kafka 4.3, Monitoring',
  KAFKA_METRICS: 'Kafka 4.3, Consumer Metrics',
  PG_CONSTRAINTS: 'PostgreSQL 17, Constraints',
  PG_UPSERT: 'PostgreSQL 17, INSERT ... ON CONFLICT',
  PG_TX: 'PostgreSQL 17, Transactions',
  PROM_LABELS: 'Prometheus, Metric and Label Naming',
  XA: 'The XA specification, Distributed Transaction Processing',
  STATS: 'Standard statistics, stated as such rather than as vendor behaviour',
  FIRST: 'First principles, not vendor documentation',
  OPERATIONAL: 'Operational practice, not vendor documentation',
};
