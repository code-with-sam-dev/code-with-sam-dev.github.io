/**
 * Complete Modern Java design sheet, episode 4: read your first errors in Java and TypeScript.
 *
 * EVERY MESSAGE HERE WAS RUN, on 2026-10-23, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The challenge files were run before and after each
 * fix. The files are in the repository: java/ep04 and typescript/ep04.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-23: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'cannot find symbol?',
  subtitle: 'Complete Modern Java, episode 4: read your first errors in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'An error is a clue, not a failure. Read the message, find the line, change one thing, run again.',
  verifiedOn: '2026-10-23',

  intro: [
    'We broke the grocery receipt on purpose, in Java and in TypeScript, and read every message it produced.',
    'Where an error appears tells you which kind you have: before the program runs, while it runs, or never.',
  ],

  scope: {
    inTitle: 'In this episode',
    in: ['Syntax and compile errors', 'Runtime errors and the stack trace', 'Logic errors: no message at all', 'One habit for every error'],
    outTitle: 'Coming next',
    out: ['The debugger (episode 5)', 'try and catch (a later module)', 'Tests (later in the course)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, TypeScript 7.0.2.',
  },

  scale: {
    title: 'Four kinds of error',
    note: 'Each one broken, read, fixed and run again, in IntelliJ\'s terminal.',
    rows: [
      ['Syntax, Java', "error: ';' expected. Nothing runs."],
      ['Syntax, TypeScript', "TS1005: ')' expected. Node refuses too."],
      ['Compile, Java', 'cannot find symbol, then symbol: and location:'],
      ['Compile, TypeScript', "TS2551 ... Did you mean 'toUpperCase'? Node runs it and crashes."],
      ['Runtime, Java', 'NumberFormatException: For input string: "one"'],
      ['Runtime, TypeScript', 'No crash: Milk: NaN'],
      ['Logic, both', 'Total: $4.99, no message at all'],
    ],
  },

  sections: [
    {
      id: 'read',
      title: 'Read the parts of a message',
      body: [
        'The file, the line, in TypeScript the column and an error code, then the message in words and the line itself with the spot marked.',
        'The location is where the compiler noticed the problem, not always where it was made. If the line it names looks fine, look at the line above.',
      ],
      code: [{caption: 'java src/GroceryReceipt.java', lines: [
        "src/GroceryReceipt.java:2: error: ';' expected",
        '    int bread = 2',
        '                 ^',
        '1 error',
        'error: compilation failed',
      ]}],
      claims: [{text: "tsc reported the missing ) as groceryReceipt.ts:9:39 - error TS1005: ')' expected.", source: RUN}],
    },
    {
      id: 'check',
      title: 'Check first, then run',
      body: ['Node does not read types. It runs the file and finds a problem only when it reaches it. The compiler reads the whole file first.'],
      code: [{caption: 'typo.ts', lines: [
        'const customer: string = "Sarah";',
        'console.log(customer.toUppercase() + "\'s groceries");',
        '',
        '// npx tsc --noEmit typo.ts',
        "// TS2551: ... Did you mean 'toUpperCase'?",
        '// node typo.ts',
        '// TypeError: customer.toUppercase is not a function',
      ]}],
      claims: [{text: 'Java reports the same typo before running: cannot find symbol, symbol: method toUppercase(), location: variable customer of type String.', source: RUN}],
    },
    {
      id: 'trace',
      title: 'Read a stack trace',
      body: ['First the top line: the exception and its message. Then the first line from your own code. The lines above it are Java\'s own code, the path the problem took.'],
      code: [{caption: 'java src/Runtime.java', lines: [
        'Exception in thread "main" java.lang.NumberFormatException: For input string: "one"',
        '    at java.base/java.lang.NumberFormatException.forInputString(...)',
        '    at java.base/java.lang.Integer.parseInt(Integer.java:565)',
        '    at java.base/java.lang.Integer.parseInt(Integer.java:662)',
        '    at Runtime.main(Runtime.java:3)    <- start here',
      ]}],
      claims: [{text: 'Number("one") in TypeScript does not crash: it is NaN, and the program prints Milk: NaN.', source: RUN}],
    },
    {
      id: 'logic',
      title: 'Predict before you run',
      body: ['A logic error has no message. The compiler cannot know what the receipt should total. Work it out first: 2 x $1.50 + 1 x $0.99 = $3.99.'],
      code: [{caption: 'one character', lines: [
        'double total = bread * breadPrice + milk * milkPrice;   // $3.99',
        'double total = bread * breadPrice + milk + milkPrice;   // $4.99, no error',
      ]}],
      claims: [{text: 'Both languages printed Total: $4.99 with exit code 0, and tsc --noEmit was quiet.', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, TypeScript 7.0.2, IntelliJ IDEA 2026.1.',

  checklist: {
    title: 'One habit for every error',
    items: [
      'Read the main message: the error name, and its words.',
      'Find the location. In a stack trace, the first line from your code.',
      'Open that line, and the line above it.',
      'Change one thing, and run it again.',
      'Challenge: fix BrokenReceipt.java and brokenReceipt.ts until both print Total: $3.99.',
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
