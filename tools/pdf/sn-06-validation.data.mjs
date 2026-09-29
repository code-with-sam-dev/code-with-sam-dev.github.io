/**
 * Spring to Node design sheet, episode 7 in the course list: request validation.
 *
 * EVERY LINE HERE WAS RUN, on 2026-09-29, by `scripts/verify-validation.sh` in the course
 * repository against both live applications. Node 22, NestJS 12, Spring Boot 4.1.1,
 * Jackson 3. The NestJS side has ValidationPipe switched on; that is disclosed, not a default.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-29, by scripts/verify-validation.sh in the course repository.';
const NEST = 'NestJS documentation, Validation, checked 2026-09-29.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Spring Accepted This?',
  subtitle: 'Spring Boot to NestJS, episode 6: request validation',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Validation is three jobs: convert types, handle unknown fields, check rules.',
  verifiedOn: '2026-09-29',

  intro: [
    'Spring and NestJS put request strictness in different places. In our app Spring checks bad values with Bean Validation, but Jackson converts types and drops unknown fields.',
    'NestJS checks nothing at the boundary until you bind a ValidationPipe. The NestJS side below has it switched on, which is the point of the comparison, not a default.',
    'Versions on this sheet were current on 29 September 2026: NestJS 12, Spring Boot 4.1.1 with Jackson 3.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Type conversion, unknown fields and rule checking, as three separate jobs',
      'Why Spring accepted a string amount and an extra field',
      'What transform, whitelist and forbidNonWhitelisted each do',
      'What reaches the handler without whitelist',
      'The same rules in Bean Validation and class-validator',
    ],
    outTitle: 'Not in scope',
    out: ['Turning the rejection into a response: that is the next episode, exception filters'],
    note: 'The generic Spring 400 body shown is this app\'s default error body, not a Spring rule.',
  },

  scale: {
    title: 'The measurement',
    note: 'Spring at its defaults; NestJS with ValidationPipe on.',
    rows: [
      ['STRING AMOUNT "10000"', 'Spring 201, converted to 10000 / NestJS 400'],
      ['EXTRA "isAdmin": true', 'Spring 201, field dropped / NestJS 400, property isAdmin should not exist'],
      ['EMPTY BODY, JUNK VALUES', 'both 400'],
      ['JACKSON, COERCION OFF', 'Cannot coerce String value ("10000") to long'],
      ['JACKSON, FAIL_ON_UNKNOWN_PROPERTIES', 'Unrecognized property "isAdmin"'],
      ['NESTJS, TRANSFORM, NO WHITELIST', 'handler received amountInMinorUnits, currency, isAdmin, role'],
      ['NESTJS, WHITELIST ON', 'handler received amountInMinorUnits, currency'],
    ],
  },

  sections: [
    {
      id: 'pipe',
      title: 'The NestJS pipe',
      body: ['transform turns plain JSON into your class. whitelist removes undeclared properties. forbidNonWhitelisted rejects the request instead of removing them.'],
      code: [{caption: 'nestjs-api/src/main.ts', lines: [
        'app.useGlobalPipes(',
        '  new ValidationPipe({',
        '    whitelist: true,',
        '    forbidNonWhitelisted: true,',
        '    transform: true,',
        '  }),',
        ');',
      ]}],
      claims: [{text: '"Start by binding ValidationPipe at the application level"', source: NEST}],
    },
    {
      id: 'rules',
      title: 'The same rules, two languages',
      body: ['The concepts transfer; the syntax does not map perfectly. Spring checks the currency with a pattern, NestJS with an allowed list, and the integer check is a separate decorator.'],
      code: [
        {caption: 'CreatePaymentRequest.java', lines: [
          'public record CreatePaymentRequest(',
          '    @NotNull @Min(value = 1, message = "amountInMinorUnits must be at least 1")',
          '        Long amountInMinorUnits,',
          '    @NotNull @Pattern(regexp = "USD|EUR|GBP|ZAR", message = "currency must be a supported ISO code")',
          '        String currency,',
          '    @NotBlank(message = "idempotencyKey is required") String idempotencyKey) {}',
        ]},
        {caption: 'create-payment.dto.ts', lines: [
          'export class CreatePaymentRequest {',
          "  @IsInt({ message: 'amountInMinorUnits must be an integer number of minor units' })",
          "  @Min(1, { message: 'amountInMinorUnits must be at least 1' })",
          '  amountInMinorUnits!: number;',
          '',
          "  @IsIn(['USD', 'EUR', 'GBP', 'ZAR'], { message: 'currency must be a supported ISO code' })",
          '  currency!: string;',
          '',
          '  @IsString()',
          "  @IsNotEmpty({ message: 'idempotencyKey is required' })",
          '  idempotencyKey!: string;',
          '}',
        ]},
      ],
      claims: [],
    },
    {
      id: 'jackson',
      title: 'Making Spring strict',
      body: ['Both behaviours are Jackson defaults and both can be switched off. In Spring Boot, deserialization features are set with spring.jackson.deserialization.<feature_name>. At the time of recording, Spring Boot 4.1.1 ships Jackson 3 and the imports moved to tools.jackson.databind.'],
      code: [{caption: 'JacksonLenienceTest.java', lines: [
        'JsonMapper strict = JsonMapper.builder()',
        '        .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)',
        '        .build();',
      ]}],
      claims: [{text: 'with FAIL_ON_UNKNOWN_PROPERTIES: Unrecognized property "isAdmin"', source: RUN}],
    },
  ],

  scaleNote: 'NestJS 12, Spring Boot 4.1.1, Jackson 3, on 29 September 2026.',

  checklist: {
    title: 'Before you ship a NestJS endpoint',
    items: [
      'Bind ValidationPipe globally',
      'Turn on whitelist, and forbidNonWhitelisted if extra fields should fail',
      'Turn on transform so decorators run on a real instance',
      'Put an integer check where Java had a Long',
      'In Spring, decide deliberately on FAIL_ON_UNKNOWN_PROPERTIES',
      'Know which layer owns conversion, shape and rules',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-validation.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: Validation', url: 'https://docs.nestjs.com/techniques/validation'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with ' +
    'Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
