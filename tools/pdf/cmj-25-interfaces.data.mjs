/**
 * Complete Modern Java design sheet, episode 25: interfaces, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep25 and typescript/ep25.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Same call. Different prices.',
  subtitle: 'Complete Modern Java, episode 25: interfaces, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'An interface is a promise. Classes keep it with implements, and code that uses the promise never has to change.',
  verifiedOn: '2026-11-07',
  intro: [
    'The shop wants offers: no discount, ten percent off, half price. The checkout only needs to ask what a price becomes.',
    'The variable says what the object must be able to do. The object decides how.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['interface', 'implements', 'public on an interface method', 'A broken promise', 'One variable, three objects', 'A method that takes the interface', 'TypeScript interfaces'],
    outTitle: 'Coming next',
    out: ['Inheritance (episode 26)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['new Discount()', 'compile error'],
      ['apply without public', 'compile error'],
      ['offer.apply(1000), three objects', '1000, 900, 500'],
      ['printTotal(499, ...), three objects', 'Total: 499, 450, 250'],
      ['discount.ts, apply deleted', 'TS2420; node: not a function'],
    ],
  },
  sections: [
    {
      id: 'promise',
      title: 'The promise, and keeping it',
      body: [
        'In this example the interface only declares the method. A class keeps the promise with implements and writes the method.',
        'A method like this in an interface is public automatically, so the class must say public too. Whole-number division drops the fraction: 499 at 10 percent is 450.',
      ],
      code: [{caption: 'Discount.java, NoDiscount.java, PercentOff.java', lines: [
        'interface Discount {',
        '    int apply(int priceCents);',
        '}',
        '',
        'class NoDiscount implements Discount {',
        '    public int apply(int priceCents) {',
        '        return priceCents;',
        '    }',
        '}',
        '',
        'class PercentOff implements Discount {',
        '    private int percent;',
        '    PercentOff(int percent) { this.percent = percent; }',
        '    public int apply(int priceCents) {',
        '        return priceCents - priceCents * percent / 100;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'new Discount(): Discount is abstract; cannot be instantiated. No public: attempting to assign weaker access privileges; was public.', source: RUN}],
    },
    {
      id: 'checkout',
      title: 'Code that never changes',
      body: ['printTotal takes any Discount. It does not know which class it was given, only that the object can apply a discount.'],
      code: [{caption: 'Offers.java', lines: [
        'void main() {',
        '    printTotal(499, new NoDiscount());     // Total: 499',
        '    printTotal(499, new PercentOff(10));   // Total: 450',
        '    printTotal(499, new PercentOff(50));   // Total: 250',
        '}',
        '',
        'void printTotal(int priceCents, Discount discount) {',
        '    IO.println("Total: " + discount.apply(priceCents));',
        '}',
      ]}],
      claims: [{text: 'One Discount variable with three objects printed 1000, 900, 500; printTotal printed Total: 499, 450, 250.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript interfaces',
      body: [
        'Same shape with implements. The interface disappears when TypeScript becomes JavaScript: tsc checks the promise, node does not.',
        'TypeScript also accepts a class with the right method and no implements; Java needs the word.',
      ],
      code: [{caption: 'discount.ts', lines: [
        'interface Discount {',
        '    apply(priceCents: number): number;',
        '}',
        'function printTotal(priceCents: number, discount: Discount): void {',
        '    console.log("Total: " + discount.apply(priceCents));',
        '}',
      ]}],
      claims: [{text: 'tsc quiet; Total: 499, 450, 250. With apply deleted: TS2420 from tsc, and node threw discount.apply is not a function.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Interfaces, in one look',
    items: [
      'The interface says what; each class says how.',
      'implements is the promise; the compiler holds you to it.',
      'Interface methods like these are public: say public.',
      'Write code against the interface, and it never changes.',
      'Challenge: FixedOff(100). 1000 to 900, 50 to 0.',
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
