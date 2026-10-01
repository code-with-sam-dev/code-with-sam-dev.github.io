/**
 * Spring to Node design sheet, episode 37 in the course list: OpenTelemetry on both stacks.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-otel.sh` in the course repository:
 * real processes exporting OTLP to Jaeger 2.11. Spring Boot 4.1.1 with spring-boot-starter-opentelemetry
 * (opentelemetry-sdk 1.62.0); Node SDK 0.222, auto-instrumentations-node 0.80.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-otel.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '100 payments. 11 traces.',
  subtitle: 'Spring Boot to NestJS, episode 37: OpenTelemetry',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A trace is usually a decision made at the root and propagated downstream.',
  verifiedOn: '2026-10-01',

  intro: [
    'Spring Boot\'s OpenTelemetry starter samples 10% of root requests by default: 9 of 100 in our run. The Node SDK sampled all 100.',
    'A RestClient built from Spring\'s injected builder carried the trace into the next service. RestClient.create() did not.',
    '100 payments through Spring at its default, each calling a Nest ledger that samples everything: 11 ledger traces. Nest followed the parent.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['The Spring Boot 4 starter and the Node SDK', 'Sampling defaults', 'Propagation across HTTP', 'The parent\'s decision'],
    outTitle: 'Not in scope',
    out: ['Metrics and logs over OTLP', 'Collector pipelines and tail sampling'],
    note: 'At the time of recording management.tracing.sampling.probability defaults to 0.1.',
  },

  scale: {
    title: 'The measurements',
    note: 'Traces counted in Jaeger through its query API.',
    rows: [
      ['SPRING, 100 ROOTS, DEFAULTS', '9 traces'],
      ['NEST, 100 ROOTS, DEFAULTS', '100 traces'],
      ['RestClient FROM THE BUILDER', 'one trace, both services'],
      ['RestClient.create()', 'Spring only'],
      ['NEST fetch INTO SPRING', 'one trace, both services'],
      ['100 VIA SPRING DEFAULT, NEST LEDGER', '11 ledger traces'],
      ['100 VIA SPRING AT 1.0', '100 ledger traces'],
    ],
  },

  sections: [
    {
      id: 'spring',
      title: 'Spring: sample on purpose, build clients from the builder',
      body: ['Set the root sampling probability, and build every HTTP client from the injected RestClient.Builder so it is instrumented.'],
      code: [{caption: 'application.properties', lines: [
        'management.tracing.sampling.probability=1.0',
        'management.opentelemetry.tracing.export.otlp.endpoint=http://collector:4318/v1/traces',
      ]}, {caption: 'PaymentsController.java', lines: [
        'PaymentsController(RestClient.Builder builder) {',
        '  this.ledger = builder.baseUrl(ledgerUrl).build(); // instrumented',
        '  // RestClient.create(ledgerUrl) is not',
        '}',
      ]}],
      claims: [{text: 'builder: one trace, both services; create(): Spring only', source: RUN}],
    },
    {
      id: 'nest',
      title: 'Nest: the Node SDK, configured by environment',
      body: ['Start the SDK before the app, configured by the standard OTEL_ variables. Roots are all sampled by default; a sampled parent is followed.'],
      code: [{caption: 'shell', lines: [
        'OTEL_SERVICE_NAME=ledger \\',
        'OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318 \\',
        'OTEL_TRACES_SAMPLER=parentbased_traceidratio OTEL_TRACES_SAMPLER_ARG=0.25 \\',
        'node --import @opentelemetry/auto-instrumentations-node/register dist/main.js',
      ]}],
      claims: [{text: 'roots: 100 of 100; behind a 10% Spring root: 11 of 100', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Spring Boot 4.1 with the Java SDK 1.62, Node SDK 0.222, Jaeger 2.11.',

  checklist: {
    title: 'Before you trust a trace',
    items: [
      'Which service is the root, and what does it sample?',
      'Do downstream services follow the parent?',
      'Is every HTTP client on the instrumented path?',
      'Does one request show every service in one trace?',
      'Is the sampling rate a decision someone made?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-otel.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'OpenTelemetry for JavaScript', url: 'https://opentelemetry.io/docs/languages/js/'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. OpenTelemetry and Jaeger are projects of the Cloud Native Computing Foundation. ' +
    'This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
