/**
 * Complete Modern Java design sheet, episode 19: ArrayList, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep19 and typescript/ep19.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'A list that can grow.',
  subtitle: 'Complete Modern Java, episode 19: ArrayList, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Add, read and remove items from a list that changes size as you go.',
  verifiedOn: '2026-11-07',
  intro: [
    'An array keeps the length it was made with: three boxes, no room for a fourth.',
    'An ArrayList grows when you add and shrinks when you remove.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['A full array', 'ArrayList<String>', 'add, get, size', 'remove and contains', 'ArrayList<Integer>, not int', 'get(5) out of bounds', 'TypeScript arrays'],
    outTitle: 'Coming next',
    out: ['A list of products (episode 20)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Full.java: basket[3] on a String[3]', 'ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3'],
      ['Cart.java: print, size(), get(0)', '[Bread, Milk, Eggs], 3, Bread'],
      ['Cart.java: remove("Milk"), contains("Milk")', '[Bread, Eggs], false'],
      ['ArrayList<int>', 'error: unexpected type, required: reference, found: int'],
      ['ArrayList<Integer>: add 150, 99', '[150, 99]'],
      ['cart.ts: basket[5]', 'undefined (Java get(5) throws)'],
    ],
  },
  sections: [
    {
      id: 'list',
      title: 'ArrayList: add, get, size, remove',
      body: [
        'String between the angle brackets says what the list holds; the empty <> lets Java work it out. No import in a compact source file.',
        'Remove shifts the items after it to the left, so the indexes change.',
      ],
      code: [{caption: 'Cart.java', lines: [
        'void main() {',
        '    ArrayList<String> basket = new ArrayList<>();',
        '    basket.add("Bread");',
        '    basket.add("Milk");',
        '    basket.add("Eggs");',
        '    IO.println(basket);             // [Bread, Milk, Eggs]',
        '    IO.println(basket.size());      // 3',
        '    IO.println(basket.get(0));      // Bread',
        '    basket.remove("Milk");',
        '    IO.println(basket);             // [Bread, Eggs]',
        '    IO.println(basket.contains("Milk"));   // false',
        '}',
      ]}],
      claims: [{text: 'Printed exactly these values; basket.get(5) then threw Index 5 out of bounds for length 2.', source: RUN}],
    },
    {
      id: 'integer',
      title: 'Numbers need Integer',
      body: ['A list holds objects. int is a plain number, so ArrayList<int> does not compile; Integer is the object version of int.'],
      code: [{caption: 'Numbers.java', lines: [
        'void main() {',
        '    ArrayList<Integer> prices = new ArrayList<>();',
        '    prices.add(150);',
        '    prices.add(99);',
        '    IO.println(prices);   // [150, 99]',
        '}',
      ]}],
      claims: [{text: 'With int: error: unexpected type. With Integer: [150, 99]. remove(1) on [10, 20, 30] left [10, 30].', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript arrays already grow',
      body: ['push adds, length counts. To remove by value, find the index and check it is not -1 first: splice(-1, 1) removes the last item.'],
      code: [{caption: 'cart.ts', lines: [
        'const basket: string[] = [];',
        'basket.push("Bread");',
        'basket.push("Milk");',
        'basket.push("Eggs");',
        'const index = basket.indexOf("Milk");',
        'if (index !== -1) {',
        '    basket.splice(index, 1);',
        '}',
        'console.log(basket);       // [ \'Bread\', \'Eggs\' ]',
        'console.log(basket[5]);    // undefined',
      ]}],
      claims: [{text: 'tsc was quiet; node printed the lists, 3, -1 and undefined.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Use a list',
    items: [
      'It must grow? ArrayList, not an array.',
      'size() counts; get(i) reads.',
      'Numbers: ArrayList<Integer>.',
      'TypeScript: check indexOf is not -1 before splice.',
      'Challenge: add Bread, Milk, Eggs; remove Milk; add Rice. size() and get(1)?',
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
