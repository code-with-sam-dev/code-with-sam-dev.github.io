/**
 * Spring to Node design sheet, episode 40 in the course list: multi tenancy and feature flags.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-tenancy.sh` in the course repository,
 * with real processes. Spring Boot 4.1.1, Nest 12.0.3, OpenFeature 1.23 with the flagd provider.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-tenancy.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Tenant A saw tenant B.',
  subtitle: 'Spring Boot to NestJS, episode 40: multi tenancy and feature flags',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Request context must be scoped to the request, and rollout decisions must agree across stacks.',
  verifiedOn: '2026-10-01',

  intro: [
    'On Spring, a filter that never cleared its ThreadLocal leaked tenant acme into the next request on the same thread.',
    'On Nest, the same habit as a module-level variable let two requests in flight overwrite each other. AsyncLocalStorage kept them apart.',
    'A 20% rollout ported mechanically gave 791 of 1000 users a different answer on the two stacks. OpenFeature with one flags file gave none.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['ThreadLocal and AsyncLocalStorage', 'Request scope and its cost', 'Percentage rollouts across stacks', 'OpenFeature with flagd'],
    outTitle: 'Not in scope',
    out: ['Database-per-tenant routing', 'Flag management UIs'],
    note: 'flagd evaluates fractional rollouts with the same hashing in every SDK.',
  },

  scale: {
    title: 'The measurements',
    note: 'Real processes; flagd in-process from one flags.json.',
    rows: [
      ['SPRING, ThreadLocal NOT CLEARED', 'the next request saw acme'],
      ['NEST, MODULE VARIABLE', 'acme read globex'],
      ['NEST, AsyncLocalStorage', 'each saw its own'],
      ['SINGLETON + REQUEST-SCOPED DEP', '100 instances / 100 requests'],
      ['ROLLOUT PORTED MECHANICALLY', '791 of 1000 differ'],
      ['OPENFEATURE + FLAGD, BOTH', '0 differ'],
    ],
  },

  sections: [
    {
      id: 'context',
      title: 'Scope the tenant to the request',
      body: ['On Spring, clear the ThreadLocal in finally. On Nest, run each request in its own AsyncLocalStorage store.'],
      code: [{caption: 'TenantFilter.java', lines: [
        'TenantContext.set(request.getHeader("X-Tenant"));',
        'try {',
        '  chain.doFilter(request, response);',
        '} finally {',
        '  TenantContext.clear();',
        '}',
      ]}, {caption: 'tenant.middleware.ts', lines: [
        'export const tenantStore = new AsyncLocalStorage<string | undefined>();',
        'export function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {',
        "  tenantStore.run(req.header('x-tenant'), next);",
        '}',
      ]}],
      claims: [{text: 'module variable: acme read globex; AsyncLocalStorage: each its own', source: RUN}],
    },
    {
      id: 'flags',
      title: 'Share the evaluation contract',
      body: ['Evaluate the rollout with the same engine and the same file on both stacks.'],
      code: [{caption: 'flags.json', lines: [
        '"new-checkout": {',
        '  "state": "ENABLED",',
        '  "variants": { "on": true, "off": false },',
        '  "defaultVariant": "off",',
        '  "targeting": { "fractional": [["on", 20], ["off", 80]] }',
        '}',
      ]}],
      claims: [{text: 'OpenFeature + flagd on both: Spring 202, Nest 202, 0 differ', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Spring Boot 4.1, Nest 12, OpenFeature 1.23 with flagd.',

  checklist: {
    title: 'Before two stacks serve the same tenants',
    items: [
      'Is the current tenant cleared at the end of every request?',
      'Is anything request-specific stored in a module variable?',
      'Which providers did request scope promote?',
      'Do both stacks put the same user in the same rollout cohort?',
      'Is there one source of truth for every flag?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-tenancy.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'OpenFeature', url: 'https://openfeature.dev'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. OpenFeature is a Cloud Native Computing Foundation project. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
