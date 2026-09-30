/**
 * Spring to Node design sheet, episode 8 in the course list: exception filters and errors.
 *
 * EVERY LINE HERE WAS RUN, on 2026-09-30, by `scripts/verify-errors.sh` in the course
 * repository. Node 22, NestJS 12, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-errors.sh in the course repository.';
const NODE = 'Node.js CLI documentation, --unhandled-rejections, checked 2026-09-30.';
const NEST = 'NestJS documentation, Exception filters, checked 2026-09-30.';
const RFC = 'RFC 9110, sections 15.5.3 and 15.5.10.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '500 or Process Exit?',
  subtitle: 'Spring Boot to NestJS, episode 8: exception filters and errors',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'Inside a request, an error becomes a response. A promise nobody owns never reaches a filter.',
  verifiedOn: '2026-09-30',

  intro: [
    'An exception thrown inside a request becomes a response on both Spring and NestJS. A rejected promise that nobody awaited or caught has already left the request, so no filter can see it.',
    'At the time of recording, on Node 22, that unhandled rejection ends the process by default. That is Node\'s default behaviour, not NestJS exception handling.',
    'Versions on this sheet were current on 30 September 2026: Node 22, NestJS 12, Spring Boot 4.1.1.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What each stack returns for a plain, a framework and a domain exception',
      'Translating a domain exception with a NestJS filter and a Spring advice',
      'Why a detached rejected promise exits the process, and the two honest fixes',
    ],
    outTitle: 'Not in scope',
    out: ['Process-level hooks: last-resort logging only, never the fix', 'What runs around every request: next episode, middleware and interceptors'],
    note: 'The Spring bodies shown are this app\'s default error body on Boot 4.1.1.',
  },

  scale: {
    title: 'The measurement',
    note: 'Both apps with no translation, then with a filter or an advice.',
    rows: [
      ['PLAIN ERROR', 'NestJS 500 generic / Spring 500 generic'],
      ['NOT FOUND', 'NestJS 404, message kept / Spring 404, message dropped'],
      ['DOMAIN, UNTRANSLATED', 'NestJS 500 / Spring 500, both generic'],
      ['DOMAIN, TRANSLATED', 'both 409 {"error":"insufficient_funds","shortfallInMinorUnits":250,"currency":"USD"}'],
      ['NO OWNER', 'the process EXITED, code 1 (Node v22.22.2)'],
      ['.catch()', '200, failure logged, next request 200'],
      ['AWAITED', '409 from the same filter, next request 200'],
    ],
  },

  sections: [
    {
      id: 'filter',
      title: 'The NestJS filter',
      body: ['The domain exception stays free of HTTP. The filter translates it at the edge: name the type, choose the status, choose the body. 409 because the request is well formed but the account\'s current state prevents it.'],
      code: [{caption: 'nestjs-api/src/ep07-errors/filtered.ts', lines: [
        '@Catch(InsufficientFunds)',
        'class InsufficientFundsFilter implements ExceptionFilter<InsufficientFunds> {',
        '  catch(exception: InsufficientFunds, host: ArgumentsHost) {',
        '    const res = host.switchToHttp().getResponse();',
        "    // 409: the account's current state prevents it. Not 402, still reserved.",
        '    res.status(HttpStatus.CONFLICT).json({',
        "      error: 'insufficient_funds',",
        '      shortfallInMinorUnits: exception.shortfall,',
        '      currency: exception.currency,',
        '    });',
        '  }',
        '}',
        '',
        'app.useGlobalFilters(new InsufficientFundsFilter());',
      ]}],
      claims: [
        {text: 'An unrecognised exception returns {"statusCode": 500, "message": "Internal server error"}', source: NEST},
        {text: '402 is reserved for future use; 409 is a conflict with the current state of the target resource', source: RFC},
      ],
    },
    {
      id: 'advice',
      title: 'The Spring equivalent',
      body: ['This one transfers almost exactly. The difference is where it lives: Spring finds the advice by component scanning; the NestJS filter is registered in the bootstrap.'],
      code: [{caption: 'Ep07Advice.java', lines: [
        '@RestControllerAdvice',
        'class Ep07Advice {',
        '',
        '    record Body(String error, long shortfallInMinorUnits, String currency) {}',
        '',
        '    @ExceptionHandler(Ep07ThrowController.InsufficientFunds.class)',
        '    ResponseEntity<Body> onInsufficientFunds(Ep07ThrowController.InsufficientFunds ex) {',
        '        return ResponseEntity.status(HttpStatus.CONFLICT)',
        '                .body(new Body("insufficient_funds", ex.shortfall(), "USD"));',
        '    }',
        '}',
      ]}],
      claims: [{text: 'Both answered 409 with the same body', source: RUN}],
    },
    {
      id: 'ownership',
      title: 'Give every promise an owner',
      body: ['Three versions of a route, one line different. With no owner the process exits. Deliberately detached work gets a catch with a real failure policy. Work that belongs to the request is awaited, so its rejection reaches the filter.'],
      code: [{caption: 'The three routes, each line annotated with its measured outcome', lines: [
        'writeAudit();                                   // exits the process',
        '',
        'void writeAudit().catch((err: Error) => {       // logged, process up',
        '  logger.error(`background audit write failed: ${err.message}`);',
        '});',
        '',
        'await debitAccount();                           // 409 from the filter',
      ]}],
      claims: [{text: 'Default unhandled rejection mode is throw; changed from a warning in Node 15.0.0', source: NODE}],
    },
  ],

  scaleNote: 'Node 22, NestJS 12, Spring Boot 4.1.1, on 30 September 2026.',

  checklist: {
    title: 'Before you ship a NestJS endpoint',
    items: [
      'Keep domain exceptions free of HTTP',
      'Translate each one a client can act on with a filter',
      'Choose a status with a meaning: 409 for a state conflict, not 402',
      'Await work that belongs to the request',
      'Give deliberately detached work a catch that does something',
      'Never treat a process hook as the fix',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-errors.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: Exception filters', url: 'https://docs.nestjs.com/exception-filters'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with ' +
    'Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
