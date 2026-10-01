/**
 * Spring to Node design sheet, episode 29 in the course list: application events with NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-events.sh` in the course
 * repository, against Postgres 18 with real processes. @nestjs/event-emitter 12.0.1, eventemitter2
 * 6.4.9, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-events.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Rolled back. Receipt sent.',
  subtitle: 'Spring Boot to NestJS, episode 29: application events',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'An application event is still part of your execution model. Publishing inside a transaction does not make the event transactional.',
  verifiedOn: '2026-10-01',

  intro: [
    'A declined payment rolled back. A plain Spring @EventListener and a Nest @OnEvent had both already sent the receipt.',
    'Spring\'s @TransactionalEventListener did not run on rollback, and ran after the commit. Nest has no equivalent here: emit after the commit yourself.',
    'A throwing Spring listener reached the publisher. A throwing Nest listener was caught and logged, unless suppressErrors was off, when an async one took the process down.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['ApplicationEventPublisher and EventEmitter2', 'Listener failures', 'Who waits: emit, emitAsync, @Async', 'Events and transactions'],
    outTitle: 'Not in scope',
    out: ['The outbox pattern in depth', 'Events between services'],
    note: 'At the time of recording, @OnEvent listeners suppress errors by default.',
  },

  scale: {
    title: 'The measurements',
    note: 'A 300 ms listener for timing; a listener that throws for failure.',
    rows: [
      ['SPRING publishEvent, LISTENER THROWS', 'threw IllegalStateException'],
      ['NEST emit, LISTENER THROWS', 'did not throw; error logged'],
      ['NEST suppressErrors false, ASYNC', 'process exited, code 1, at 18 ms'],
      ['SPRING publish / @Async', '303 ms / 1 ms'],
      ['NEST emit / emitAsync', '7 ms (listener ran to 307) / 302 ms'],
      ['ROLLED BACK, PLAIN LISTENER, BOTH', 'payments 0, receipts 1'],
      ['@TransactionalEventListener / emit after COMMIT', 'rolled back 0; committed 1'],
    ],
  },

  sections: [
    {
      id: 'commit',
      title: 'Emit after the commit',
      body: ['@OnEvent runs while your transaction is still open. Commit first, then emit. If the event must survive a crash between the commit and the emit, write it to an outbox table in the same transaction.'],
      code: [{caption: 'payments.service.ts', lines: [
        'await this.dataSource.transaction(async (manager) => {',
        '  await manager.save(Payment, payment);',
        '});',
        "this.events.emit('payment.created', payment.id);",
      ]}],
      claims: [{text: 'emit only after COMMIT: rolled back, receipts sent 0; committed, receipts sent 1', source: RUN}],
    },
    {
      id: 'failure',
      title: 'Hear the failure',
      body: ['emit() never hands a listener\'s error back. Only emitAsync with suppressErrors: false on the listener rejects in the publisher; suppressErrors: false with plain emit crashed the process.'],
      code: [{caption: 'receipt.listener.ts', lines: [
        "@OnEvent('payment.created', { suppressErrors: false })",
        'async sendReceipt(id: string) { /* ... */ }',
        '',
        "await this.events.emitAsync('payment.created', id); // rejects if it throws",
      ]}],
      claims: [{text: 'emitAsync with suppressErrors false: rejected: mail server busy after 501 ms', source: RUN}],
    },
    {
      id: 'spring',
      title: 'The Spring side',
      body: ['@TransactionalEventListener runs after commit by default and not at all on rollback. A plain @EventListener runs on the publisher\'s thread, inside the transaction.'],
      code: [{caption: 'ReceiptListener.java', lines: ['@TransactionalEventListener', 'void receiptAfterCommit(PaymentEvents.Created event) {']}],
      claims: [{text: 'rolled back: @EventListener receipts 1, @TransactionalEventListener receipts 0', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/event-emitter 12, eventemitter2 6.4, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust an application event',
    items: [
      'Does the publisher wait for the listener?',
      'Does a listener failure reach the publisher, get logged, or crash the process?',
      'Is the event emitted inside a transaction?',
      'Can the listener act on work that later rolls back?',
      'Must the event survive a crash? Then it needs an outbox.',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-events.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS events', url: 'https://docs.nestjs.com/techniques/events'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
