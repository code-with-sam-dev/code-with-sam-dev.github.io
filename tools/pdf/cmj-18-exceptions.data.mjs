/**
 * Complete Modern Java design sheet, episode 18: exceptions, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-06 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep18 and typescript/ep18.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Catch it and keep going.',
  subtitle: 'Complete Modern Java, episode 18: exceptions, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Read a stack trace, catch the problem, and let the program carry on.',
  verifiedOn: '2026-11-07',
  intro: [
    'One product with a negative price stopped the whole program.',
    'try and catch handle the problem, and the program continues after the catch.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['An uncaught exception', 'Reading a stack trace', 'try and catch', 'getMessage()', 'Both paths', 'parseInt and NumberFormatException', 'TypeScript catch and unknown'],
    outTitle: 'Coming next',
    out: ['ArrayList: a list that can grow (episode 19)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['Checkout.java: new Product("Eggs", -5)', 'IllegalArgumentException; nothing after it prints'],
      ['SafeCheckout.java: price -5', 'Could not add eggs: price cannot be negative, Checkout continues'],
      ['SafeCheckout.java: price 30', 'Added Eggs, Checkout continues'],
      ['Quantity.java: "two", then "2"', 'Not a number: two, then Quantity: 2'],
      ['store.ts: e.message', 'tsc TS18046: e is of type unknown'],
      ['parse.ts: parseInt("two")', 'NaN (no exception)'],
    ],
  },
  sections: [
    {
      id: 'trace',
      title: 'Read the trace from the top',
      body: [
        'The first line is the kind of problem and the message. The top "at" line is where it was thrown; the lines below show how the program got there.',
        'Here: main (line 2) called the constructor, which called setPriceCents (line 20), which threw.',
      ],
      code: [{caption: 'java Checkout.java', lines: [
        'Exception in thread "main" java.lang.IllegalArgumentException: price cannot be negative',
        '    at Product.setPriceCents(Product.java:20)',
        '    at Product.<init>(Product.java:7)',
        '    at Checkout.main(Checkout.java:2)',
      ]}],
      claims: [{text: 'Printed exactly this trace with Episode 17\'s Product.java.', source: RUN}],
    },
    {
      id: 'catch',
      title: 'try and catch',
      body: [
        'At the throw, Java leaves the try block at once, runs the matching catch, then carries on after it, never back at the failed line.',
        'Catching does not make the bad value good: eggs were not added. With a good price, the catch is skipped.',
      ],
      code: [{caption: 'SafeCheckout.java', lines: [
        'void main() {',
        '    try {',
        '        Product eggs = new Product("Eggs", -5);',
        '        IO.println("Added " + eggs.getName());',
        '    } catch (IllegalArgumentException e) {',
        '        IO.println("Could not add eggs: " + e.getMessage());',
        '    }',
        '    IO.println("Checkout continues");',
        '}',
      ]}],
      claims: [{text: 'Printed Could not add eggs: price cannot be negative, then Checkout continues; with 30, Added Eggs then Checkout continues.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript: check what you caught',
      body: ['JavaScript can throw anything, so the caught value is unknown: check it is an Error before reading message. parseInt("two") returns NaN instead of throwing.'],
      code: [{caption: 'store.ts', lines: [
        'try {',
        '    const eggs = new Product("Eggs", -5);',
        '    console.log("Added " + eggs.name);',
        '} catch (e) {',
        '    if (e instanceof Error) {',
        '        console.log("Could not add eggs: " + e.message);',
        '    }',
        '}',
        'console.log("Checkout continues");',
      ]}],
      claims: [{text: 'Without the check, tsc reported TS18046; with it, tsc was quiet and node printed both lines.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, November 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Handle a problem',
    items: [
      'Read the type and message first.',
      'The top "at" line: where it was thrown.',
      'try the risky lines; catch the kind of problem.',
      'The program continues after the catch.',
      'Challenge: One, parseInt("two"), Two in try; Caught; Three. What prints?',
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
