/**
 * Complete Modern Java design sheet, episode 24: static and constants, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep24 and typescript/ep24.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One count. Every object.',
  subtitle: 'Complete Modern Java, episode 24: static and constants, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Values and methods that belong to the class itself, a constant that cannot change, and the mistake static invites.',
  verifiedOn: '2026-11-07',
  intro: [
    'Every product has its own name and price. How many products have been made, and the most a price can be, belong to no single product.',
    'static means one for the whole class, shared by every object. static final makes a constant.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['static fields', 'static methods', 'static final constants', 'Naming constants', 'Non-static from a static context', 'TypeScript static readonly'],
    outTitle: 'Coming next',
    out: ['Interfaces (episode 25)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['getCreatedCount(), two products, again', '0, 2'],
      ['MAX_PRICE_CENTS', '100000'],
      ['isValidPrice(150); isValidPrice(150_000)', 'true, false'],
      ['Product.MAX_PRICE_CENTS = 5;', 'compile error'],
      ['Product.getName()', 'compile error'],
      ['counter.ts', '0, 2, 100000'],
    ],
  },
  sections: [
    {
      id: 'counter',
      title: 'One counter for the class',
      body: [
        'A static field exists once for the whole class, not once per object. The constructor adds one after the price is checked, so it counts products successfully made while the program runs.',
        'Shared state is shared by every piece of code: change it in one place and it changes for everyone.',
      ],
      code: [{caption: 'Product.java', lines: [
        'class Product {',
        '    static final int MAX_PRICE_CENTS = 100_000;',
        '    private static int createdCount = 0;',
        '',
        '    Product(String name, int priceCents) {',
        '        this.name = name;',
        '        setPriceCents(priceCents);',
        '        createdCount++;',
        '    }',
        '',
        '    static int getCreatedCount() {',
        '        return createdCount;',
        '    }',
        '',
        '    static boolean isValidPrice(int priceCents) {',
        '        return priceCents >= 0 && priceCents <= MAX_PRICE_CENTS;',
        '    }',
        '    // fields, getters and setPriceCents as in episode 17',
        '}',
      ]}],
      claims: [{text: 'Counter.java printed 0, then 2, then 100000, true, false and Bread.', source: RUN}],
    },
    {
      id: 'mistakes',
      title: 'Two things the compiler refuses',
      body: [
        'final means a variable can never be given another value. Constants are written in capitals with underscores.',
        'A static method has no object of its own. Product.getName() asks which product? A name belongs to an object: bread.getName().',
      ],
      code: [{caption: 'Two compile errors', lines: [
        'Product.MAX_PRICE_CENTS = 5;',
        '// cannot assign a value to static final variable MAX_PRICE_CENTS',
        'IO.println(Product.getName());',
        '// non-static method getName() cannot be referenced from a static context',
      ]}],
      claims: [{text: 'Both messages are copied from javac.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript static readonly',
      body: ['readonly is TypeScript\'s version of final, enforced by the checker. node still runs the assignment.'],
      code: [{caption: 'counter.ts', lines: [
        'class Product {',
        '    static readonly MAX_PRICE_CENTS = 100_000;',
        '    static createdCount = 0;',
        '    // constructor: Product.createdCount++;',
        '}',
        'Product.MAX_PRICE_CENTS = 5;   // TS2540 from tsc; node prints 5',
      ]}],
      claims: [{text: 'tsc quiet without the assignment; 0, 2, 100000. With it: TS2540, and node printed 5.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'static, in one look',
    items: [
      'One value for the whole class? static.',
      'A value that must never change? static final, in capitals.',
      'A method that needs no object? static, called on the class.',
      'Needs one object\'s fields? Call it on that object.',
      'Challenge: make a 150_000 product in a try. The count after? 0.',
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
