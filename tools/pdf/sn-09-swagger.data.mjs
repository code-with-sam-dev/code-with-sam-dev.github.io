/**
 * Spring to Node design sheet, episode 10 in the course list: API docs with Swagger.
 *
 * EVERY LINE HERE WAS RUN, on 2026-09-30, by `scripts/verify-docs.sh` in the course
 * repository. Node 22, @nestjs/swagger 12.0.2, Spring Boot 4.1.1, springdoc 3.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-docs.sh in the course repository.';
const NEST = 'NestJS documentation, OpenAPI CLI plugin, checked 2026-09-30.';
const SPRINGDOC = 'springdoc-openapi properties, checked 2026-09-30.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '3 Fields → {}',
  subtitle: 'Spring Boot to NestJS, episode 10: API docs with Swagger',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'The runtime knows the types. Swagger needs its own metadata. Let the plugin derive it.',
  verifiedOn: '2026-09-30',

  intro: [
    'The same validated request class documents all three fields in Spring and none in NestJS. It is not that TypeScript erased the types: runtime reflection still reports Number, String, String.',
    '@nestjs/swagger builds schemas from its own Swagger metadata, and reflection alone cannot say which properties a class has or which are required. Write that metadata by hand, or let the CLI plugin generate it at build time.',
    'Versions on this sheet were current on 30 September 2026: @nestjs/swagger 12, Spring Boot 4.1.1 with springdoc 3.1.1.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why a typed, validated NestJS DTO documents nothing by default',
      'ApiProperty by hand, and the drift it invites, measured',
      'The CLI plugin: where its fields and its limits come from',
      'The plugin\'s file name boundary, and the springdoc naming collision',
    ],
    outTitle: 'Not in scope',
    out: ['File uploads in the docs: next episode', 'Swagger UI theming and security schemes'],
    note: 'Swagger UI renders the OpenAPI document; the JSON is what was measured.',
  },

  scale: {
    title: 'The measurement',
    note: 'Same three fields on both stacks, nothing added unless stated.',
    rows: [
      ['SPRING, NO ANNOTATIONS', '3 of 3 properties, limits included'],
      ['NESTJS, NO PLUGIN', '{"type":"object","properties":{}}  0 of 3'],
      ['RUNTIME REFLECTION', 'design:type Number, String, String'],
      ['HAND-WRITTEN DRIFT', '"USD" 201, "US" 400; document says length 2'],
      ['PLUGIN, DEFAULT', '3 of 3 with minimum 1, minLength/maxLength 3'],
      ['PLUGIN, SHIM OFF', 'fields and types stay, every limit vanishes'],
      ['FILE NOT .dto.ts', '0 of 2; ".ts" suffix refused; a specific suffix 2 of 2'],
      ['SPRINGDOC, SAME NAME', 'one schema; use-fqn=true gives two'],
    ],
  },

  sections: [
    {
      id: 'plugin',
      title: 'The plugin, the documented way',
      body: ['It reads properties, types and requiredness from the TypeScript source at compile time. With classValidatorShim on (the default), it also copies class-validator limits into the schema.'],
      code: [
        {caption: 'nest-cli.json', lines: ['{', '  "compilerOptions": {', '    "plugins": ["@nestjs/swagger"]', '  }', '}']},
        {caption: 'the DTO, no ApiProperty anywhere', lines: [
          'export class CreatePaymentDto {',
          '  @IsInt()',
          '  @IsPositive()',
          '  amountInMinorUnits!: number;',
          '',
          '  @IsString()',
          '  @Length(3, 3)',
          '  currency!: string;',
          '',
          '  @IsString()',
          '  idempotencyKey!: string;',
          '}',
        ]},
      ],
      claims: [
        {text: '"TypeScript\'s metadata reflection system... can\'t determine which properties a class consists of, or whether a given property is optional or required."', source: NEST},
        {text: 'dtoFileNameSuffix defaults to [\'.dto.ts\', \'.entity.ts\']', source: NEST},
      ],
    },
    {
      id: 'drift',
      title: 'Why not ApiProperty by hand',
      body: ['The same rule written twice drifts. Nothing fails: the server enforces one rule and the document advertises another.'],
      code: [{caption: 'drift.ts', lines: [
        '@IsString()',
        '@Length(3, 3)',
        '@ApiProperty({ minLength: 2, maxLength: 2 })',
        'currency!: string;',
      ]}],
      claims: [{text: 'POST "USD" 201, POST "US" 400, document: {"type":"string","minLength":2,"maxLength":2}', source: RUN}],
    },
    {
      id: 'spring',
      title: 'The Spring side',
      body: ['springdoc infers the schema from the Java classes and Bean Validation with nothing added. Two classes with the same simple name share one schema by default; fully qualified names keep them apart.'],
      code: [{caption: 'application.properties', lines: ['springdoc.use-fqn=true']}],
      claims: [{text: 'springdoc.use-fqn: "To enable fully qualified names." Default false.', source: SPRINGDOC}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: springdoc 3.1.1 for Spring Boot 4, @nestjs/swagger 12.',

  checklist: {
    title: 'Before you ship NestJS API docs',
    items: [
      'Enable the @nestjs/swagger plugin in nest-cli.json',
      'Keep classValidatorShim on so the limits come from your validators',
      'Name DTO files *.dto.ts, or add a specific dtoFileNameSuffix',
      'Never use ".ts" as a suffix: the plugin refuses it',
      'Avoid restating validator limits in ApiProperty',
      'In Spring, set springdoc.use-fqn=true if simple names can collide',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-docs.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: OpenAPI CLI plugin', url: 'https://docs.nestjs.com/openapi/cli-plugin'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Swagger is a trademark of SmartBear Software. This is an independent, ' +
    'unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
