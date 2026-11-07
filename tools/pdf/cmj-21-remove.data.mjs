/**
 * Complete Modern Java design sheet, episode 21: removing from the cart, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep21 and typescript/ep21.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Same values. Two objects.',
  subtitle: 'Complete Modern Java, episode 21: removing from the cart, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Why Java said Milk was not in the cart, and how to remove by a rule you choose.',
  verifiedOn: '2026-11-07',
  intro: [
    'remove(new Product("Milk", 99)) returned false, with Milk right there in the cart.',
    'new makes a new object. Same values, two objects, and Product never said what equal means.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['remove returns a boolean', 'Same values, two objects', '== and equals on objects', 'Removing the same object', 'removeByName', 'TypeScript indexOf and splice'],
    outTitle: 'Coming next',
    out: ['HashMap: find a product by name straight away (episode 22)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['remove(new Product("Milk", 99))', 'false; count stays 3'],
      ['first == second, first.equals(second)', 'false, false'],
      ['"Milk".equals("Milk")', 'true'],
      ['remove(milk), the same object', 'true; count 2, total 400'],
      ['removeByName("Eggs"), removeByName("Rice")', 'true, false; total 150'],
      ['returns.ts: indexOf(second)', '-1'],
    ],
  },
  sections: [
    {
      id: 'why',
      title: 'Why Java said no',
      body: [
        'remove asks each item whether it is equal. Product has never said what equal means, so only the very same object counts.',
        'Strings have that rule: same text, equal. That is why removing "Milk" from a list of strings worked.',
      ],
      code: [{caption: 'Twins.java', lines: [
        'void main() {',
        '    Product first = new Product("Milk", 99);',
        '    Product second = new Product("Milk", 99);',
        '    IO.println(first == second);          // false',
        '    IO.println(first.equals(second));     // false',
        '    IO.println("Milk".equals("Milk"));    // true',
        '}',
      ]}],
      claims: [{text: 'Printed false, false, true.', source: RUN}],
    },
    {
      id: 'byname',
      title: 'A rule of our own: remove by name',
      body: [
        'Remove the first product whose name matches, and stop straight away. Matching is exact: "milk" is not "Milk".',
        'Real shops identify products by a code; for this small cart, the name is the rule we chose.',
      ],
      code: [{caption: 'ShoppingCart.java', lines: [
        'boolean remove(Product product) {',
        '    return items.remove(product);',
        '}',
        '',
        'boolean removeByName(String name) {',
        '    for (int i = 0; i < items.size(); i++) {',
        '        if (items.get(i).getName().equals(name)) {',
        '            items.remove(i);',
        '            return true;',
        '        }',
        '    }',
        '    return false;',
        '}',
      ]}],
      claims: [{text: 'Returns.java printed false, 3, true, 2, 400, true, false, 150.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript: the same idea',
      body: ['=== on two objects is only true for the very same object, so indexOf(second) is -1. Search by a value, then splice it out.'],
      code: [{caption: 'returns.ts', lines: [
        'function removeByName(items: Product[], name: string): boolean {',
        '    for (let i = 0; i < items.length; i++) {',
        '        if (items[i].name === name) {',
        '            items.splice(i, 1);',
        '            return true;',
        '        }',
        '    }',
        '    return false;',
        '}',
      ]}],
      claims: [{text: 'node printed false, -1, true, 1.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Same or equal?',
    items: [
      'new always makes a new object.',
      '== on objects: the same object?',
      'Strings: compare with equals.',
      'Want a value match? Write the rule yourself.',
      'Challenge: Milk, Eggs, Milk, Bread; removeByName("Milk") once. What is left?',
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
