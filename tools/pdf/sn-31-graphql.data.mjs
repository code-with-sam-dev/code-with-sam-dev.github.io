/**
 * Spring to Node design sheet, episode 32 in the course list: GraphQL with NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-graphql.sh` in the course
 * repository, against one Postgres with every server a real process. @nestjs/graphql 14.0.3,
 * @nestjs/apollo 14.0.3, @apollo/server 5.5.1, graphql 16.14.2, dataloader 2.2.3, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-graphql.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Production mode. Still exposed.',
  subtitle: 'Spring Boot to NestJS, episode 32: GraphQL',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Your GraphQL error contract depends on more than your resolver. Production mode hid the stack, not the database error.',
  verifiedOn: '2026-10-01',

  intro: [
    'A resolver whose SQL fails: Spring for GraphQL masked it as an internal error with an id for the logs.',
    'NestJS with Apollo returned the raw Postgres message and a stack trace. With NODE_ENV=production the stack went and the message stayed.',
    'A formatError that masks anything GraphQL itself did not raise made it "Internal server error".',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['Schema first and code first', 'N plus one and DataLoader', 'Unexpected errors', 'Status codes and introspection'],
    outTitle: 'Not in scope',
    out: ['Everything in the Spring GraphQL flagship', 'Federation'],
    note: 'At the time of recording Nest uses Apollo Server 5 through @nestjs/apollo.',
  },

  scale: {
    title: 'The measurements',
    note: '20 orders, 10 customers, one Postgres.',
    rows: [
      ['N PLUS ONE, BOTH STACKS', '21 statements'],
      ['@BatchMapping / DataLoader PER REQUEST', '2 statements'],
      ['SQL ERROR, SPRING', 'INTERNAL_ERROR with an id'],
      ['SQL ERROR, NEST, NODE_ENV UNSET', 'Postgres message + 7 line stack'],
      ['SQL ERROR, NEST, PRODUCTION', 'Postgres message, no stack'],
      ['SQL ERROR, NEST, formatError MASK', 'Internal server error'],
      ['UNKNOWN FIELD, ACCEPT JSON', 'Spring 200, Apollo 400'],
    ],
  },

  sections: [
    {
      id: 'mask',
      title: 'Make the error policy explicit',
      body: ['Mask any error GraphQL itself did not raise, log the original on the server, and send the client a generic message.'],
      code: [{caption: 'app.module.ts', lines: [
        'GraphQLModule.forRoot<ApolloDriverConfig>({',
        '  driver: ApolloDriver,',
        '  autoSchemaFile: true,',
        '  formatError: (formatted, error) => {',
        '    const original = error instanceof GraphQLError ? error.originalError : undefined;',
        '    if (!original || original instanceof GraphQLError) return formatted;',
        '    logger.error(original);',
        "    return { message: 'Internal server error', path: formatted.path,",
        "      extensions: { code: 'INTERNAL_SERVER_ERROR' } };",
        '  },',
        '}),',
      ]}],
      claims: [{text: 'with the mask, NODE_ENV=production: "Internal server error", no stack trace', source: RUN}],
    },
    {
      id: 'loader',
      title: 'A DataLoader per request',
      body: ['Nest has no @BatchMapping. Create the loader in the GraphQL context so each request batches its own lookups.'],
      code: [{caption: 'orders.resolver.ts', lines: [
        '@ResolveField(() => Customer)',
        'customer(@Parent() order: Order, @Context() ctx: { loaders: Loaders }) {',
        '  return ctx.loaders.customers.load(order.customerId);',
        '}',
      ]}],
      claims: [{text: '20 orders with their customer: 21 statements, then 2 with the loader', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: @nestjs/graphql 14, Apollo Server 5, graphql 16, Spring Boot 4.1.',

  checklist: {
    title: 'Before you move a GraphQL API to Nest',
    items: [
      'What does the client see when a resolver throws something unexpected?',
      'Is the error policy written down, or left to NODE_ENV?',
      'Does every field that fans out use a per-request loader?',
      'Do monitors and clients depend on the HTTP status of a GraphQL error?',
      'Is introspection on or off on purpose?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The Spring GraphQL deep dive', url: 'https://youtu.be/7VgEcSodl6Q'},
    {label: 'Every measurement, one command: scripts/verify-graphql.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS GraphQL', url: 'https://docs.nestjs.com/graphql/quick-start'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. GraphQL is a trademark of the GraphQL Foundation. Apollo is a trademark of Apollo Graph Inc. ' +
    'This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
