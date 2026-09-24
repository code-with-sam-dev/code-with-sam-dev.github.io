/**
 * Spring Boot to .NET, the flagship design sheet: the DI validation trap.
 *
 * THE SNIPPETS ARE COPIED OUT OF github.com/code-with-sam-dev/spring-to-dotnet,
 * and every result came off scripts/verify.sh on 2026-09-24 (ALL CLAIMS HOLD).
 *
 * TWO WORDING RULES FROM THE CONSULT, held here as in the video: the captive
 * comparison is ASP.NET Core scoped against Spring REQUEST scope, and says
 * Spring can capture shorter lived beans elsewhere; the validation flags move
 * detection and are never the fix.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run on a real machine, 2026-09-24. Reproduce it with scripts/verify.sh in the course repository.',
  HOST: 'ASP.NET Core generic host documentation, checked 2026-09-24',
  DI: '.NET dependency injection documentation, checked 2026-09-24',
  EF: 'EF Core documentation, saving data, checked 2026-09-24',
};

const PERISHABLE =
  'Every version on this sheet was current on 24 September 2026 and will not ' +
  'stay current. The method is the durable part: run the script, read what ' +
  'came back, and write down the result rather than the expectation.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'The DI Validation Trap',
  subtitle: 'Spring Boot to .NET, the flagship',
  kicker: 'For Spring developers moving to .NET',
  strapline: 'It failed in Development and started in Production. Nothing changed but the environment.',
  verifiedOn: '2026-09-24',

  intro: [
    'One payment service written twice, in Spring Boot and in ASP.NET Core on .NET 10 LTS. Controllers, constructor injection and services read almost line for line. Four small mistakes do not behave the same way.',
    'Everything here uses ASP.NET Core\'s built-in dependency injection container with the normal host defaults.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'A service nobody registered, in Development and in Production',
      'A scoped service inside a singleton',
      'The two validation flags, and what they do not reject',
      'Two implementations of one interface',
      'EF Core: tracking is not saving',
    ],
    outTitle: 'Out of scope',
    out: [
      'Performance. Nothing here measures throughput or startup',
      'Third party containers, which have their own rules',
      'Anything about how this channel is produced, which is not the subject',
    ],
    note: 'Spring\'s startup failures below are measured on this application. A lazy bean or a programmatic lookup can move when Spring finds a problem too.',
  },

  scale: {
    title: 'The move, in one table',
    note: 'Validation catches the first two rows at startup. It does not fix either, and it does not reject the third, which is valid .NET.',
    rows: [
      ['A service nobody registered', 'Development refuses; Production starts, first request 500'],
      ['A scoped service in a singleton', 'Development refuses; Production keeps the captured instance'],
      ['Two implementations, one dependency', 'Starts; single resolves the LAST, the list has both'],
      ['Change a tracked entity, commit, no save', 'Not written until SaveChanges'],
    ],
  },

  sections: [
    {
      id: 'environment',
      title: 'Failed in Development. Started in Production.',
      body: [
        'Checkout needs a payment gateway and none is registered. In Development the app refuses to start. Switch the same build to Production and it starts; the first request to checkout returns 500.',
        'The default host enables scope validation and dependency validation only when the environment is Development.',
      ],
      code: [
        {
          caption: 'Production, the same build',
          lines: [
            '$ ASPNETCORE_ENVIRONMENT=Production dotnet DotnetPayments.dll',
            'info: Microsoft.Hosting.Lifetime[0]',
            '  Application started. Press Ctrl+C to shut down.',
            "$ curl -s -o /dev/null -w '%{http_code}' -X POST 'localhost:8194/checkout?amount=2500'",
            '500',
          ],
        },
      ],
      claims: [
        {text: 'Development refused to start with "Unable to resolve service for type IPaymentGateway"; Production started and returned 500.', source: SRC.RUN},
        {text: '"Enables scope validation and dependency validation when the environment is Development."', source: SRC.HOST},
      ],
    },
    {
      id: 'captive',
      title: 'Same ID, every request',
      body: [
        'AuditLog is registered as a singleton and depends on RequestContext, which is scoped. Built once, the singleton captures the scoped context it was given, so later requests keep seeing that captured instance.',
        'Spring\'s request scope annotation uses a scoped proxy by default, so a singleton holding it finds the current request on every call. Spring can capture shorter lived beans in other setups; this compares ASP.NET Core scoped with Spring request scope.',
      ],
      code: [
        {
          caption: 'mistakes/captive: Registrations.cs',
          lines: [
            'services.AddScoped<RequestContext>();',
            'services.AddSingleton<AuditLog>();',
          ],
        },
        {
          caption: 'Production, two requests',
          lines: [
            'audit log sees a5e8233b-c621-4bc2-8423-a562a8f3e995,',
            '  this request is 503119e1-d2f1-46f5-9097-fd3700ac22f1',
            'audit log sees a5e8233b-c621-4bc2-8423-a562a8f3e995,',
            '  this request is 012755b8-1fbd-4683-b470-1fe8307cced7',
          ],
          note: 'The fix is correcting the lifetime relationship. Development refuses this at startup: "Cannot consume scoped service RequestContext from singleton AuditLog".',
        },
      ],
      claims: [
        {text: 'Production: two requests, one audit id, two request ids. Spring: each request sees its own id.', source: SRC.RUN},
      ],
    },
    {
      id: 'validate',
      title: 'Validation fixes detection, not the graph',
      body: [
        'Switch both checks on everywhere and Production refuses to start for both mistakes, like Development. That moves when you find out. Registering the gateway, and correcting the lifetime relationship, are the fixes.',
      ],
      code: [
        {
          caption: 'mistakes/validate-always: Program.cs',
          lines: [
            'builder.Host.UseDefaultServiceProvider(options =>',
            '{',
            '    options.ValidateScopes = true;',
            '    options.ValidateOnBuild = true;',
            '});',
          ],
        },
      ],
      claims: [
        {text: 'With both flags on, Production refused to start for the missing gateway and for the captive context.', source: SRC.RUN},
      ],
    },
    {
      id: 'two',
      title: 'Stripe, then PayPal',
      body: [
        'Register two gateways and inject one: you get the last one registered. Ask for the list and you get both. It still starts with both validation flags on, because two registrations are valid in the built-in container.',
        'In the Spring app, the equivalent single bean injection refuses to start because two candidates match. You choose with Primary or a Qualifier.',
      ],
      code: [
        {
          caption: 'Production, validation on',
          lines: [
            '$ curl -s localhost:8216/gateways',
            'one: PaypalGateway, all: StripeGateway, PaypalGateway',
          ],
        },
      ],
      claims: [
        {text: '"The single IMessageWriter is the last implementation to be registered, whereas the IEnumerable<IMessageWriter> represents all registered implementations."', source: SRC.DI},
        {text: 'Spring: "required a single bean, but 2 were found".', source: SRC.RUN},
      ],
    },
    {
      id: 'data',
      title: 'Tracking is not saving',
      body: [
        'In Spring, inside a transaction, you can change a loaded entity and never call save: JPA and Hibernate write it at commit. Translate that line for line to EF Core and commit without SaveChanges, and the database still has the old amount. EF Core can track and detect the change; it only reaches the database through SaveChanges.',
      ],
      code: [
        {
          caption: 'dotnet-payments: PaymentService.cs',
          lines: [
            '// The Spring method, line for line. Tracked, never saved.',
            'public async Task ChangeAmountLikeSpring(long id, long amount)',
            '{',
            '    await using var tx = await db.Database.BeginTransactionAsync();',
            '    var payment = await db.Payments.FindAsync(id);',
            '    payment!.Amount = amount;',
            '    await tx.CommitAsync();',
            '}',
            '',
            '// Tracking is not saving.',
            'public async Task ChangeAmount(long id, long amount)',
            '{',
            '    var payment = await db.Payments.FindAsync(id);',
            '    payment!.Amount = amount;',
            '    await db.SaveChangesAsync();',
            '}',
          ],
        },
      ],
      claims: [
        {text: 'Spring ChangeAmountTest: written with no save call. .NET TrackingIsNotSaving: unchanged until SaveChanges.', source: SRC.RUN},
      ],
    },
  ],

  scaleNote: 'Measured on Java 25, Spring Boot 4.1.1, .NET 10.0.12 LTS, EF Core with Npgsql 10.0.3 and PostgreSQL 17, on 24 September 2026.',

  checklist: {
    title: 'Before a .NET service goes anywhere near production',
    items: [
      'ValidateScopes and ValidateOnBuild are true in every environment, set explicitly',
      'Every scoped service is consumed only by scoped or transient services',
      'Where one interface has several registrations, registration order is deliberate and documented',
      'Every write path calls SaveChanges, and a test proves the row changed',
      'scripts/verify.sh passes on a fresh clone',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The course repository', url: 'https://github.com/code-with-sam-dev/spring-to-dotnet'},
    {label: 'ASP.NET Core generic host', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/generic-host'},
    {label: '.NET dependency injection', url: 'https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection'},
    {label: 'EF Core: basic save', url: 'https://learn.microsoft.com/en-us/ef/core/saving/basic'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Spring and Spring Boot are trademarks of ' +
    'Broadcom. PostgreSQL is a trademark of the PostgreSQL Community ' +
    'Association. .NET and ASP.NET Core are the property of their respective ' +
    'owner. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them, and no third party ' +
    'artwork is reproduced here.',
  closing: CLOSING,
};
