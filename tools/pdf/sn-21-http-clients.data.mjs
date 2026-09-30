/**
 * Spring to Node design sheet, episode 22 in the course list: calling other APIs from NestJS.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-http.sh` in the course repository,
 * against a real downstream server. @nestjs/axios 12.0.1, @nestjs/http-client 0.0.1, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-http.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One line. Four traps.',
  subtitle: 'Spring Boot to NestJS, episode 22: calling other APIs',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'A one-line HTTP call hides four decisions: when it gives up, whether it ran, what counts as failure, and whether it tries again.',
  verifiedOn: '2026-09-30',

  intro: [
    'Against an API that answers after ten seconds, RestClient, @nestjs/axios and the new @nestjs/http-client all waited the full ten seconds by default.',
    'With a one second timeout the new client gave up after 3.2 seconds with three hits: the timeout is per attempt and retries are on by default.',
    'The downstream saw the caller hang up at one second and still finished its work. A timeout bounds your wait, not theirs.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['RestClient and WebClient', '@nestjs/axios HttpService', '@nestjs/http-client HttpClient', 'Timeouts, laziness, errors, retries'],
    outTitle: 'Not in scope',
    out: ['Circuit breakers (next episode)', 'Streaming large bodies'],
    note: 'At the time of recording the Nest docs describe @nestjs/http-client 0.0.1; @nestjs/axios remains available.',
  },

  scale: {
    title: 'The measurements',
    note: 'One downstream server, counting hits per path.',
    rows: [
      ['DEFAULT, API TAKES 10 s', 'all three waited 10.0 s'],
      ['1 s TIMEOUT', 'RestClient 1.2 s; axios 1.0 s; http-client 3.2 s, 3 hits'],
      ['NEVER SUBSCRIBED / AWAITED', 'WebClient 0, HttpService 0; RestClient 1, HttpClient 1'],
      ['GET A 500', 'error on all three; fetch resolves ok false'],
      ['FAILS ONCE, THEN 200', 'RestClient, axios: fail; http-client: 200 after 2 hits'],
      ['PUT / POST A 500, http-client', 'PUT 3 hits, POST 1'],
    ],
  },

  sections: [
    {
      id: 'timeouts',
      title: 'Set the timeout on every client',
      body: ['Spring: spring.http.clients.read-timeout. @nestjs/axios: HttpModule.register({ timeout }). @nestjs/http-client: HttpClientModule.register({ timeout }), applied per attempt.'],
      code: [
        {caption: 'application.properties', lines: ['spring.http.clients.read-timeout=1s']},
        {caption: 'app.module.ts', lines: ["HttpModule.register({ timeout: 1000 }),", "HttpClientModule.register({ timeout: '1s' }),"]},
      ],
      claims: [{text: 'http-client, timeout 1s, API takes 10 s: HttpTimeoutError after 3.2 s, three hits', source: RUN}],
    },
    {
      id: 'lazy',
      title: 'Whether it ran',
      body: ['HttpService returns an Observable: nothing is sent until you subscribe, for example with firstValueFrom. The new HttpClient returns a promise and sends immediately.'],
      code: [{caption: 'payments.client.ts', lines: [
        "const res = await firstValueFrom(this.http.get(`${base}/payments/${id}`));",
        "const { data } = await this.client.get(`/payments/${id}`);",
      ]}],
      claims: [{text: 'HttpService.get() without firstValueFrom: zero requests received', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: @nestjs/axios 12, @nestjs/http-client 0.0.1, Spring Boot 4.1.',

  checklist: {
    title: 'Before you trust an HTTP call',
    items: [
      'Is there a timeout, and is it per call or per attempt?',
      'A timeout does not cancel the other side\'s work',
      'Is the call lazy? Is anything subscribing?',
      'What does a 500 do: throw, or resolve?',
      'Does the client retry by default, and which methods?',
      'Only retry what the endpoint makes idempotent',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-http.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS HTTP client', url: 'https://docs.nestjs.com/techniques/http-module'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
