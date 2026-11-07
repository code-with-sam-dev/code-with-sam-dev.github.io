/**
 * Complete Modern Java design sheet, episode 22: HashMap, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep22 and typescript/ep22.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Stop searching your list.',
  subtitle: 'Complete Modern Java, episode 22: HashMap, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Link each name to its product, find it with one call, and handle a name that is not there.',
  verifiedOn: '2026-11-07',
  intro: [
    'A list keeps items in positions; finding Milk by name meant checking each one.',
    'A map links each key to a value: get with the key gives back the value, without a search loop.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['HashMap<String, Product>', 'put and get', 'One value per key', 'remove', 'A missing key: null', 'containsKey', 'TypeScript Map'],
    outTitle: 'Coming next',
    out: ['Looping through a map (episode 23)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['put three; size(); get("Milk")', '3, 99'],
      ['put("Milk", 120) again; size()', '120, 3'],
      ['remove("Eggs"); size()', '2'],
      ['containsKey("Rice"); get("Rice")', 'false, null'],
      ['rice.getPriceCents()', 'NullPointerException'],
      ['catalog.ts: size, Milk, has Rice, get Rice', '3, 99, false, undefined'],
    ],
  },
  sections: [
    {
      id: 'map',
      title: 'Key and value',
      body: [
        'The first type is the key (a name), the second the value (a product). put links them; get finds the value by its key.',
        'Putting the same key again replaces the value: the key now points to a different product. A HashMap does not promise insertion order.',
      ],
      code: [{caption: 'Catalog.java', lines: [
        'HashMap<String, Product> catalog = new HashMap<>();',
        'catalog.put("Bread", new Product("Bread", 150));',
        'catalog.put("Milk", new Product("Milk", 99));',
        'catalog.put("Eggs", new Product("Eggs", 250));',
        'IO.println(catalog.size());                    // 3',
        'Product milk = catalog.get("Milk");',
        'IO.println(milk.getPriceCents());              // 99',
        'catalog.put("Milk", new Product("Milk", 120));',
        'IO.println(catalog.get("Milk").getPriceCents());   // 120',
        'IO.println(catalog.size());                    // 3',
      ]}],
      claims: [{text: 'Printed 3, 99, 120, 3; after remove("Eggs"), 2.', source: RUN}],
    },
    {
      id: 'missing',
      title: 'A name that is not there',
      body: ['get returns null for a missing key, and asking null for its price throws. Check with containsKey first.'],
      code: [{caption: 'Safe.java', lines: [
        'if (catalog.containsKey("Rice")) {',
        '    Product rice = catalog.get("Rice");',
        '    IO.println(rice.getPriceCents());',
        '} else {',
        '    IO.println("Rice is not in the catalog");',
        '}',
      ]}],
      claims: [{text: 'Without the check: null, then NullPointerException. With it: Rice is not in the catalog.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript Map',
      body: ['put is set, containsKey is has, remove is delete, size is a property, and a missing key gives undefined.'],
      code: [{caption: 'catalog.ts', lines: [
        'const catalog = new Map<string, Product>();',
        'catalog.set("Milk", new Product("Milk", 99));',
        'const milk = catalog.get("Milk");',
        'if (milk !== undefined) {',
        '    console.log(milk.priceCents);   // 99',
        '}',
        'console.log(catalog.get("Rice"));   // undefined',
      ]}],
      claims: [{text: 'tsc was quiet; node printed 3, 99, false, undefined.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Use a map',
    items: [
      'Look things up by a name? A map.',
      'put links a key to a value; get finds it.',
      'One value per key: put again replaces.',
      'Missing key: null (Java) or undefined (TypeScript). Check first.',
      'Challenge: Coffee at 350, then Tea without crashing.',
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
