/**
 * Spring to Node design sheet, episode 20 in the course list: NestJS authentication and guards.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-guards.sh` in the course
 * repository. NestJS 12.0.3, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-guards.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'New route. Wide open.',
  subtitle: 'Spring Boot to NestJS, episode 20: authentication and guards',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Spring Boot secures every route by default. A Nest guard secures what you bind it to. Bind authentication globally and mark the exceptions public.',
  verifiedOn: '2026-09-30',

  intro: [
    'A refunds route added beside a guarded payments controller, with no security code of its own: Spring Boot answered 401, NestJS answered 200.',
    'APP_GUARD with a @Public() marker made every route private by default: 401, 401, and a public health check 200.',
    '@PreAuthorize did nothing until @EnableMethodSecurity. A Nest role guard stops at the route: the service called directly still ran.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['SecurityFilterChain against guards', 'APP_GUARD and a @Public() marker', '401 against 403', '@PreAuthorize against @Roles with a RolesGuard'],
    outTitle: 'Not in scope',
    out: ['JWT and Passport strategies', 'Sessions and OAuth'],
    note: 'The probe tokens and role headers are stand-ins; the scoping is the point.',
  },

  scale: {
    title: 'The measurements',
    note: 'Anonymous unless stated.',
    rows: [
      ['SPRING, STARTER ONLY: /payments, /refunds', '401, 401'],
      ['NEST, @UseGuards ON PAYMENTS: /payments, /refunds', '403, 200'],
      ['NEST, APP_GUARD + @Public(): /payments, /refunds, /health', '401, 401, 200'],
      ['NEST, WRONG TOKEN / SPRING, WRONG PASSWORD', '403 / 401'],
      ['SPRING @PreAuthorize, NO @EnableMethodSecurity', 'user 200; direct call ran'],
      ['SPRING @PreAuthorize, WITH @EnableMethodSecurity', 'user 403; direct call refused'],
      ['NEST @Roles + RolesGuard', 'user 403, admin 200; direct call ran'],
    ],
  },

  sections: [
    {
      id: 'global',
      title: 'Make authentication global',
      body: ['Register the guard as APP_GUARD so it runs on every route, and let open routes say so with metadata the guard reads through the Reflector. Throw UnauthorizedException for missing credentials; returning false gives 403.'],
      code: [
        {caption: 'global.spec.ts, the guard', lines: [
          'canActivate(context: ExecutionContext): boolean {',
          '  const open = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);',
          '  if (open) return true;',
          '  const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();',
          '  if (!req.headers.authorization) throw new UnauthorizedException();',
          "  return req.headers.authorization === 'Bearer valid';",
          '}',
        ]},
        {caption: 'global.spec.ts, registration and the marker', lines: [
          "const IS_PUBLIC = 'isPublic';",
          'const Public = () => SetMetadata(IS_PUBLIC, true);',
          'providers: [{ provide: APP_GUARD, useClass: GlobalTokenGuard }],',
        ]},
      ],
      claims: [{text: 'APP_GUARD: /payments 401, /refunds 401, /health (public) 200', source: RUN}],
    },
    {
      id: 'methods',
      title: 'Method authorization',
      body: ['Spring Boot\'s security starter does not switch method security on. A Nest guard runs for a route, so a service called from elsewhere is not checked.'],
      code: [
        {caption: 'RefundService.java', lines: ['@PreAuthorize("hasRole(\'ADMIN\')")', 'public String approve() {', '    return "approved";', '}']},
        {caption: 'MethodSecurityConfig.java', lines: ['@Configuration', '@EnableMethodSecurity', 'class MethodSecurityConfig {', '}']},
      ],
      claims: [{text: 'without @EnableMethodSecurity a USER got 200; with it, 403 and a direct call threw AuthenticationCredentialsNotFoundException', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: NestJS 12, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust a NestJS API\'s security',
    items: [
      'Is authentication registered globally, or bound per controller?',
      'Is every open route marked public on purpose?',
      'Missing credentials: 401. Known but not allowed: 403.',
      'In Spring, is @EnableMethodSecurity on where @PreAuthorize is used?',
      'Does anything call a protected service without going through a route?',
      'Add a test that a brand new route is refused',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-guards.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS guards', url: 'https://docs.nestjs.com/guards'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
