/**
 * Spring to Node design sheet, episode 39 in the course list: email and translations.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-i18n-mail.sh` in the course
 * repository, with real processes. Spring Boot 4.1.1 (angus-mail 2.0.5); @nestjs/i18n 0.0.1 on Nest
 * 12.1.2; nodemailer 10.0.13.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-i18n-mail.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'French customer. German receipt.',
  subtitle: 'Spring Boot to NestJS, episode 39: email and translations',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Email and translations both have fallback policies you can miss in development.',
  verifiedOn: '2026-10-01',

  intro: [
    'Spring\'s MessageSource falls back to the server\'s locale by default: a French request on a German server got German.',
    'The new first-party @nestjs/i18n fell back to its default locale, and returned the raw key for a key in no catalog.',
    'A silent mail server blocked Spring past 60 s with the timeouts at their defaults; an unobserved send failure ended a Nest process.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['MessageSource and @nestjs/i18n', 'Locale fallback and missing keys', 'SMTP timeouts', 'Send and forget'],
    outTitle: 'Not in scope',
    out: ['Email templates', 'Pluralisation and ICU formats'],
    note: 'At the time of recording @nestjs/i18n is 0.0.1 and needs Nest 12.1.',
  },

  scale: {
    title: 'The measurements',
    note: 'Catalogs en (default) and de.',
    rows: [
      ['SPRING, fr, GERMAN JVM LOCALE', 'German'],
      ['SPRING, fallback-to-system-locale=false', 'English'],
      ['NEST, fr', 'English (defaultLocale)'],
      ['A KEY IN NO CATALOG', 'Spring 500; Nest 200 + the raw key'],
      ['SILENT SMTP, DEFAULTS', 'Spring past 60 s; nodemailer 30 s'],
      ['SPRING, TIMEOUTS 5000 ms', 'failed after 5 s'],
      ['SEND AND FORGET, REFUSED', 'Spring serving; Nest exit code 1'],
    ],
  },

  sections: [
    {
      id: 'spring',
      title: 'Spring: decide the fallback, set the timeouts',
      body: ['Stop the fallback to the server\'s locale, and set every SMTP timeout.'],
      code: [{caption: 'application.properties', lines: [
        'spring.messages.fallback-to-system-locale=false',
        'spring.mail.properties.mail.smtp.connectiontimeout=5000',
        'spring.mail.properties.mail.smtp.timeout=5000',
        'spring.mail.properties.mail.smtp.writetimeout=5000',
      ]}],
      claims: [{text: 'fallback off: English; timeouts 5000: failed after 5 s', source: RUN}],
    },
    {
      id: 'nest',
      title: 'Nest: choose the policy, observe every send',
      body: ['Pick a missing-key policy you can live with in front of a customer, and never leave a send promise unobserved.'],
      code: [{caption: 'app.module.ts', lines: [
        'I18nModule.forRoot({',
        '  loader: new JsonI18nLoader({ path: join(import.meta.dirname, "i18n") }),',
        "  defaultLocale: 'en',",
        "  missingKey: 'throw', // or 'fallback' (the default): the raw key",
        '}),',
      ]}, {caption: 'receipts.service.ts', lines: [
        'this.transport.sendMail(receipt).catch((err) => this.logger.error(err));',
      ]}],
      claims: [{text: 'unobserved: HTTP 200, then the process exited with code 1', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Spring Boot 4.1, @nestjs/i18n 0.0.1, nodemailer 10.',

  checklist: {
    title: 'Before a message reaches a customer',
    items: [
      'What does an unsupported locale get?',
      'What does a missing key become?',
      'How long can a send block a request?',
      'Who observes a failed send?',
      'Does a 200 mean the email was sent, or only accepted?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-i18n-mail.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS i18n', url: 'https://docs.nestjs.com/application/i18n'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
