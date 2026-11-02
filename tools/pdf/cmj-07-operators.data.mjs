/**
 * Complete Modern Java design sheet, episode 7: expressions and operators in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep07 and
 * typescript/ep07.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Where did 50 cents go?',
  subtitle: 'Complete Modern Java, episode 7: expressions and operators in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Operators work on values, and the types of those values decide the result.',
  verifiedOn: '2026-10-24',
  intro: [
    'A $10 bill split between 4 people printed 2. Java lost nothing: two ints divided keep the whole part.',
    'One double in the division gives 2.5. Then operator order, and the left to right trap.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['What an expression is', '+ - * / and the remainder %', 'Integer division', 'Operator order, left to right'],
    outTitle: 'Coming next',
    out: ['Numbers and precision (episode 8)', 'Division by zero (episode 8)', '+= and ++ (with loops)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['7 / 2   and   7 % 2', '3   and   1'],
      ['total / people  (10 and 4, ints)', '2'],
      ['10.0 / people', '2.5'],
      ['2 + 3 * 4   and   (2 + 3) * 4', '14   and   20'],
      ['10 / 4 * 1.0   and   10 * 1.0 / 4', '2.0   and   2.5'],
      ['TypeScript 7 / 2   and   10 / 4', '3.5   and   2.5'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'Integer division and the remainder',
      body: [
        'Seven sweets, two people: three each, one left over. 7 / 2 is 3 (the whole part, never rounded); 7 % 2 is 1.',
        'One double in the division gives decimal division. Brackets change the order, never the types.',
      ],
      code: [{caption: 'Bill.java', lines: [
        'int total = 10;',
        'int people = 4;',
        'IO.println(total / people);        // 2',
        'IO.println(10.0 / people);         // 2.5',
        'double totalMoney = 10.0;',
        'IO.println(totalMoney / people);   // 2.5',
      ]}],
      claims: [{text: 'Printed 2, 2.5, 2.5.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['One number type, so the decimal stays. Math.floor rounds down to the whole number below; the result is still a number.'],
      code: [{caption: 'ops.ts', lines: [
        'console.log(7 / 2);                // 3.5',
        'console.log(10 / 4);               // 2.5',
        'console.log(2 + 3 * 4);            // 14',
        'console.log(Math.floor(10 / 4));   // 2',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed 3.5, 2.5, 14, 2.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Read an expression like Java does',
    items: [
      'Which operator goes first? * / % before + -.',
      'Same priority? Left to right.',
      'Two ints divided? The whole part only.',
      'Want decimals? Put a double in the division, early.',
      'Challenge: predict 9 / 2, 9 % 2, 9 / 2.0, 2 + 3 * 4, 10 / 4 * 1.0.',
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
