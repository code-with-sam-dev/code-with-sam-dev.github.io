/**
 * Spring to Node, Episode 3 design sheet: modules and dependency injection.
 *
 * EVERY CLAIM AND EVERY NUMBER HERE WAS RUN, on 2026-09-23, by
 * `scripts/verify-modules.sh` in the course repository, most of it by
 * `src/ep03-modules/build-then-refuse.ts`, which is exactly the example the
 * episode types on screen, measured in every state.
 *
 * THE SNIPPETS ARE THE POINT. The fix is two lines, one in each module, and a
 * reader should be able to retype them without opening anything else.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run on a real machine, 2026-09-23, by scripts/verify-modules.sh in the course repository.',
  NEST: 'NestJS documentation, Modules, Custom providers and Injection scopes, checked 2026-09-23.',
  SPRING: 'Spring Framework documentation, Bean scopes, checked 2026-09-22.',
};

const PERISHABLE =
  'The versions on this sheet were current on 23 September 2026: NestJS 12 and ' +
  'Spring Boot 4.1.1. The exact wording of the injection errors and the ' +
  'behaviour of transient scope are release details, so check the date on ' +
  'anything else you read about them.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'It Exists. Still Refused.',
  subtitle: 'Spring Boot to NestJS, episode 3',
  kicker: 'For Java developers splitting an app into modules',
  strapline: 'A provider can exist, and still be private. Registered is not visible.',
  verifiedOn: '2026-09-23',

  intro: [
    'In a typical Spring Boot application with one application context, a component that scanning discovers can be injected anywhere in that context. Packages organise code; they do not create a boundary for dependency injection.',
    'NestJS is different. A provider belongs to exactly one module and is private to it by default. The NestJS documentation says it directly: a module encapsulates its providers.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why a provider Nest built can still be refused one module away',
      'The two doors: exports on the owning module, imports on the consumer',
      'Telling two almost identical injection errors apart, and the limit of that',
      'Factory providers, and the token as the lookup identity',
      'Default, request and transient scope against Spring singleton and prototype',
      'Global modules, and the documentation’s own warning about them',
    ],
    outTitle: 'Out of scope',
    out: [
      'Lifecycle hooks, beyond one line: they belong with startup and shutdown',
      'Dynamic modules and forRoot, which have their own episode',
      'Async and the event loop, which is next',
    ],
    note: 'One service, two modules, every state measured. Everything here is reproducible with a single script.',
  },

  scale: {
    title: 'What the container actually said',
    note: 'Every row came off a terminal on 23 September 2026. Reproduce all of it with scripts/verify-modules.sh.',
    rows: [
      ['PaymentsModule on its own', "isPaid('pay_1') -> true"],
      ['Interface as the parameter type', 'refused, no name: "the argument at index [0]"'],
      ['Class, neither door open', 'refused, named: "PaymentsService at index [0]"'],
      ['imports only', 'the same message'],
      ['exports only', 'the same message'],
      ['exports and imports', 'receipt for pay_1'],
      ['Transient, one consumer injecting it twice', 'one instance: 3 and 3'],
      ['Spring prototype, the same shape', 'two instances: 3 and 4'],
    ],
  },

  sections: [
    {
      id: 'refused',
      title: 'It exists, and it is still refused',
      body: [
        'The payment service below is correct and Nest builds it. Start its module alone and it answers. Then a receipts service in its own module asks for it through the constructor, and the container refuses.',
        'Nothing is missing. The provider is registered in the payments module and is simply not visible from the receipts module.',
      ],
      code: [
        {
          caption: 'payments.service.ts and payments.module.ts',
          lines: [
            '@Injectable()',
            'export class PaymentsService {',
            "  private readonly paid = new Set<string>(['pay_1']);",
            '  isPaid(id: string) {',
            '    return this.paid.has(id);',
            '  }',
            '}',
            '',
            '@Module({ providers: [PaymentsService] })',
            'export class PaymentsModule {}',
          ],
        },
        {
          caption: 'what the container prints',
          lines: [
            "Nest can't resolve dependencies of the ReceiptsService (?).",
            'Please make sure that the argument PaymentsService at index [0]',
            'is available in the ReceiptsModule module.',
          ],
        },
      ],
      claims: [
        {text: 'A module encapsulates its providers by default; only exported providers of an imported module can be injected.', source: SRC.NEST},
        {text: 'The provider resolves on its own and is refused from another module until both doors are open.', source: SRC.RUN},
      ],
    },
    {
      id: 'doors',
      title: 'Open both doors',
      body: [
        'Importing a module gives you only what that module exports. So importing alone produces exactly the same refusal, and so does exporting alone. Both lines are needed.',
      ],
      code: [
        {
          caption: 'the owning module exports it',
          lines: [
            '@Module({',
            '  providers: [PaymentsService],',
            '  exports: [PaymentsService],',
            '})',
            'export class PaymentsModule {}',
          ],
        },
        {
          caption: 'the consumer imports that module',
          lines: [
            '@Module({',
            '  imports: [PaymentsModule],',
            '  providers: [ReceiptsService],',
            '})',
            'export class ReceiptsModule {}',
          ],
          note: 'Measured result: receipt for pay_1.',
        },
      ],
      claims: [
        {text: 'imports only, exports only, and neither all print the identical message.', source: SRC.RUN},
      ],
    },
    {
      id: 'errors',
      title: 'Two errors that look the same',
      body: [
        'When no name appears where the dependency should be, the parameter type was erased, usually because it was an interface: give it a token.',
        'When the class is named, Nest knows what you asked for, and the problem is visibility: check the doors. The message does not say which door is shut.',
      ],
      code: [
        {
          caption: 'no name: the type was erased',
          lines: ['...the argument at index [0] is available in the current module.'],
        },
        {
          caption: 'a name: check exports and imports',
          lines: ['...the argument PaymentsService at index [0] is available in the ReceiptsModule module.'],
        },
      ],
      claims: [
        {text: 'Both messages as printed by NestJS 12; the distinction holds in the cases measured, not as a universal decoder.', source: SRC.RUN},
      ],
    },
    {
      id: 'identity',
      title: 'The token is the identity',
      body: [
        'Two gateways built from one class, each by a factory reading the same configuration. A factory provider is the nearest thing Nest has to a bean method, and because each is registered under its own token, the consumer asks for each one by token. In Spring you would reach for a qualifier.',
      ],
      code: [
        {
          caption: 'two providers, one class',
          lines: [
            '{',
            '  provide: PRIMARY_GATEWAY,',
            '  useFactory: (cfg: { host: string; timeoutMs: number }) =>',
            '    new Gateway(`https://${cfg.host}/v2`, cfg.timeoutMs),',
            '  inject: [CONFIG],',
            '},',
            '{',
            '  provide: FALLBACK_GATEWAY,',
            '  useFactory: (cfg: { host: string; timeoutMs: number }) =>',
            '    new Gateway(`https://${cfg.host}/v1`, cfg.timeoutMs * 2),',
            '  inject: [CONFIG],',
            '},',
          ],
          note: 'Measured: primary v2 (2000ms), fallback v1 (4000ms).',
        },
      ],
      claims: [
        {text: 'A factory provider supplies an instance from a function, with dependencies listed in inject.', source: SRC.NEST},
      ],
    },
    {
      id: 'scope',
      title: 'Transient is not quite prototype',
      body: [
        'The default matches Spring: one instance for the application. Request scope creates one per request, and the documentation warns it slows responses and spreads to everything that depends on it.',
        'Transient sounds like prototype and mostly behaves like it. The difference: one consumer injecting it twice gets the same instance in Nest and two in Spring. Transient is one per consumer; prototype is one per injection point. And get() refuses a transient provider; use resolve().',
      ],
      code: [
        {
          caption: 'counted on both stacks',
          lines: [
            '                              Nest transient   Spring prototype',
            'two different consumers       1 and 2          1 and 2',
            'one consumer, injected twice  3 and 3          3 and 4',
          ],
        },
      ],
      claims: [
        {text: 'Transient providers are not shared across consumers; each consumer receives a new, dedicated instance.', source: SRC.NEST},
        {text: 'A request-scoped dependency makes its consumers request-scoped too.', source: SRC.NEST},
        {text: 'The Spring singleton is per container and per bean, not the Gang of Four singleton.', source: SRC.SPRING},
      ],
    },
  ],

  checklist: {
    title: 'Before you split a Nest app into modules',
    items: [
      'Export every provider another module needs, from the module that owns it',
      'Import the owning module into the consumer, not the provider class',
      'Read the injection error for a name before opening any file',
      'Give an interface parameter a token; there is no type left to match at runtime',
      'Register two instances of one class under two tokens, not two classes',
      'Reach for Global() only for genuinely cross-cutting modules such as configuration',
    ],
  },

  links: CHANNEL_LINKS,

  trademarks:
    'Node.js is a trademark of the OpenJS Foundation. Java is a trademark of ' +
    'Oracle. Spring and Spring Boot are trademarks of Broadcom. NestJS is the ' +
    'property of its owner. This is an independent, unofficial guide produced ' +
    'by Code with Sam, not affiliated with or endorsed by any of them, and no ' +
    'third party artwork is reproduced here.',

  closing: CLOSING,
};
