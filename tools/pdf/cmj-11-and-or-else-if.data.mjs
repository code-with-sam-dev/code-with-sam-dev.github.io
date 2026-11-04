/**
 * Complete Modern Java design sheet, episode 11: and, or, not and else if, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep11 and
 * typescript/ep11.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '$120 basket. No gift?',
  subtitle: 'Complete Modern Java, episode 11: and, or, not and else if, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Combine conditions with && || !, and choose one of several outcomes with else if. The first true condition decides.',
  verifiedOn: '2026-10-24',
  intro: [
    'Gift from $100. Free delivery from $50, members only. Everyone else $4.99.',
    'Two things at once, and one of three outcomes.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['&& and || and !', 'else if chains', 'Why branch order matters', 'Short circuit', 'Brackets with && and ||'],
    outTitle: 'Coming next',
    out: ['Loops (episode 12)', 'Methods (episode 13)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['5240 >= 5000 && member', 'true'],
      ['5240 >= 10000 || member', 'true'],
      ['!member  (true)', 'false'],
      ['tiers: 5240 member / not member', 'Free delivery / Delivery: $4.99'],
      ['tiers: 12000', 'Free gift'],
      ['wrong order: 12000 and a member', 'Free delivery (gift skipped)'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'else if',
      body: [
        'Java checks the conditions in order. The first true one decides; the rest are not checked.',
        'Put the most specific rule first. && stops at the first false, so a guard on its left protects the right side.',
      ],
      code: [{caption: 'Tiers.java', lines: [
        'if (totalCents >= 10000) {',
        '    IO.println("Free gift");',
        '} else if (totalCents >= 5000 && member) {',
        '    IO.println("Free delivery");',
        '} else {',
        '    IO.println("Delivery: $4.99");',
        '}',
      ]}],
      claims: [{text: 'Printed Free delivery, Delivery: $4.99 and Free gift for the three cases.', source: RUN}],
    },
    {
      id: 'guard',
      title: 'A guard with &&',
      body: ['items is 0, so items > 0 is false and the division is never evaluated: no ArithmeticException.'],
      code: [{caption: 'Average.java', lines: [
        'if (items > 0 && totalCents / items > 1000) {',
        '    IO.println("Average above $10");',
        '} else {',
        '    IO.println("No qualifying average");',
        '}',
      ]}],
      claims: [{text: 'Printed No qualifying average, with no error.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Write rules that combine',
    items: [
      'Write the rules in words, one outcome per customer.',
      '&& for both, || for either, ! to flip.',
      'Most specific rule first in an else if chain.',
      'Guard a risky right side with && on the left.',
      'Mixing && and ||? Add brackets.',
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
