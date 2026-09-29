/**
 * Spring to Node design sheet, episode 6 in the course list: configuration and
 * environments.
 *
 * EVERY LINE HERE WAS RUN, on 2026-09-29, by `scripts/verify-config.sh` in the course
 * repository. Node 22.22.2, NestJS 12, Zod 4.6.5, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-29, by scripts/verify-config.sh in the course repository.';
const NEST = 'NestJS documentation, Configuration, checked 2026-09-29.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'It Started Broken.',
  subtitle: 'Spring Boot to NestJS, episode 5: configuration and environments',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A missing setting starts cleanly here, as undefined. Validate the environment at startup.',
  verifiedOn: '2026-09-29',

  intro: [
    'In Spring, a required @Value refuses to start when its property is missing, on your machine, with the key named. In NestJS the same omission starts cleanly and hands you undefined.',
    'Neither is a bug. The NestJS documentation calls it standard practice to throw at startup when required variables are missing, and shows a schema library to do it.',
    'Versions on this sheet were current on 29 September 2026: Node 22, NestJS 12, Zod 4, Spring Boot 4.1.1.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What a missing setting does in each stack',
      'Why every environment value is a string, and where that bites',
      'ConfigService.get against @Value, and relaxed binding',
      'Validating the environment at startup with Zod',
      'The boolean trap inside the obvious fix',
    ],
    outTitle: 'Not in scope',
    out: [
      'Spring profiles (NODE_ENV is a convention your code interprets, not a framework profile system)',
      'Request body validation: that is episode 7',
    ],
    note: 'Spring does not fail fast on everything: unvalidated @ConfigurationProperties bind null and start, measured.',
  },

  scale: {
    title: 'The measurement',
    note: 'The same missing URL, three outcomes.',
    rows: [
      ['NESTJS, NO SCHEMA', 'starts; first payment: Failed to parse URL from undefined/charges'],
      ['SPRING, REQUIRED @VALUE', "refuses: Could not resolve placeholder 'payment.gateway.url'"],
      ['SPRING, @CONFIGURATIONPROPERTIES', 'starts with url = null until @Validated + @NotNull'],
      ['FEATURE_ENABLED=false', 'arrives as "false", and the feature is ON'],
      ['PORT + 1', '"30001", not 3001'],
      ['Z.COERCE.BOOLEAN("false")', 'true'],
      ['Z.STRINGBOOL("false")', 'false'],
      ['NESTJS, ZOD SCHEMA', 'refuses: PAYMENT_GATEWAY_URL: expected string, received undefined'],
    ],
  },

  sections: [
    {
      id: 'schema',
      title: 'The fix: validate at startup',
      body: ['Pass a Standard Schema to ConfigModule.forRoot. The URL must be a URL, the port is coerced to a number, and the flag uses z.stringbool(), because z.coerce.boolean() follows JavaScript\'s Boolean() and turns "false" into true.'],
      code: [{caption: 'config.schema.ts', lines: [
        "import { z } from 'zod';",
        '',
        'const schema = z.object({',
        '  PAYMENT_GATEWAY_URL: z.url(),',
        '  PORT: z.coerce.number().int(),',
        '  FEATURE_ENABLED: z.stringbool(),',
        '});',
        '',
        '@Module({',
        '  imports: [ConfigModule.forRoot({ validationSchema: schema })],',
        '})',
        'class AppModule {}',
      ]}],
      claims: [
        {text: '"It\'s standard practice to throw an exception during application startup if required environment variables haven\'t been provided or don\'t meet certain validation rules."', source: NEST},
        {text: '"Environment variables always arrive as strings"', source: NEST},
      ],
    },
    {
      id: 'spring',
      title: 'What Spring was doing for you',
      body: ['A required placeholder is resolved while the context is built. @ConfigurationProperties binds structured values, and an environment variable written PAYMENT_GATEWAY_URL binds to payment.gateway.url (relaxed binding). Without @Validated it binds null and starts.'],
      code: [{caption: 'GatewayPropertiesTest.java', lines: [
        '@ConfigurationProperties("payment.gateway")',
        'record GatewayProperties(String url) {}',
        '',
        '@Validated',
        '@ConfigurationProperties("payment.gateway")',
        'record ValidatedGatewayProperties(@NotNull String url) {}',
      ]}],
      claims: [{text: 'Unvalidated: started, url = null. Validated: refused to start, "must not be null".', source: RUN}],
    },
    {
      id: 'traps',
      title: 'Two traps while wiring it',
      body: ['ConfigModule.forRoot reads the environment when the module is declared, not when the application starts: set variables first. NestFactory exits on a startup error; with the logger off it exits with no message.'],
      code: [],
      claims: [],
    },
  ],

  scaleNote: 'Node 22.22.2, NestJS 12, Zod 4.6.5, Spring Boot 4.1.1, on 29 September 2026.',

  checklist: {
    title: 'Before you ship NestJS configuration',
    items: [
      'Validate the environment in ConfigModule.forRoot',
      'Coerce numbers in the schema, never with + at the call site',
      'Use z.stringbool() for flags, not z.coerce.boolean()',
      'Set variables before the module is declared',
      'If the app exits silently, turn the logger on',
      'In Spring, add @Validated to @ConfigurationProperties',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-config.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: Configuration', url: 'https://docs.nestjs.com/techniques/configuration'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with ' +
    'Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
