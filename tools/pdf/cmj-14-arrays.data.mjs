/**
 * Complete Modern Java design sheet, episode 14: arrays, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Recorded on 2026-10-24 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2), and re-run on 2026-11-04 on Java 25.0.4 and TypeScript 7.0.2 with the same output.
 * The files are in the repository: java/ep14 and typescript/ep14.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24, and again 2026-11-04: Java 25.0.4, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Many values, one name.',
  subtitle: 'Complete Modern Java, episode 14: arrays, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Read by index, change one value, and know the one number that makes Java stop.',
  verifiedOn: '2026-11-04',
  intro: [
    'Three prices are three variables. A hundred things would be a hundred variables.',
    'An array keeps them under one name. Indexes start at 0, and the last is length - 1.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['Declaring an array', 'Indexes from 0', 'length', 'Changing one value', 'Out of bounds', 'Arrays.toString', 'TypeScript arrays'],
    outTitle: 'Coming next',
    out: ['Looping over an array (episode 15)', 'Classes and objects (episode 16)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each file printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Prices.java: prices[0], prices[2], length', '150, 250, 3'],
      ['Prices.java: prices[1] = 120', '120'],
      ['Bounds.java: prices[3]', 'ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3'],
      ['Show.java: IO.println(prices)', 'a code such as [I@768b970c'],
      ['Show.java: Arrays.toString(prices)', '[150, 120, 250]'],
      ['prices.ts', '150, 3, undefined, [ 150, 120, 250 ]'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'A row of numbered boxes',
      body: [
        'Several values of one type under one name. Index 0 is the first; the valid indexes run to length - 1.',
        'A Java array has a fixed length: change what is in a box, never add a box.',
      ],
      code: [{caption: 'Prices.java', lines: [
        'void main() {',
        '    int[] prices = {150, 99, 250};',
        '    IO.println(prices[0]);        // 150',
        '    IO.println(prices[2]);        // 250',
        '    IO.println(prices.length);    // 3',
        '    prices[1] = 120;',
        '    IO.println(prices[1]);        // 120',
        '}',
      ]}],
      claims: [{text: 'Printed 150, 250, 3, then 120.', source: RUN}],
    },
    {
      id: 'bounds',
      title: 'One past the end, and printing',
      body: [
        'prices[3] on three boxes stops the program. Read the message: index 3, length 3.',
        'Printing an array directly shows a code; Arrays.toString lists the values.',
      ],
      code: [{caption: 'Show.java', lines: [
        'import java.util.Arrays;',
        '',
        'void main() {',
        '    int[] prices = {150, 120, 250};',
        '    IO.println(prices);                     // [I@768b970c',
        '    IO.println(Arrays.toString(prices));    // [150, 120, 250]',
        '}',
      ]}],
      claims: [{text: 'Bounds.java: Index 3 out of bounds for length 3.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript arrays',
      body: ['Past the end gives undefined, with no error. A JavaScript array can grow; const only stops replacing it.'],
      code: [{caption: 'prices.ts', lines: [
        'const prices: number[] = [150, 99, 250];',
        'console.log(prices[0]);        // 150',
        'console.log(prices.length);    // 3',
        'prices[1] = 120;',
        'console.log(prices[3]);        // undefined',
        'console.log(prices);           // [ 150, 120, 250 ]',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; node printed 150, 3, undefined, [ 150, 120, 250 ].', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Use an array',
    items: [
      'Many values of one type? One array, one name.',
      'The first is index 0.',
      'The last is length - 1.',
      'To print it, use Arrays.toString.',
      'Challenge: {100, 200, 300, 400}: prices[2] and the length.',
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
