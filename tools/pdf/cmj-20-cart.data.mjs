/**
 * Complete Modern Java design sheet, episode 20: a list of objects, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep20 and typescript/ep20.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'A cart that adds itself up.',
  subtitle: 'Complete Modern Java, episode 20: a list of objects, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Move the list and the loop into the class that owns them, and let main just ask.',
  verifiedOn: '2026-11-07',
  intro: [
    'A list of names cannot add up prices. A list of Product objects can.',
    'A ShoppingCart owns the list and works out its own total; main only asks.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['ArrayList<Product>', 'A class that owns a list', 'import in a class file', 'add, count, totalCents', 'Refusing null', 'TypeScript cart'],
    outTitle: 'Coming next',
    out: ['Removing products, and what makes two products the same (episode 21)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Groceries.java: the loop in main', '499'],
      ['Shopping.java: empty cart, then three products', '0, 3, 499'],
      ['cart.add(null), no check', 'count 4, then NullPointerException in totalCents'],
      ['cart.add(null), with the check', 'IllegalArgumentException: product cannot be null'],
      ['shoppingCart.ts', '2, 249'],
      ['shoppingCart.ts: cart.add(null)', 'tsc TS2345: null is not assignable to Product'],
    ],
  },
  sections: [
    {
      id: 'cart',
      title: 'The class that owns the list',
      body: [
        'A normal class file needs import java.util.ArrayList; the compact files got it without one. Product, our own class in the same folder, needs no import.',
        'The cart checks what it accepts: private alone does not stop a null; add does.',
      ],
      code: [{caption: 'ShoppingCart.java', lines: [
        'import java.util.ArrayList;',
        '',
        'class ShoppingCart {',
        '    private ArrayList<Product> items = new ArrayList<>();',
        '',
        '    void add(Product product) {',
        '        if (product == null) {',
        '            throw new IllegalArgumentException("product cannot be null");',
        '        }',
        '        items.add(product);',
        '    }',
        '',
        '    int count() { return items.size(); }',
        '',
        '    int totalCents() {',
        '        int total = 0;',
        '        for (Product product : items) {',
        '            total += product.getPriceCents();',
        '        }',
        '        return total;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'Shopping.java printed 0, 3, 499; with the check, cart.add(null) threw IllegalArgumentException.', source: RUN}],
    },
    {
      id: 'main',
      title: 'main just asks',
      body: ['Before, main did all the work. Now main tells the cart what it wants, and the cart knows how to do it: one place to change the total.'],
      code: [{caption: 'Shopping.java', lines: [
        'void main() {',
        '    ShoppingCart cart = new ShoppingCart();',
        '    IO.println(cart.totalCents());   // 0',
        '    cart.add(new Product("Bread", 150));',
        '    cart.add(new Product("Milk", 99));',
        '    cart.add(new Product("Eggs", 250));',
        '    IO.println(cart.count());        // 3',
        '    IO.println(cart.totalCents());   // 499',
        '}',
      ]}],
      claims: [{text: 'Run on Java 25.0.4 with Product.java from Episode 17.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript: the checker refuses null',
      body: ['The same cart with a Product[] and push. Passing null to add is a tsc error before the code runs.'],
      code: [{caption: 'shoppingCart.ts', lines: [
        'class ShoppingCart {',
        '    private items: Product[] = [];',
        '    add(product: Product): void { this.items.push(product); }',
        '    count(): number { return this.items.length; }',
        '    totalCents(): number {',
        '        let total = 0;',
        '        for (const product of this.items) { total += product.priceCents; }',
        '        return total;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'node printed 2 and 249; cart.add(null) was tsc error TS2345.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Give data a home',
    items: [
      'The class that owns the data does the work.',
      'Keep the list private; offer methods.',
      'Check what add accepts.',
      'A class file imports ArrayList.',
      'Challenge: add Rice at 199. Count and total?',
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
