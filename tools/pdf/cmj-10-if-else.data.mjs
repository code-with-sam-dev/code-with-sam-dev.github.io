/**
 * Complete Modern Java design sheet, episode 10: decisions with if and else, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep10 and
 * typescript/ep10.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Free delivery?',
  subtitle: 'Complete Modern Java, episode 10: decisions with if and else, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'A comparison gives true or false. if and else run exactly one branch, then the program carries on.',
  verifiedOn: '2026-10-24',
  intro: [
    'Free delivery from $50. Sarah\'s basket is $52.40, kept as 5240 cents.',
    'The program has to choose: free delivery, or $4.99.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['A comparison is a boolean', 'if and else', 'The six comparison operators', '= versus ==', 'TypeScript ==='],
    outTitle: 'Coming next',
    out: ['and, or, not, else if (episode 11)', 'Loops (episode 12)', 'Methods (episode 13)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['totalCents >= 5000  (5240)', 'true, Free delivery, Thank you, Sarah'],
      ['totalCents >= 5000  (4240)', 'false, Delivery: $4.99, Thank you, Sarah'],
      ['items == 3   items != 3', 'true   false'],
      ['5000 > 5000   5000 >= 5000', 'false   true'],
      ['if (items = 5)', 'error: int cannot be converted to boolean'],
      ['TypeScript items === 3', 'true'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'if and else',
      body: [
        'The condition becomes true or false. Exactly one branch runs, then the program carries on after it.',
        '>= means greater than or equal to, so exactly 5000 cents qualifies. One = assigns; two == compare.',
      ],
      code: [{caption: 'Delivery.java', lines: [
        'int totalCents = 5240;',
        'if (totalCents >= 5000) {',
        '    IO.println("Free delivery");',
        '} else {',
        '    IO.println("Delivery: $4.99");',
        '}',
        'IO.println("Thank you, Sarah");',
      ]}],
      claims: [{text: 'Printed true, Free delivery, Thank you, Sarah; with 4240: false, Delivery: $4.99, Thank you, Sarah.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['The same if and else. Use === and !==: JavaScript\'s == can convert values before comparing, === never does.'],
      code: [{caption: 'delivery.ts', lines: [
        'const items: number = 3;',
        'console.log(items === 3);   // true',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed Free delivery, Thank you, Sarah, true.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Write a decision',
    items: [
      'Write the rule in words first: from $50, free delivery.',
      'Pick the sign that matches it: >= includes exactly $50.',
      'One = assigns. == compares. In TypeScript, ===.',
      'Remember the line after the if and else runs either way.',
      'Challenge: predict 4999, 5000 and 5001 cents.',
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
