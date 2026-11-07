/**
 * Complete Modern Java design sheet, episode 23: looping through a HashMap, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep23 and typescript/ep23.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Bread first? Not here.',
  subtitle: 'Complete Modern Java, episode 23: looping through a map, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Three ways through a map: only the keys, only the values, or each key with its value.',
  verifiedOn: '2026-11-07',
  intro: [
    'Bread, Milk, Eggs and Rice went into a HashMap in that order. Printing every name gave Eggs, Bread, Milk, Rice.',
    'A HashMap does not promise to keep the order you added things in. Yours may differ; both are correct.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['keySet()', 'A key, then get', 'values()', 'entrySet() and Map.Entry', 'Order is the map\'s own', 'TypeScript Map loop'],
    outTitle: 'Coming next',
    out: ['static and constants (episode 24)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted. The Java order is what this run produced, not a promise.',
    rows: [
      ['keySet loop', 'Eggs, Bread, Milk, Rice'],
      ['keySet loop with get(name)', 'Eggs: 250, Bread: 150, Milk: 99, Rice: 199'],
      ['values loop, adding the prices', '698'],
      ['entrySet loop', 'Eggs costs 250 ... Rice costs 199'],
      ['menu.ts: for (const entry of catalog)', 'Bread: 150, Milk: 99, Eggs: 250, Rice: 199'],
    ],
  },
  sections: [
    {
      id: 'keys',
      title: 'Only the names: keySet()',
      body: [
        'keySet() gives the keys, and the for-each from episode 15 walks through them. Inside the loop, get(name) finds each product.',
        'It works, but it asks the map again for every name.',
      ],
      code: [{caption: 'Menu.java', lines: [
        'for (String name : catalog.keySet()) {',
        '    Product product = catalog.get(name);',
        '    IO.println(name + ": " + product.getPriceCents());',
        '}',
      ]}],
      claims: [{text: 'Printed Eggs: 250, Bread: 150, Milk: 99, Rice: 199.', source: RUN}],
    },
    {
      id: 'values',
      title: 'Only the products: values()',
      body: ['When you only need the values, loop over values(). Adding one of each product gives 698.'],
      code: [{caption: 'Menu.java', lines: [
        'int totalCents = 0;',
        'for (Product product : catalog.values()) {',
        '    totalCents += product.getPriceCents();',
        '}',
        'IO.println(totalCents);   // 698',
      ]}],
      claims: [{text: 'Printed 698.', source: RUN}],
    },
    {
      id: 'entries',
      title: 'Both at once: entrySet()',
      body: ['Map.Entry is the name Java gives one key with its value. getKey and getValue, without calling get again.'],
      code: [{caption: 'Menu.java', lines: [
        'for (Map.Entry<String, Product> entry : catalog.entrySet()) {',
        '    IO.println(entry.getKey() + " costs " + entry.getValue().getPriceCents());',
        '}',
      ]}],
      claims: [{text: 'Printed Eggs costs 250, Bread costs 150, Milk costs 99, Rice costs 199. No import was needed in the compact file.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript Map',
      body: ['Each entry is a key and a value: entry[0] and entry[1]. A TypeScript Map keeps the order you set things in.'],
      code: [{caption: 'menu.ts', lines: [
        'for (const entry of catalog) {',
        '    const name = entry[0];',
        '    const product = entry[1];',
        '    console.log(name + ": " + product.priceCents);',
        '}',
      ]}],
      claims: [{text: 'tsc was quiet; node printed Bread: 150, Milk: 99, Eggs: 250, Rice: 199.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Loop through a map',
    items: [
      'Only the names? keySet().',
      'Only the values? values().',
      'Both? entrySet(), with getKey and getValue.',
      'Never count on a HashMap\'s order. Need it? LinkedHashMap, later.',
      'Challenge: add Sugar at 180. The values total? 878.',
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
