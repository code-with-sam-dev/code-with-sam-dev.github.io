/**
 * Complete Modern Java design sheet, episode 5: use the debugger in Java and TypeScript.
 *
 * EVERY MESSAGE HERE WAS RUN, on 2026-10-23, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The challenge files were run before and after each
 * fix. The files are in the repository: java/ep05 and typescript/ep05.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-23: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Wrong answer. No error.',
  subtitle: 'Complete Modern Java, episode 5: use the debugger in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'Predict, pause, inspect, step, explain, fix. A debugger shows what your code does; you know what it should do.',
  verifiedOn: '2026-10-23',
  intro: [
    'The receipt prints Total: $4.99 with no error. It should be $3.99.',
    'We stopped it halfway with a breakpoint, in Java and in TypeScript, and watched the wrong number appear.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['Breakpoints: Run versus Debug', 'Pausing before a line runs', 'Step Over, Resume, Stop', 'Free TypeScript debugging'],
    outTitle: 'Coming next',
    out: ['Values and types (episode 6)', 'Step Into (with methods, later)', 'Tests (later in the course)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What the debugger showed',
    note: 'Paused on the total line, then one Step Over.',
    rows: [
      ['Run, with a breakpoint', 'Ignored: Total: $4.99'],
      ['Debug, paused on the line', 'bread 2, milk 1, breadPrice 1.5, milkPrice 0.99, no total'],
      ['Step Over', 'total = 4.99'],
      ['Evaluate milk * milkPrice', '0.99'],
      ['Evaluate milk + milkPrice', '1.99'],
      ['After the fix, Step Over', 'total = 3.99'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'Java in IntelliJ IDEA',
      body: [
        'Click the line number for a breakpoint. Run ignores it; Debug stops on it, before the line runs.',
        'Step Over runs one line. Resume runs to the next breakpoint or the end. Stop ends the session.',
      ],
      code: [{caption: 'the bug', lines: [
        'double total = bread * breadPrice + milk + milkPrice;   // 4.99',
        'double total = bread * breadPrice + milk * milkPrice;   // 3.99',
      ]}],
      claims: [{text: 'Paused on the total line, Variables had no total row: the line had not run yet.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript, free',
      body: ['The free IntelliJ IDEA has no TypeScript debugger. Node\'s inspector and Chrome DevTools are free.'],
      code: [{caption: 'terminal', lines: [
        'node --inspect-brk groceryReceipt.ts',
        '# Chrome: chrome://inspect, then "inspect" under Remote Target',
        '# Sources: click line 6, Resume, read Scope, Step over',
      ]}],
      claims: [{text: 'DevTools showed the .ts file with each type annotation replaced by spaces: what Node runs.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Debug it',
    items: [
      'Predict the answer first.',
      'Set a breakpoint on the line that makes the value, and start with Debug.',
      'Read the variables, then Step Over.',
      'Explain the difference between your prediction and the value.',
      'Challenge: find why the receipt says Items: 4.',
    ],
  },
  links: [
    ...CHANNEL_LINKS,
    {label: 'The code and the challenge files: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Node.js is a trademark of the OpenJS Foundation. TypeScript is a trademark of Microsoft. Chrome is a trademark of Google. IntelliJ IDEA is a trademark of ' +
    'JetBrains. This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
