/**
 * Complete Modern Java design sheet, episode 9: number limits in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep09 and
 * typescript/ep09.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Negative money?',
  subtitle: 'Complete Modern Java, episode 9: number limits in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Every number type has a limit. Know it, pick a bigger type, or make overflow stop the program.',
  verifiedOn: '2026-10-24',
  intro: [
    'Two billion cents plus two billion cents printed -294967296: negative money, no error.',
    'An int has 32 bits and a fixed range. Past the top it wraps round: overflow.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['Why an int overflows', 'long, and the L suffix', 'Math.addExact', 'Dividing by zero', 'TypeScript safe integers'],
    outTitle: 'Coming next',
    out: ['Decisions: if and else (episode 10)', 'and, or, not, else if (episode 11)', 'Loops (episode 12)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['2_000_000_000 + itself (int)', '-294967296'],
      ['Integer.MAX_VALUE, then + 1', '2147483647, then -2147483648'],
      ['2_000_000_000L + itself (long)', '4000000000'],
      ['Math.addExact(MAX_VALUE, 1)', 'ArithmeticException: integer overflow'],
      ['7.0 / 0   and   0.0 / 0', 'Infinity   and   NaN'],
      ['10 / people  (people = 0)', 'ArithmeticException: / by zero'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'Overflow, and what to do about it',
      body: [
        'An int stores 32 bits: -2,147,483,648 to 2,147,483,647. Past the top it wraps to the most negative value.',
        'Use a long (L suffix) for bigger numbers, or Math.addExact to stop instead of returning a wrong number.',
      ],
      code: [{caption: 'Limits.java', lines: [
        'int cents = 2_000_000_000;',
        'IO.println(cents + cents);            // -294967296',
        'IO.println(Integer.MAX_VALUE + 1);    // -2147483648',
        'long bigCents = 2_000_000_000L;',
        'IO.println(bigCents + bigCents);      // 4000000000',
      ]}],
      claims: [{text: 'Printed exactly as commented.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['Numbers are doubles: no wrap at two billion, but past the largest safe integer whole numbers are not exact.'],
      code: [{caption: 'limits.ts', lines: [
        'console.log(2_000_000_000 + 2_000_000_000);   // 4000000000',
        'console.log(9007199254740992 + 1);            // 9007199254740992',
        'console.log(10 / 0);                          // Infinity',
        'console.log(0 / 0);                           // NaN',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed the lines above.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Before a number gets big',
    items: [
      'Know the range of the type you picked.',
      'Bigger than about 2.1 billion? Use a long, with L.',
      'A wrong answer worse than stopping? Math.addExact.',
      'Dividing? Think about zero first.',
      'Challenge: predict MAX_VALUE + 1, 2 billion L + itself, and 7.0 / 0.',
    ],
  },
  links: [
    ...CHANNEL_LINKS,
    {label: 'The code and the challenge files: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Node.js is a trademark of the OpenJS Foundation. TypeScript is a trademark of Microsoft. IntelliJ IDEA is a trademark of ' +
    'JetBrains. This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
