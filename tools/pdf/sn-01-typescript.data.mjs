/**
 * Spring to Node, Episode 1 design sheet: TypeScript for Java developers.
 *
 * EVERY CLAIM AND EVERY SNIPPET HERE WAS RUN, on 2026-09-22, by
 * `scripts/verify-di-tokens.sh` and `scripts/verify-typescript-diffs.sh` in the
 * course repository. Both scripts assert each claim before printing it, so a
 * wrong line on this sheet fails a command rather than reaching a reader.
 *
 * THE SNIPPETS ARE THE POINT OF THIS ONE. Sam's rule: "also include code
 * snippets in the pdf sheet", and "this is a practical course not a
 * theoretical one". A Java developer keeps this next to the editor to retype
 * the token wiring, so the token wiring is here in full rather than described.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run on a real machine, 2026-09-22, by scripts/verify-di-tokens.sh in the course repository.',
  TS: 'TypeScript handbook, Type Compatibility and Modules, checked 2026-09-22.',
  NEST: 'NestJS documentation, Custom Providers, checked 2026-09-22.',
  JUDGEMENT: 'A judgement, not a documented fact.',
};

const PERISHABLE =
  'The versions on this sheet were current on 22 September 2026: TypeScript ' +
  '6.0.3 in the NestJS project, 7.0.2 in the plain Node project, Node 22.22.2 ' +
  'and NestJS 12.0.3. The decorator behaviour in particular has changed across ' +
  'TypeScript versions, so check the date on anything else you read about it.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'The Twenty Percent That Bites',
  subtitle: 'Spring Boot to TypeScript, episode 1',
  kicker: 'For Java developers who can nearly read a NestJS file',
  strapline: 'Your instincts are right about eighty percent of this. The rest looks identical.',
  verifiedOn: '2026-09-22',

  intro: [
    'This is a warm up, not a language course. Every item earns its place by answering one question: does it help you read, change or ship a NestJS service?',
    'The beat worth keeping is the container. An interface does not exist at runtime, so NestJS cannot inject by type, so every provider you write needs a token. That single chain explains most of what looks like ceremony in a NestJS codebase.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Classes, and the constructor parameter shorthand',
      'private readonly against private final, and what it does not guarantee',
      'Why the container refuses an interface, and what a token fixes',
      'Structural typing against nominal typing',
      'Promises against threads, and the one thread that serves everybody',
      'Decorators as functions that have already run',
      'Imports by file path, and the .js suffix that looks wrong',
      'The declared field type that validates nothing',
    ],
    outTitle: 'Out of scope',
    out: [
      'Generics beyond reading them',
      'Conditional types, mapped types and the utility types',
      'Namespaces, declaration merging and the compiler API',
      'Validation itself, which has its own episode',
    ],
    note: 'A warm up, so the framework is readable. If you want the language properly, take a language course, and you will get more out of it after this.',
  },

  scale: {
    title: 'What transfers, what does not, and what is measured',
    note: 'Every figure on the right came off a terminal on 22 September 2026. Reproduce all of it with scripts/verify-di-tokens.sh.',
    rows: [
      ['Constructor injection', 'transfers completely'],
      ['private final', 'becomes a compile time note only'],
      ['Injecting by interface', 'does not transfer. Use a token'],
      ['The interface, in the compiled file', '0 occurrences'],
      ['What the container reads instead', 'design:paramtypes = [Object]'],
      ['Nominal typing', 'does not transfer. Shape decides'],
      ['A declared field type', 'validates nothing at all'],
      ['Versions measured on', 'TypeScript 6.0.3, Node 22.22.2, NestJS 12.0.3'],
    ],
  },

  sections: [
    {
      id: 'readonly',
      title: 'private readonly is not private final',
      body: [
        'The constructor shorthand declares the field and assigns it in one place, which is the thing you miss when you go back to Java.',
        'But readonly is checked by the compiler and then erased. Nothing at runtime defends the field, so a cast is enough to write to it.',
      ],
      code: [
        {
          caption: 'payment.ts',
          lines: [
            'export class Payment {',
            '  constructor(public readonly id: string) {}',
            '}',
            '',
            "const p = new Payment('p_1');",
            "(p as any).id = 'MUTATED';",
            'console.log(p.id);   // MUTATED',
          ],
          note: 'Compiles clean. The compiler refuses a direct write and cannot stop the cast.',
        },
      ],
      claims: [
        {text: 'readonly is a compile time check with no runtime representation.', source: SRC.TS},
      ],
    },
    {
      id: 'injection',
      title: 'Why the container will not build',
      body: [
        'This is the most ordinary code in Spring. It compiles with no errors and the application does not start.',
        'The reason is one line of the compiled output. A decorator makes the compiler record what the constructor takes, so the container can read it back. After erasure there is no interface left to record, so it records Object, and Object is not something the container has a provider for.',
      ],
      code: [
        {
          caption: 'by-type.ts, which does not start',
          lines: [
            '@Injectable()',
            'class PaymentsService {',
            '  constructor(private readonly gateway: PaymentGateway) {}',
            '}',
            '',
            "// Nest can't resolve dependencies of the PaymentsService (?).",
            '// Make sure the argument at index [0] is available in the module.',
          ],
        },
        {
          caption: 'what the compiler emitted for it',
          lines: [
            'PaymentsService = __decorate([',
            '  (0, common_1.Injectable)(),',
            '  __metadata("design:paramtypes", [Object])',
            '], PaymentsService);',
          ],
          note: 'The interface name appears zero times in the compiled file.',
        },
        {
          caption: 'with-token.ts, which does. Copy this wiring.',
          lines: [
            "const PAYMENT_GATEWAY = Symbol('PaymentGateway');",
            '',
            '@Injectable()',
            'class PaymentsService {',
            '  constructor(',
            '    @Inject(PAYMENT_GATEWAY)',
            '    private readonly gateway: PaymentGateway,',
            '  ) {}',
            '}',
            '',
            '@Module({',
            '  providers: [',
            '    {provide: PAYMENT_GATEWAY, useClass: StripeGateway},',
            '    PaymentsService,',
            '  ],',
            '})',
            'class AppModule {}',
            '',
            '// charged 10000',
          ],
          note: 'Nothing recovered the interface. The constructor asks for a value that exists at runtime instead of a type that does not.',
        },
      ],
      claims: [
        {text: 'Nest refuses with: can\'t resolve dependencies of the PaymentsService (?). Please make sure that the argument at index [0] is available in the current module.', source: SRC.RUN},
        {text: 'A provider token may be a string or a symbol, and a symbol avoids collisions between modules.', source: SRC.NEST},
      ],
    },
    {
      id: 'structural',
      title: 'Shape decides compatibility, not the name',
      body: [
        'Java compares the name of the type. Two types are compatible when one declares that it is the other. TypeScript asks only whether the shape fits.',
        'This is the design rather than a hole in it, and it matters the first time you pass the wrong identifier into the right shaped parameter.',
      ],
      code: [
        {
          caption: 'shapes.ts',
          lines: [
            'class Merchant { constructor(public id: string) {} }',
            'class Customer { constructor(public id: string) {} }',
            '',
            "const m: Merchant = new Customer('c_1');",
            'console.log(m.id);   // c_1',
          ],
          note: 'The same assignment is a compile error in Java.',
        },
      ],
      claims: [
        {text: 'TypeScript uses structural typing: compatibility is decided by members, not by declared inheritance.', source: SRC.TS},
      ],
    },
    {
      id: 'decorators',
      title: 'An annotation is data. A decorator already ran.',
      body: [
        'A Java annotation is metadata, inert until something reads it reflectively. A decorator is a function, and it runs when the file loads, before the class has finished being defined and long before any instance exists.',
        'At the time of writing NestJS uses the older decorator behaviour, switched on by experimentalDecorators, with emitDecoratorMetadata supplying the type metadata the container reads.',
      ],
      code: [
        {
          caption: 'nestjs-api/tsconfig.json, the two options that matter',
          lines: [
            '{',
            '  "compilerOptions": {',
            '    "emitDecoratorMetadata": true,',
            '    "experimentalDecorators": true,',
            '    "module": "nodenext",',
            '    "target": "ES2023"',
            '  }',
            '}',
          ],
          note: 'emitDecoratorMetadata is what writes design:paramtypes. Without it the container has nothing to read at all.',
        },
      ],
      claims: [
        {text: 'Decorators are evaluated when the class definition is evaluated, not when an instance is created.', source: SRC.TS},
      ],
    },
    {
      id: 'validation',
      title: 'The declared type validates nothing',
      body: [
        'In Spring, Jackson coerces at the boundary or returns a 400, so the declared type is enforced before your method runs. In NestJS nothing binds: the JSON becomes an object and that object reaches you as it arrived.',
        'What makes this dangerous rather than annoying is that it is broken by operator. Addition concatenates; multiplication coerces and works.',
      ],
      code: [
        {
          caption: 'the same field, two adjacent lines',
          lines: [
            'typeof amount : string',
            'amount + 1    : 100001',
            'amount * 2    : 20000',
          ],
          note: 'Every test that multiplies passes. The one place you add a fee quietly grows a digit.',
        },
      ],
      claims: [
        {text: 'A declared field type has no runtime representation and performs no validation.', source: SRC.TS},
        {text: 'Validation at the boundary is separate code, configured as a pipe.', source: SRC.NEST},
      ],
    },
  ],

  checklist: {
    title: 'Before you write a NestJS provider',
    items: [
      'If the dependency is an interface, give it a token and inject the token',
      'Prefer a symbol over a string token, so two modules cannot collide',
      'Do not trust a declared field type to have validated anything',
      'Assume readonly is a compile time note, not a runtime guarantee',
      'Write the .js suffix on relative imports, and expect it to look wrong',
      'Never block the event loop: there is one thread serving every request',
    ],
  },

  links: CHANNEL_LINKS,

  trademarks:
    'Node.js is a trademark of the OpenJS Foundation. Java is a trademark of ' +
    'Oracle. Spring and Spring Boot are trademarks of Broadcom. NestJS and ' +
    'TypeScript are the property of their respective owners. This is an ' +
    'independent, unofficial guide produced by Code with Sam, not affiliated ' +
    'with or endorsed by any of them, and no third party artwork is ' +
    'reproduced here.',

  closing: CLOSING,
};
