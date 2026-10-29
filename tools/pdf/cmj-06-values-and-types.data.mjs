/**
 * Complete Modern Java design sheet, episode 6: values and types in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-23, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep06 and
 * typescript/ep06.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-23: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Java printed 21. Why?',
  subtitle: 'Complete Modern Java, episode 6: values and types in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Every value has a type, and the type decides what happens to it.',
  verifiedOn: '2026-10-23',
  intro: [
    'Two loaves and one milk printed Items: 21. The values were right; the types decided what + did.',
    'Value, variable, type, literal, assignment, then the everyday types in both languages.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['Value, variable, type, literal', 'int, double, boolean, String, char', 'The compiler checking types', 'TypeScript number, boolean, string'],
    outTitle: 'Coming next',
    out: ['Expressions and operators (episode 7)', 'Numbers and precision (episode 8)', 'Decisions (episode 9)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each line printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['"Items: " + bread + milk', 'Items: 21'],
      ['"Items: " + (bread + milk)', 'Items: 3'],
      ['double whole = 4;', '4.0'],
      ['int price = 1.5;', 'error: possible lossy conversion from double to int'],
      ['let quantity: number = "three"', "TS2322: Type 'string' is not assignable to type 'number'"],
      ['let inferred = 3; inferred = "three"', 'TS2322 as well: inferred types are checked'],
    ],
  },
  sections: [
    {
      id: 'words',
      title: 'Four words, one line',
      body: [
        'int bread = 2; : 2 is the value (a literal), bread the variable, int the type.',
        '= is assignment: it puts 2 into bread. It does not ask whether they are equal.',
      ],
      code: [{caption: 'Java types', lines: [
        'int quantity = 3;          // whole numbers',
        'double price = 4.99;       // decimal point',
        'boolean paid = false;      // true or false',
        'String product = "Milk";   // text, double quotes',
        "char grade = 'A';          // one character, single quotes",
      ]}],
      claims: [{text: 'Printed 3, 4.99, false, Milk, A.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['One number type for whole numbers and decimals; string with a small s; inference is still checked.'],
      code: [{caption: 'types.ts', lines: [
        'let quantity: number = 3;',
        'let price: number = 4.99;',
        'let paid: boolean = false;',
        'let product: string = "Milk";',
        'let inferred = 3;           // a number, by inference',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed 3 4.99 false Milk 3.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Pick the type',
    items: [
      'Counting? int.',
      'Measuring, with a decimal point? double.',
      'Yes or no? boolean.',
      'Text? String in Java, string in TypeScript.',
      'Challenge: predict three lines before you run them.',
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
