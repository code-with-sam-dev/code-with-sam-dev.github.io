/**
 * Complete Modern Java design sheet, episode 15: looping over an array, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep15 and typescript/ep15.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-06: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One loop, any length.',
  subtitle: 'Complete Modern Java, episode 15: looping over an array, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Add up every price with one loop, and know the one character that crashes it.',
  verifiedOn: '2026-11-06',
  intro: [
    'Three prices are three additions. A hundred prices would be a hundred.',
    'One loop adds them all: the loop variable is the index, and it stops before the length.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['for with an index', 'i < prices.length', 'The <= crash', 'Enhanced for (for-each)', 'An empty array', 'for...of in TypeScript', 'NaN in TypeScript'],
    outTitle: 'Coming next',
    out: ['Classes and objects (episode 16)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Basket.java: for with i < prices.length', '499'],
      ['Basket.java: the same loop with <=', 'ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3'],
      ['Basket.java: for (int price : prices)', '499'],
      ['Basket.java: int[] prices = {}', '0 and 0'],
      ['basket.ts: for and for...of', '499 and 499'],
      ['basket.ts: the same loop with <=', 'NaN, with no error'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'The index walks the array',
      body: [
        'i starts at 0, the first index. The check i < prices.length comes before every pass, so prices[3] is never read.',
        'Change < to <= and i reaches 3: the body reads a box that does not exist, and Java stops.',
      ],
      code: [{caption: 'Basket.java', lines: [
        'void main() {',
        '    int[] prices = {150, 99, 250};',
        '    int total = 0;',
        '    for (int i = 0; i < prices.length; i++) {',
        '        total += prices[i];',
        '    }',
        '    IO.println(total);                // 499',
        '    int sum = 0;',
        '    for (int price : prices) {',
        '        sum += price;',
        '    }',
        '    IO.println(sum);                  // 499',
        '}',
      ]}],
      claims: [{text: 'Printed 499 twice; with <= it stopped with Index 3 out of bounds for length 3; with {} it printed 0 twice.', source: RUN}],
    },
    {
      id: 'each',
      title: 'Which loop?',
      body: [
        'Want every value? for (int price : prices), read as "for each price in prices": no index, no boundary to get wrong.',
        'Need the position, or to change the array? Use the loop with the index: prices[i] = prices[i] * 2.',
      ],
      code: [{caption: 'Trace of the index loop', lines: [
        'i   i < 3   prices[i]   total',
        '                         0',
        '0   true    150          150',
        '1   true    99           249',
        '2   true    250          499',
        '3   false   not read     499',
      ]}],
      claims: [{text: 'Twice.java: reassigning price in a for-each left [150, 99, 250]; the index loop gave [300, 198, 500].', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript: for...of, and NaN',
      body: ['for...of gives each value, like Java\'s for-each. The same <= mistake reads undefined, and 499 + undefined is NaN: no error, a wrong answer.'],
      code: [{caption: 'basket.ts', lines: [
        'const prices: number[] = [150, 99, 250];',
        'let total = 0;',
        'for (let i = 0; i < prices.length; i++) {',
        '    total += prices[i];',
        '}',
        'console.log(total);    // 499 (NaN with <=)',
        'let sum = 0;',
        'for (const price of prices) {',
        '    sum += price;',
        '}',
        'console.log(sum);      // 499',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet both ways; node printed 499 and 499, then NaN and 499 with <=.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Loop over an array',
    items: [
      'Start at 0, the first index.',
      'Loop while i < length, never <=.',
      'Only need each value? for-each in Java, for...of in TypeScript.',
      'An empty array runs the loop zero times.',
      'Challenge: start at i = 1 over {100, 200, 300, 400}. 1000 or 900?',
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
