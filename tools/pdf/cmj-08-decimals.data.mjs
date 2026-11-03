/**
 * Complete Modern Java design sheet, episode 8: decimals are not exact, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep08 and
 * typescript/ep08.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '1.10 + 2.20 = 3.3000000000000003?',
  subtitle: 'Complete Modern Java, episode 8: decimals are not exact, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'A double keeps the nearest binary value. For money, use whole cents or BigDecimal from text.',
  verifiedOn: '2026-10-24',
  intro: [
    'Bread $1.10 plus milk $2.20 printed 3.3000000000000003, and 0.1 + 0.2 == 0.3 printed false.',
    'In binary, one tenth never ends, so a double stores the nearest value. Two tiny gaps add up.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['Why 0.1 is not exact', 'The proof with BigDecimal', 'Money in whole cents', 'BigDecimal from text'],
    outTitle: 'Coming next',
    out: ['Number limits (episode 9)', 'Division by zero (episode 9)', 'Comparisons (decisions, episode 10)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['1.10 + 2.20', '3.3000000000000003'],
      ['0.1 + 0.2 == 0.3', 'false'],
      ['new BigDecimal(0.1)', '0.1000000000000000055511151231257827021181583404541015625'],
      ['new BigDecimal("0.1")', '0.1'],
      ['110 + 220  (cents, int)', '330'],
      ['BigDecimal "1.10" add "2.20"', '3.30'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'Two ways to keep money exact',
      body: [
        'Whole cents in an int: whole numbers are stored exactly. Dividing, rounding and the int limit still need care.',
        'BigDecimal made from text, added with .add. Never make it from a double: the double is already rounded.',
      ],
      code: [{caption: 'Money.java', lines: [
        'import java.math.BigDecimal;',
        '',
        'BigDecimal bread = new BigDecimal("1.10");',
        'BigDecimal milk = new BigDecimal("2.20");',
        'BigDecimal total = bread.add(milk);   // 3.30',
        '',
        'int totalCents = 110 + 220;           // 330',
      ]}],
      claims: [{text: 'Printed 3.30 and 330.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['number is the same kind of binary double. No built-in decimal type: real projects use whole cents or a decimal library.'],
      code: [{caption: 'money.ts', lines: [
        'console.log(0.1 + 0.2);               // 0.30000000000000004',
        'console.log(1.10 + 2.20);             // 3.3000000000000003',
        'const breadCents: number = 110;',
        'const milkCents: number = 220;',
        'console.log(breadCents + milkCents);  // 330',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed the three lines above.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Money in code',
    items: [
      'Never trust the last digits of a double for money.',
      'Whole cents in an int: exact for adding.',
      'Or BigDecimal from text, with .add.',
      'Comparing decimal results with ==? Take care.',
      'Challenge: predict 0.1 + 0.2, BigDecimal "0.1" add "0.2", and 110 + 220.',
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
