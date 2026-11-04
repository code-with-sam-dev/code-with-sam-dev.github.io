/**
 * Complete Modern Java design sheet, episode 13: methods, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep13 and
 * typescript/ep13.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Name it once.',
  subtitle: 'Complete Modern Java, episode 13: methods, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Give instructions a name, pass values in, get a result back.',
  verifiedOn: '2026-10-24',
  intro: [
    'The same line printed in two places is two places to change.',
    'A method names it once. Three shapes: no input, input, and a result.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['void methods', 'Calling a method', 'Parameters and arguments', 'return', 'TypeScript functions'],
    outTitle: 'Coming next',
    out: ['Arrays (episode 14)', 'Array iteration (episode 15)', 'Classes and objects (episode 16)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each file printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Lines.java: printLine() twice', '----------, Sarah\'s groceries, ----------'],
      ['Custom.java: two arguments', '==========, **********'],
      ['Totals.java: lineTotal(2, 150)', '300'],
      ['breadTotal + milkTotal', '399'],
      ['receipt.ts', '----------, ==========, 399'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'Three shapes',
      body: [
        'void: nothing given back. A parameter is the name inside; an argument is the value in the call.',
        'return sends a value back; the type before the name says what kind.',
      ],
      code: [{caption: 'Totals.java', lines: [
        'void main() {',
        '    int breadTotal = lineTotal(2, 150);',
        '    int milkTotal = lineTotal(1, 99);',
        '    IO.println(breadTotal + milkTotal);   // 399',
        '}',
        '',
        'int lineTotal(int quantity, int priceCents) {',
        '    return quantity * priceCents;',
        '}',
      ]}],
      claims: [{text: 'Printed 300, then 399.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript functions',
      body: ['The return type goes after the brackets, where Java puts it before the name.'],
      code: [{caption: 'receipt.ts', lines: [
        'function lineTotal(quantity: number, priceCents: number): number {',
        '    return quantity * priceCents;',
        '}',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed ----------, ==========, 399.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Write a method',
    items: [
      'Repeating lines? Name them once.',
      'Needs a value? Add a parameter.',
      'Needs to give an answer? return it, and say its type.',
      'Call it from main, then carry on.',
      'Challenge: lineTotal(3, 150) + lineTotal(2, 99).',
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
