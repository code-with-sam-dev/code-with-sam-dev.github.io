/**
 * Complete Modern Java design sheet, episode 17: encapsulation, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep17 and typescript/ep17.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Protect your object\'s data.',
  subtitle: 'Complete Modern Java, episode 17: encapsulation, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Private fields, getters, and a setter that refuses a negative price.',
  verifiedOn: '2026-11-07',
  intro: [
    'With open fields, bread.priceCents = -5 runs and prints -5. Nothing stops it.',
    'Encapsulation means the object controls its own data: private fields, and methods that check.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['A class in its own file', 'private fields', 'Getters', 'A setter that checks', 'throw, in one sentence', 'The constructor uses the setter', 'TypeScript private'],
    outTitle: 'Coming next',
    out: ['Exceptions: try and catch (episode 18)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Fields.java (open fields): bread.priceCents = -5', '-5'],
      ['Store.java: bread.priceCents = -5 (private)', 'error: priceCents has private access in Product'],
      ['Getters', 'Bread, 150'],
      ['setPriceCents(-500), no check', '-500'],
      ['setPriceCents(-5), with the check', 'IllegalArgumentException: price cannot be negative'],
      ['product.ts: bread.priceCents', 'tsc TS2341; node still prints 150'],
    ],
  },
  sections: [
    {
      id: 'product',
      title: 'Private fields, doors that check',
      body: [
        'private: only code inside Product can use the field. Getters read it; the setter checks before it changes it.',
        'The constructor calls the same setter, so the rule lives in one place. name has no setter: it cannot change.',
      ],
      code: [{caption: 'Product.java', lines: [
        'class Product {',
        '    private String name;',
        '    private int priceCents;',
        '',
        '    Product(String name, int priceCents) {',
        '        this.name = name;',
        '        setPriceCents(priceCents);',
        '    }',
        '',
        '    String getName() { return name; }',
        '    int getPriceCents() { return priceCents; }',
        '',
        '    void setPriceCents(int newPriceCents) {',
        '        if (newPriceCents < 0) {',
        '            throw new IllegalArgumentException("price cannot be negative");',
        '        }',
        '        priceCents = newPriceCents;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'Store.java printed Bread, 150, 200, then stopped at new Product("Eggs", -5) with the exception.', source: RUN}],
    },
    {
      id: 'same',
      title: 'Why Product moved to its own file',
      body: [
        'Declared in the same compact file as main, Product is nested inside the file\'s own class, and Java lets that class reach its private members: the same line printed -5.',
        'In its own file, Product.java, main is outside the class and the line is refused.',
      ],
      code: [{caption: 'Store.java', lines: [
        'void main() {',
        '    Product bread = new Product("Bread", 150);',
        '    bread.priceCents = -5;   // error: priceCents has private access in Product',
        '}',
      ]}],
      claims: [{text: 'Same.java (one file) printed -5; Store.java with Product.java reported the private access error.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript private',
      body: ['tsc refuses bread.priceCents, but node does not check types and prints 150. TypeScript private is a rule for the checker; JavaScript #private fields are enforced at run time.'],
      code: [{caption: 'product.ts', lines: [
        'class Product {',
        '    private priceCents: number;',
        '    constructor(priceCents: number) {',
        '        this.priceCents = priceCents;',
        '    }',
        '    getPriceCents(): number {',
        '        return this.priceCents;',
        '    }',
        '}',
        'const bread = new Product(150);',
        'console.log(bread.priceCents);   // tsc: TS2341; node: 150',
      ]}],
      claims: [{text: 'npx tsc --noEmit reported TS2341; node product.ts printed 150 and 150.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Protect your data',
    items: [
      'Fields private.',
      'Getters to read.',
      'A setter only if the value may change, and it checks.',
      'The constructor uses the same check.',
      'Challenge: setPriceCents(300) or priceCents = 300: which compiles?',
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
