/**
 * Spring Boot to Quarkus, the flagship design sheet: what changes at build time.
 *
 * THE SNIPPETS ARE COPIED OUT OF github.com/code-with-sam-dev/spring-to-quarkus,
 * and every result came off scripts/verify-hook.sh and the two test suites on
 * 2026-09-23.
 *
 * TWO WORDING RULES FROM THE CONSULT, held here as in the video: the finding is
 * against DEFAULT Spring (Spring AOT also decides conditions at build time),
 * and the warning claim is only what was measured: Quarkus warns about its own
 * build time configuration, not about a property used in @IfBuildProperty.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run on a real machine, 2026-09-23. Reproduce it with scripts/verify-hook.sh in the course repository.',
  TEST: 'Asserted by the test suites in the course repository, against Postgres.',
  QCDI: 'Quarkus CDI reference, quarkus.io/guides/cdi-reference, checked 2026-09-23',
  SAOT: 'Spring Framework reference, ahead of time optimizations, checked 2026-09-23',
};

const PERISHABLE =
  'Every version on this sheet was current on 23 September 2026 and will not ' +
  'stay current. The method is the durable part: run the script, read what ' +
  'came back, and write down the result rather than the expectation.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://youtu.be/B-E-KUi7Lb8', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'What Changes at Build Time',
  subtitle: 'Spring Boot to Quarkus, the flagship',
  kicker: 'For Spring developers moving to Quarkus',
  strapline: 'Quarkus did not ignore your setting. It had already used it, at build time.',
  verifiedOn: '2026-09-23',

  intro: [
    'One payment service written twice, in Spring Boot and in Quarkus. Controllers, injection and configuration translate almost line for line. Two things do not: who owns the transaction when you save, and which of your settings are decided before the application starts.',
    'The comparison is against DEFAULT Spring on the normal JVM. With Spring AOT, conditions are evaluated at build time too.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The Spring annotations and their Quarkus counterparts',
      'Spring Data save() against Panache persist()',
      'A bean conditional on a property: decided at start, or at build',
      'What the build time mismatch check catches, and what it misses',
    ],
    outTitle: 'Out of scope',
    out: [
      'Startup time and memory. Nothing here measures them',
      'Native images, and dev mode',
      'Anything about how this channel is produced, which is not the subject',
    ],
    note: 'Every result on this page came from running the built jars, not from a test harness, except where a claim says it is asserted by the test suites.',
  },

  scale: {
    title: 'The move, in one table',
    note: 'The last row is the whole video. A value used at build time is not runtime configuration.',
    rows: [
      ['@RestController, @GetMapping', '@Path, @GET: transfers'],
      ['@Service, constructor injection', '@ApplicationScoped, same constructor: transfers'],
      ['@Value("${...}")', '@ConfigProperty(name = ...): transfers'],
      ['save() is transactional by default', 'persist() needs @Transactional: rewired'],
      ['@ConditionalOnProperty, read at start', '@IfBuildProperty, decided at build: bites'],
    ],
  },

  sections: [
    {
      id: 'transaction',
      title: 'save() owned the transaction. persist() does not.',
      body: [
        'The Spring service has no @Transactional anywhere and still writes the row, because Spring Data\'s save() opens its own transaction.',
        'Translate it line for line to Panache and persist() throws. It expects you to decide where the unit of work lives. Add @Transactional to the service method and the row is written. To be fair to Quarkus, this error names its own fix.',
      ],
      code: [
        {
          caption: 'spring-payments: PaymentService.java',
          lines: [
            'public Long record(long amountInMinorUnits, String currency) {',
            '    return repository.save(new Payment(amountInMinorUnits, currency)).getId();',
            '}',
          ],
        },
        {
          caption: 'quarkus-payments: PaymentService.java',
          lines: [
            '// The Spring service, translated line for line. No transaction anywhere.',
            'public Long recordLikeSpring(long amountInMinorUnits, String currency) {',
            '    Payment payment = new Payment(amountInMinorUnits, currency);',
            '    repository.persist(payment);',
            '    return payment.id;',
            '}',
            '',
            '// The fix: the unit of work is declared, because persist() does not own one.',
            '@Transactional',
            'public Long record(long amountInMinorUnits, String currency) {',
            '    Payment payment = new Payment(amountInMinorUnits, currency);',
            '    repository.persist(payment);',
            '    return payment.id;',
            '}',
          ],
          note: 'recordLikeSpring throws: "TransactionRequiredException: Transaction is not active, consider adding @Transactional to your method to automatically activate one."',
        },
      ],
      claims: [
        {text: 'Spring writes the row with no @Transactional; Panache persist() throws without one and writes with one.', source: SRC.TEST},
      ],
    },
    {
      id: 'build-time',
      title: 'True. Still off.',
      body: [
        'The same property gates the same FraudCheck bean in both apps. Each app is built once with the property false, then started with it set to true.',
        'Spring reads the environment at startup, sees true, and builds the bean. Quarkus made the decision during the build: built with false, the bean was removed before the application ever ran, and starting it with true cannot bring back something that is no longer there.',
      ],
      code: [
        {
          caption: 'spring-payments: FraudCheck.java',
          lines: [
            '@Component',
            '@ConditionalOnProperty(name = "payments.fraud-check.enabled", havingValue = "true")',
            'public class FraudCheck { ... }',
          ],
        },
        {
          caption: 'quarkus-payments: FraudCheck.java',
          lines: [
            '@ApplicationScoped',
            '@IfBuildProperty(name = "payments.fraud-check.enabled", stringValue = "true")',
            'public class FraudCheck { ... }',
          ],
        },
        {
          caption: 'Built with false, started with true',
          lines: [
            'Spring   GET /fraud-check  {"fraudCheck":"present"}',
            'Quarkus  GET /fraud-check  {"fraudCheck":"absent"}',
          ],
        },
      ],
      claims: [
        {text: 'Spring reported present and Quarkus reported absent, from the built jars.', source: SRC.RUN},
        {text: '"Properties set at runtime have absolutely no effect on the bean resolution using @IfBuildProperty / @UnlessBuildProperty."', source: SRC.QCDI},
      ],
    },
    {
      id: 'warning',
      title: 'What the check catches, and what it misses',
      body: [
        'Quarkus does check for this kind of mistake in its OWN configuration. Change quarkus.application.name at runtime and it warns you at startup.',
        'Set the check to fail and start the service with your property set to true: it starts normally, prints no warning, and the fraud check is still absent. The check protects Quarkus settings. It does not protect a property you used in @IfBuildProperty.',
      ],
      code: [
        {
          caption: 'Quarkus\'s own build time setting',
          lines: [
            '$ java -Dquarkus.application.name=renamed -jar quarkus-run.jar',
            'WARN  Build time property cannot be changed at runtime:',
            " - quarkus.application.name is set to 'renamed' but it is build time",
            "   fixed to 'quarkus-payments'.",
          ],
        },
        {
          caption: 'Your property, with the check set to fail',
          lines: [
            '$ java -Dquarkus.config.build-time-mismatch-at-runtime=fail \\',
            '       -Dpayments.fraud-check.enabled=true -jar quarkus-run.jar',
            'INFO  quarkus-payments ... (powered by Quarkus 3.39.5) started',
            '$ curl localhost:8082/fraud-check',
            '{"fraudCheck":"absent"}',
          ],
        },
      ],
      claims: [
        {text: 'The warning appeared for quarkus.application.name; nothing appeared for payments.fraud-check.enabled, even with the check set to fail.', source: SRC.RUN},
      ],
    },
    {
      id: 'aot',
      title: 'Spring does this too, if you ask',
      body: [
        'With Spring\'s ahead of time processing, the kind used for native images, conditions are evaluated at build time as well. So this is not Quarkus being strange and Spring being normal. It is a choice about when decisions are made: default Spring makes them at start up, Quarkus makes many of them at build time, all the time.',
      ],
      claims: [
        {text: '"Environment properties that impact the presence of a bean (@Conditional) are only considered at build time."', source: SRC.SAOT},
      ],
    },
  ],

  scaleNote: 'Measured on Java 25, Spring Boot 4.1.1, Quarkus 3.39.5 and PostgreSQL 17, on 23 September 2026.',

  checklist: {
    title: 'Before you trust a Quarkus service in production',
    items: [
      'Every write path declares @Transactional where the unit of work lives',
      'You know which of your properties are read at build time, and they are set in the build, not the deployment',
      'No property used in @IfBuildProperty is expected to change per environment',
      'quarkus.config.build-time-mismatch-at-runtime is set, knowing what it does not cover',
      'scripts/verify-hook.sh passes on a fresh clone',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The course repository', url: 'https://github.com/code-with-sam-dev/spring-to-quarkus'},
    {label: 'Quarkus CDI reference', url: 'https://quarkus.io/guides/cdi-reference'},
    {label: 'Quarkus configuration reference', url: 'https://quarkus.io/guides/config-reference'},
    {label: 'Spring AOT reference', url: 'https://docs.spring.io/spring-framework/reference/core/aot.html'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Spring and Spring Boot are trademarks of ' +
    'Broadcom. PostgreSQL is a trademark of the PostgreSQL Community ' +
    'Association. Quarkus is the property of its respective owner. This is an ' +
    'independent, unofficial guide produced by Code with Sam, not affiliated ' +
    'with or endorsed by any of them, and no third party artwork is ' +
    'reproduced here.',
  closing: CLOSING,
};
