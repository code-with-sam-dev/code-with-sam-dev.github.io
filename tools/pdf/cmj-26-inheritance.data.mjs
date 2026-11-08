/**
 * Complete Modern Java design sheet, episode 26: inheritance, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep26 and typescript/ep26.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Stop copying the class.',
  subtitle: 'Complete Modern Java, episode 26: inheritance, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'One class building on another: reuse the parent\'s methods, add your own, and override one.',
  verifiedOn: '2026-11-07',
  intro: [
    'Is every fresh product a product? Yes. Is every product a fresh product? No. That is the test for inheritance.',
    'Use it when one kind of thing really is a more specific kind of another, not just to reuse code.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['is-a', 'extends', 'super(...) in a constructor', 'Inherited methods', '@Override and super.describe()', 'One list, its own version', 'TypeScript override'],
    outTitle: 'Coming next',
    out: ['Composition or inheritance (episode 27)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['milk.getName(), getPriceCents(), getDaysLeft()', 'Milk, 99, 3'],
      ['@Override on a misspelt describe', 'compile error'],
      ['milk.describe()', 'Milk: 99, 3 days left'],
      ['describe() over a shelf of Product', 'Rice: 199; Milk: 99, 3 days left'],
      ['shelf.ts', 'the same two lines'],
    ],
  },
  sections: [
    {
      id: 'extends',
      title: 'extends and super',
      body: [
        'super(name, priceCents) runs Product\'s constructor, so the price check still runs. Product has no constructor without arguments, so the child must call one.',
        'The milk object holds a name and a price; they are private to Product, so FreshProduct uses Product\'s methods.',
      ],
      code: [{caption: 'FreshProduct.java', lines: [
        'class FreshProduct extends Product {',
        '    private int daysLeft;',
        '',
        '    FreshProduct(String name, int priceCents, int daysLeft) {',
        '        super(name, priceCents);',
        '        this.daysLeft = daysLeft;',
        '    }',
        '',
        '    int getDaysLeft() {',
        '        return daysLeft;',
        '    }',
        '',
        '    @Override',
        '    String describe() {',
        '        return super.describe() + ", " + daysLeft + " days left";',
        '    }',
        '}',
      ]}],
      claims: [{text: 'milk.getName(), getPriceCents() and getDaysLeft() printed Milk, 99, 3; describe() printed Milk: 99, 3 days left.', source: RUN}],
    },
    {
      id: 'shelf',
      title: 'One shelf, its own version',
      body: ['Both are treated as Product, but milk really is a FreshProduct, so its own describe runs. That is polymorphism.'],
      code: [{caption: 'Shelf.java', lines: [
        'ArrayList<Product> shelf = new ArrayList<>();',
        'shelf.add(new Product("Rice", 199));',
        'shelf.add(milk);',
        'for (Product product : shelf) {',
        '    IO.println(product.describe());',
        '}',
        '// Rice: 199',
        '// Milk: 99, 3 days left',
      ]}],
      claims: [{text: 'A misspelt describe under @Override: method does not override or implement a method from a supertype.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript extends',
      body: ['The override keyword is TypeScript\'s version of the annotation. super must come before this in the constructor.'],
      code: [{caption: 'shelf.ts', lines: [
        'class FreshProduct extends Product {',
        '    daysLeft: number;',
        '    constructor(name: string, priceCents: number, daysLeft: number) {',
        '        super(name, priceCents);',
        '        this.daysLeft = daysLeft;',
        '    }',
        '    override describe(): string {',
        '        return super.describe() + ", " + this.daysLeft + " days left";',
        '    }',
        '}',
      ]}],
      claims: [{text: 'tsc quiet; the same two lines. this before super: TS17009.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Inheritance, in one look',
    items: [
      'Is every child really a kind of the parent? Then extends.',
      'Call super(...) first in the constructor.',
      'Type @Override (Java) or override (TypeScript).',
      'super.method() reuses the parent instead of copying it.',
      'Challenge: cheese at 350, 5 days left. Cheese: 350, 5 days left.',
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
