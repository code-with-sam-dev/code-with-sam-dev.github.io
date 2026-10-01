/**
 * Spring to Node design sheet, episode 34 in the course list: RxJS for Spring developers.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-rxjs.sh` in the course repository,
 * both servers real processes. RxJS 7.8.2, Nest 12.0.3 on Express, reactor-core 3.8.7 in
 * Spring Boot 4.1.1 WebFlux.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-rxjs.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Customer left. Card charged.',
  subtitle: 'Spring Boot to NestJS, episode 34: RxJS for Spring developers',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'RxJS and Reactor share operators, not runtime contracts.',
  verifiedOn: '2026-10-01',

  intro: [
    'A client left half a second into a two second charge. WebFlux cancelled and charged nothing; our Nest on Express route charged.',
    'A handler returning 1, 2, 3: WebFlux answered [1,2,3], Nest answered 3.',
    'A thousand tasks with no concurrency argument: Reactor\'s flatMap ran about 256 at once, RxJS mergeMap all 1000.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['Mono and Flux to Observable', 'flatMap and mergeMap', 'Returning a stream from a handler', 'Cancellation on disconnect'],
    outTitle: 'Not in scope',
    out: ['Schedulers', 'Backpressure strategies'],
    note: 'Measured on Nest with Express, the default HTTP adapter.',
  },

  scale: {
    title: 'The measurements',
    note: 'Both servers real processes.',
    rows: [
      ['HANDLER RETURNS 1, 2, 3', 'WebFlux [1,2,3]; Nest 3'],
      ['flatMap, NO ARGUMENT', 'about 256 in flight'],
      ['mergeMap, NO ARGUMENT', '1000 in flight'],
      ['mergeMap(work, 256)', '256 in flight'],
      ['CLIENT LEAVES AT 500 ms', 'WebFlux 0 charged; Nest 1'],
      ['NEST WITH takeUntil', '0 charged'],
    ],
  },

  sections: [
    {
      id: 'cancel',
      title: 'Wire the disconnect into the Observable',
      body: ['Our Nest on Express route did not cancel the returned Observable when the client left. Stop it when the response closes unfinished, and keep the side effect idempotent.'],
      code: [{caption: 'payments.controller.ts', lines: [
        "@Get('charge')",
        'charge(@Res({ passthrough: true }) res: Response): Observable<string> {',
        "  const clientLeft = fromEvent(res, 'close').pipe(filter(() => !res.writableFinished));",
        '  return this.payments.charge().pipe(takeUntil(clientLeft));',
        '}',
      ]}],
      claims: [{text: 'with takeUntil: charged afterwards 0', source: RUN}],
    },
    {
      id: 'concurrency',
      title: 'Give mergeMap a limit',
      body: ['Reactor\'s flatMap defaults to about 256 inner subscriptions; RxJS mergeMap has none. Pass the second argument.'],
      code: [{caption: 'fan-out.ts', lines: ['from(ids).pipe(mergeMap((id) => this.http.get(url(id)), 8));']}],
      claims: [{text: 'mergeMap with 256: peak in flight 256', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: RxJS 7.8, Nest 12 on Express, Reactor 3.8 in Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust an Observable in Nest',
    items: [
      'Does the handler need every value, or the last one?',
      'Does every mergeMap that calls out have a concurrency limit?',
      'What happens to the work when the client disconnects?',
      'Is the side effect idempotent?',
      'Is the Observable cold, and does anything subscribe twice?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-rxjs.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'RxJS operators', url: 'https://rxjs.dev/guide/operators'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
