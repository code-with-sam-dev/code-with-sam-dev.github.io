/**
 * Complete Modern Java design sheet, episode 27: composition or inheritance, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep27 and typescript/ep27.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Extends can break rules.',
  subtitle: 'Complete Modern Java, episode 27: composition or inheritance, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Is it a kind of, or does it have one? A cart has products; it is not a product, and it is not a list.',
  verifiedOn: '2026-11-07',
  intro: [
    'Code can compile and still model the wrong thing: CartAsProduct extends Product compiles without a complaint.',
    'A fresh product is a product: inheritance. A cart has products: a field. That is composition.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['is-a or has-a', 'Composition', 'Extending a list hands out every list method', 'The cart chooses its operations', 'TypeScript private at run time'],
    outTitle: 'Coming next',
    out: ['Abstract classes (episode 28)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['javac CartAsProduct.java', 'no complaint'],
      ['cart: Rice and fresh Milk; count, total', '2, 298'],
      ['trolley: add Rice, add null; size', '2'],
      ['trolley.clear(); size', '0'],
      ['cart.add(null) / cart.clear()', 'exception / compile error'],
      ['carts.ts: cart.items.length = 0', 'TS2341, then node prints 0'],
    ],
  },
  sections: [
    {
      id: 'trap',
      title: 'The tempting shortcut',
      body: [
        'Trolley inherits every ArrayList method, so add(null) and clear() just work, and the cart\'s rule is gone.',
        'Extending a list is not always wrong; it hands out every operation the list has, including ones you never chose.',
      ],
      code: [{caption: 'Trolley.java and Carts.java', lines: [
        'class Trolley extends ArrayList<Product> {}',
        '',
        'Trolley trolley = new Trolley();',
        'trolley.add(new Product("Rice", 199));',
        'trolley.add(null);',
        'IO.println(trolley.size());   // 2',
        'trolley.clear();',
        'IO.println(trolley.size());   // 0',
      ]}],
      claims: [{text: 'Printed 2, then 0.', source: RUN}],
    },
    {
      id: 'cart',
      title: 'The cart has a list',
      body: ['ShoppingCart keeps its list private and decides which operations exist. Want clear later? Add it, on purpose.'],
      code: [{caption: 'ShoppingCart.java (from episode 20)', lines: [
        'class ShoppingCart {',
        '    private ArrayList<Product> items = new ArrayList<>();',
        '',
        '    void add(Product product) {',
        '        if (product == null) {',
        '            throw new IllegalArgumentException("product cannot be null");',
        '        }',
        '        items.add(product);',
        '    }',
        '    // count, totalCents, remove, removeByName',
        '}',
      ]}],
      claims: [{text: 'cart.add(null): product cannot be null. cart.clear(): cannot find symbol.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript private has a catch',
      body: ['tsc refuses cart.items, but private is a checker rule: node runs the line and the count becomes 0.'],
      code: [{caption: 'carts.ts', lines: [
        'class ShoppingCart {',
        '    private items: Product[] = [];',
        '    // add, count, totalCents',
        '}',
        'cart.items.length = 0;      // TS2341 from tsc',
        'console.log(cart.count());  // node prints 0',
      ]}],
      claims: [{text: 'tsc: Property items is private and only accessible within class ShoppingCart. node: 0.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Is it, or does it have?',
    items: [
      'Really a more specific kind? Inheritance may fit.',
      'Has or uses another? A field: composition.',
      'Unsure? The field is usually the simpler start.',
      'Compiling is not the same as modelling well.',
      'Challenge: fresh product, cart, delivery driver.',
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
