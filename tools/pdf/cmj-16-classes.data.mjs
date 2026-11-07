/**
 * Complete Modern Java design sheet, episode 16: classes and objects, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep16 and typescript/ep16.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-06: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'One class, many objects.',
  subtitle: 'Complete Modern Java, episode 16: classes and objects, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Make your own type, see what Java fills in when you forget, and give it a constructor and a method.',
  verifiedOn: '2026-11-06',
  intro: [
    'A product has a name and a price. Four loose variables cannot say which name goes with which price.',
    'A class describes the kind of thing; new makes an object; each object keeps its own values.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['A class with fields', 'new and objects', 'Field defaults: 0 and null', 'A constructor and this', 'A method on the object', 'An array of objects', 'TypeScript classes'],
    outTitle: 'Coming next',
    out: ['Protecting the fields (episode 17)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each file printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Fields.java: new Product(), fields not set', 'null, 0'],
      ['Fields.java: after setting the name', 'Bread'],
      ['Local.java: a local read before a value', 'variable count might not have been initialized'],
      ['Shop.java: bread.label(), milk.label()', 'Bread: 150 cents, Milk: 99 cents'],
      ['Shop.java: for-each over a Product[]', '249'],
      ['shop.ts', 'Bread: 150 cents, Milk: 99 cents'],
    ],
  },
  sections: [
    {
      id: 'class',
      title: 'Fields, and their defaults',
      body: [
        'A field that was never given a value starts with a default: 0 for a number, null for a String (no text yet).',
        'A local variable gets no default: Java refuses to read it before it has a value.',
      ],
      code: [{caption: 'Fields.java', lines: [
        'class Product {',
        '    String name;',
        '    int priceCents;',
        '}',
        '',
        'void main() {',
        '    Product bread = new Product();',
        '    IO.println(bread.name);          // null',
        '    IO.println(bread.priceCents);    // 0',
        '    bread.name = "Bread";',
        '    bread.priceCents = 150;',
        '    IO.println(bread.name);          // Bread',
        '}',
      ]}],
      claims: [{text: 'Printed null, 0, then Bread. Local.java stopped: variable count might not have been initialized.', source: RUN}],
    },
    {
      id: 'ctor',
      title: 'A constructor and a method',
      body: [
        'this.name is the field of the object being made; name is the value passed in.',
        'Fields hold the information; methods describe what the object can do. One class, two objects.',
      ],
      code: [{caption: 'Shop.java', lines: [
        'class Product {',
        '    String name;',
        '    int priceCents;',
        '    Product(String name, int priceCents) {',
        '        this.name = name;',
        '        this.priceCents = priceCents;',
        '    }',
        '    String label() {',
        '        return name + ": " + priceCents + " cents";',
        '    }',
        '}',
        '',
        'void main() {',
        '    Product bread = new Product("Bread", 150);',
        '    Product milk = new Product("Milk", 99);',
        '    IO.println(bread.label());   // Bread: 150 cents',
        '    IO.println(milk.label());    // Milk: 99 cents',
        '}',
      ]}],
      claims: [{text: 'Printed Bread: 150 cents and Milk: 99 cents; with a Product[] and a for-each, 249.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript classes',
      body: ['The same shape. The type comes after the name, the constructor is called constructor, and every field inside a method needs this.'],
      code: [{caption: 'shop.ts', lines: [
        'class Product {',
        '    name: string;',
        '    priceCents: number;',
        '    constructor(name: string, priceCents: number) {',
        '        this.name = name;',
        '        this.priceCents = priceCents;',
        '    }',
        '    label(): string {',
        '        return this.name + ": " + this.priceCents + " cents";',
        '    }',
        '}',
      ]}],
      claims: [{text: 'npx tsc --noEmit was quiet; without this. before priceCents it reported TS2663: Cannot find name.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Make a class',
    items: [
      'One kind of thing? One class.',
      'new makes an object; each keeps its own values.',
      'A constructor sets the fields as the object is made.',
      'TypeScript: this. before every field in a method.',
      'Challenge: first.name = "Toast". What do both labels print?',
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
