/**
 * Complete Modern Java design sheet, episode 1: your first Java program, explained.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-18, from the course repository with Java 25 (Corretto
 * 25.0.4), Node 24.22.0 and TypeScript 7.0.2: the receipt, both errors, "2one" and "$NaN", and the
 * challenge answer. The commands are in the repository README.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-18: Java 25, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'How does code run?',
  subtitle: 'Complete Modern Java, episode 1: your first Java program, explained',
  kicker: 'For complete beginners',
  strapline: 'You write instructions as source code. Tools check them and run them. A program can run and still be wrong.',
  verifiedOn: '2026-10-18',

  intro: [
    'Sarah buys two loaves of bread and one carton of milk: three items, $3.99. The same receipt program, in Java and in TypeScript.',
    'Change milk to the word "one". Java refuses to compile. TypeScript reports the same mistake, but by default still writes a file that runs and prints "Items: 2one" and "Total: $NaN".',
  ],

  scope: {
    inTitle: 'In this episode',
    in: ['Source code', 'Compiler and runtime', 'The terminal and the IDE', 'javac, java, tsc, node'],
    outTitle: 'Coming next',
    out: ['Installing Java and IntelliJ (episode 2)', 'Installing Node and TypeScript (episode 3)', 'Errors and the debugger (episode 4)'],
    note: 'At the time of recording: Java 25 LTS, Node 24 LTS, TypeScript 7.',
  },

  scale: {
    title: 'What each run printed',
    note: 'milk = 1 unless stated.',
    rows: [
      ['JAVA', 'Items: 3, Total: $3.99'],
      ['TYPESCRIPT', 'Items: 3, Total: $3.99'],
      ['JAVA, milk = "one"', 'javac: String cannot be converted to int; no .class written'],
      ['TYPESCRIPT, milk = "one"', 'tsc: TS2322, .js still written; node prints Items: 2one, Total: $NaN'],
      ['BOTH, milk = 2', 'Items: 4, Total: $4.98'],
    ],
  },

  sections: [
    {
      id: 'java',
      title: 'Java: compile, then run',
      body: ['A Java 25 compact source file: void main() and nothing around it. javac checks the code and writes GroceryReceipt.class, full of bytecode. java starts the JVM, which runs it. java GroceryReceipt.java does both steps at once.'],
      code: [{caption: 'java/ep01/GroceryReceipt.java', lines: [
        'void main() {',
        '    int bread = 2;',
        '    int milk = 1;',
        '    double breadPrice = 1.50;',
        '    double milkPrice = 0.99;',
        '',
        '    double total = bread * breadPrice + milk * milkPrice;',
        '',
        '    IO.println("Sarah\'s groceries");',
        '    IO.println("Items: " + (bread + milk));',
        '    IO.println("Total: $" + total);',
        '}',
      ]}, {caption: 'terminal', lines: ['javac GroceryReceipt.java', 'java GroceryReceipt']}],
      claims: [{text: 'Items: 3, Total: $3.99', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript: check, write JavaScript, run',
      body: ['tsc checks the types and writes groceryReceipt.js with the types removed. node runs the JavaScript. Node can also run the .ts file directly: it removes the types and does not check them.'],
      code: [{caption: 'typescript/ep01/groceryReceipt.ts', lines: [
        'const bread: number = 2;',
        'const milk: number = 1;',
        'const breadPrice: number = 1.50;',
        'const milkPrice: number = 0.99;',
        '',
        'const total: number = bread * breadPrice + milk * milkPrice;',
        '',
        'console.log("Sarah\'s groceries");',
        'console.log("Items: " + (bread + milk));',
        'console.log("Total: $" + total);',
      ]}, {caption: 'terminal', lines: ['npx tsc groceryReceipt.ts', 'node groceryReceipt.js']}],
      claims: [{text: 'Items: 3, Total: $3.99', source: RUN}],
    },
    {
      id: 'mistake',
      title: 'Both found the mistake. One setup still let it run.',
      body: ['Checking the code, producing a file and running it are three separate steps. Java will not produce the file. tsc, by default, reports the error and still writes it; --noEmitOnError stops that. A number plus text joins them as text (2 + "one" is "2one"), and text times a price is NaN, not a number.'],
      code: [{caption: 'the change', lines: ['int milk = "one";            // Java', 'const milk: number = "one";  // TypeScript']}],
      claims: [{text: 'javac: incompatible types: String cannot be converted to int. tsc: TS2322, then node printed Items: 2one, Total: $NaN', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Java 25 LTS, Node.js 24 LTS, TypeScript 7.0.',

  checklist: {
    title: 'Check yourself',
    items: [
      'What does javac write, and what runs it?',
      'What does tsc write, and what runs it?',
      'Why did TypeScript still produce a file?',
      'Why "2one", and why NaN?',
      'If milk goes from 1 to 2, what prints? (Items: 4, Total: $4.98)',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The code, and the commands for every output: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
    {label: 'JEP 512: Compact Source Files and Instance Main Methods', url: 'https://openjdk.org/jeps/512'},
    {label: 'Node.js: running TypeScript natively', url: 'https://nodejs.org/api/typescript.html'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Node.js is a trademark of the OpenJS Foundation. TypeScript is a ' +
    'trademark of Microsoft. IntelliJ IDEA is a trademark of JetBrains. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
