/**
 * Where each built sheet lands.
 *
 * Separate from build-pdf.mjs so the tests can read the list without importing
 * a script that starts building things on import. Kept beside the sheets so a
 * new sheet is one edit here and one in the SHEETS map, and the test that
 * checks every built PDF picks it up for free.
 */
export const SHEETS = {
  'digital-wallet': 'public/downloads/digital-wallet-design-sheet.pdf',
  'kafka-rebalancing': 'public/downloads/kafka-rebalancing-design-sheet.pdf',
  'kafka-offsets': 'public/downloads/kafka-offsets-design-sheet.pdf',
  'kafka-idempotency': 'public/downloads/kafka-idempotency-design-sheet.pdf',
  'kafka-retries': 'public/downloads/kafka-retries-design-sheet.pdf',
  'kafka-transactions': 'public/downloads/kafka-transactions-design-sheet.pdf',
  'kafka-observability': 'public/downloads/kafka-observability-design-sheet.pdf',
  'kafka-pipeline': 'public/downloads/kafka-pipeline-design-sheet.pdf',
  'kafka-challenge': 'public/downloads/kafka-challenge-design-sheet.pdf',
  'cc-01-harness': 'public/downloads/claude-code-01-harness.pdf',
  'cc-02-context': 'public/downloads/claude-code-02-context.pdf',
  'cc-03-sessions': 'public/downloads/claude-code-03-sessions.pdf',
  'cc-04-blast-radius': 'public/downloads/claude-code-04-blast-radius.pdf',
  'cc-05-model-effort': 'public/downloads/claude-code-05-model-effort.pdf',
  'cc-06-skills': 'public/downloads/claude-code-06-skills.pdf',
  'cc-07-mcp': 'public/downloads/claude-code-07-mcp.pdf',
  'cc-08-subagents': 'public/downloads/claude-code-08-subagents.pdf',
  'cc-09-working-day': 'public/downloads/claude-code-09-working-day.pdf',
};
