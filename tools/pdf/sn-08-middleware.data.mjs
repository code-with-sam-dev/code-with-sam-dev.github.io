/**
 * Spring to Node design sheet, episode 9 in the course list: middleware and interceptors.
 *
 * EVERY LINE HERE WAS RUN, on 2026-09-30, by `scripts/verify-middleware.sh` in the course
 * repository. Node 22, NestJS 12, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-middleware.sh in the course repository.';
const SPRING = 'Spring Framework reference, Interception, checked 2026-09-30.';
const NEST = 'NestJS documentation, Request lifecycle and Interceptors, checked 2026-09-30.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Filter ≠ Middleware',
  subtitle: 'Spring Boot to NestJS, episode 9: middleware and interceptors',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'chain.doFilter hands the error back. next() does not. The interceptor wraps the handler.',
  verifiedOn: '2026-09-30',

  intro: [
    'A Spring filter catches downstream errors because the exception travels back up through chain.doFilter. NestJS middleware does not get the controller exception back through next().',
    'Measured: the handler runs inside next() and throws, next() returns normally, and the 500 is written afterwards. The interceptor is the hook that wraps the handler, so it sees both the result and the error.',
    'Versions on this sheet were current on 30 September 2026: Node 22, NestJS 12, Spring Boot 4.1.1.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why a try/catch around next() catches nothing, measured',
      'Where each NestJS hook runs on one request',
      'Reshaping every response with one interceptor',
      'Why HandlerInterceptor is the wrong Spring match, and ResponseBodyAdvice the right one',
    ],
    outTitle: 'Not in scope',
    out: ['Guards and authorization: a later episode', 'Express error-handling middleware: for controller failures, stay with Nest filters and interceptors'],
    note: 'No single Spring class maps to a Nest interceptor. Map capabilities, not names.',
  },

  scale: {
    title: 'The measurement',
    note: 'The same handler throwing on both stacks, then reshaping a response.',
    rows: [
      ['SPRING FILTER', 'filter CAUGHT ServletException (wrapping IllegalStateException)'],
      ['NEST MIDDLEWARE', 'caught nothing; saw status 500 when the response finished'],
      ['NEST INTERCEPTOR', 'CAUGHT the database refused the write'],
      ['next() AROUND A THROW', 'handler threw inside next(); next() returned; headersSent=false'],
      ['ONE map()', '[...] becomes {"data":[...],"meta":{"path":"GET /payments","tookMs":0}}'],
      ['postHandle', 'ran after ResponseBodyAdvice; handed ModelAndView=null; skipped on the throw'],
    ],
  },

  sections: [
    {
      id: 'interceptor',
      title: 'The interceptor that sees the error',
      body: ['An interceptor receives the handler result as a stream from next.handle(), so both the return value and the thrown error flow through it.'],
      code: [{caption: 'nestjs-api/src/ep08-middleware/exception-visibility.ts', lines: [
        'class CatchingInterceptor implements NestInterceptor {',
        '  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {',
        '    return next.handle().pipe(',
        '      catchError((e) => {',
        '        seen.push(`interceptor CAUGHT ${(e as Error).message}`);',
        '        return throwError(() => e);',
        '      }),',
        '    );',
        '  }',
        '}',
      ]}],
      claims: [{text: 'Interceptors can transform the result returned from a function and the exception thrown from it', source: NEST}],
    },
    {
      id: 'envelope',
      title: 'One map(), every response',
      body: ['The handler does not change. Every response that goes through this interceptor gets the same envelope.'],
      code: [{caption: 'nestjs-api/src/ep08-middleware/transform.ts', lines: [
        'return next.handle().pipe(',
        '  map((data) => ({',
        '    data,',
        '    meta: {',
        '      path: `${method} ${url}`,',
        '      tookMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6),',
        '    },',
        '  })),',
        ');',
      ]}],
      claims: [{text: 'handler returns [{"id":"pay_1","amountInMinorUnits":4500}]; client receives {"data":[...],"meta":{...}}', source: RUN}],
    },
    {
      id: 'advice',
      title: 'The Spring answer: ResponseBodyAdvice',
      body: ['HandlerInterceptor.postHandle is the name match and the wrong job for a REST body: the advice ran first, and postHandle got no model. In this app a header set in postHandle still reached the client because the small response was buffered; Spring documents postHandle as too late for @ResponseBody, so do not rely on it.'],
      code: [{caption: 'Ep08BodyRewriteTest.java', lines: [
        '@RestControllerAdvice',
        'static class EnvelopeAdvice implements ResponseBodyAdvice<Object> {',
        '    @Override',
        '    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType contentType,',
        '                                  Class<? extends HttpMessageConverter<?>> converterType,',
        '                                  ServerHttpRequest request, ServerHttpResponse response) {',
        '        var envelope = new LinkedHashMap<String, Object>();',
        '        envelope.put("data", body);',
        '        envelope.put("meta", Map.of("path", "GET " + request.getURI().getPath()));',
        '        return envelope;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'For @ResponseBody and ResponseEntity methods the response is written within the HandlerAdapter before postHandle; use ResponseBodyAdvice', source: SPRING}],
    },
  ],

  scaleNote: 'Node 22, NestJS 12, Spring Boot 4.1.1 (AOP starter: spring-boot-starter-aspectj), on 30 September 2026.',

  checklist: {
    title: 'Which hook',
    items: [
      'The raw request, before anything else: middleware',
      'Who may call this route: a guard',
      'Check or convert an argument: a pipe',
      'See or reshape the result or the error: an interceptor',
      'Turn an exception into a response: an exception filter',
      'Never catch downstream errors in middleware',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-middleware.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: Interceptors', url: 'https://docs.nestjs.com/interceptors'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with ' +
    'Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
