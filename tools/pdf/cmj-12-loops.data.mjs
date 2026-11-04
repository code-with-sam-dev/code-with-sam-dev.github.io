/**
 * Complete Modern Java design sheet, episode 12: loops, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-24, in the student home folder: Java 25 (Temurin
 * 25.0.4.1), Node 24.22.1, TypeScript 7.0.2. The files are in the repository: java/ep12 and
 * typescript/ep12.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-10-24: Java 25.0.4.1, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '100 lines or 3?',
  subtitle: 'Complete Modern Java, episode 12: loops, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'A loop repeats work with three parts: start, keep going while, move on.',
  verifiedOn: '2026-10-24',
  intro: [
    'A countdown by hand is four lines; from a hundred, a hundred and one.',
    'A loop repeats the work. Forget the move-on part, and it never ends.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['while loops', 'The infinite loop and Ctrl+C', 'for loops and i++', '0 to < 3', 'Running totals with +='],
    outTitle: 'Coming next',
    out: ['Methods (episode 13)', 'Arrays and lists (later)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each loop printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['while (count > 0), count from 3', '3 2 1 Go!'],
      ['while with no update', 'never finishes (Ctrl+C)'],
      ['for (int i = 1; i <= 3; i++)', 'Item 1 Item 2 Item 3'],
      ['for (int i = 0; i < 3; i++)', '0 1 2'],
      ['three loaves, totalCents += 150', '450'],
      ['TypeScript: the same two loops', '3 2 1 Go! Item 1 Item 2 Item 3'],
    ],
  },
  sections: [
    {
      id: 'java',
      title: 'while and for',
      body: [
        'The check runs before every repetition. False at the start? The body never runs.',
        'for puts start, check and update on one line. i++ adds one after each repetition.',
      ],
      code: [{caption: 'Countdown.java and Repeat.java', lines: [
        'int count = 3;',
        'while (count > 0) {',
        '    IO.println(count);',
        '    count = count - 1;',
        '}',
        'for (int i = 1; i <= 3; i++) {',
        '    IO.println("Item " + i);',
        '}',
      ]}],
      claims: [{text: 'Printed 3 2 1 Go!, then Item 1, Item 2, Item 3.', source: RUN}],
    },
    {
      id: 'total',
      title: 'A running total',
      body: ['Start at 0 and add each time round. += adds to the variable.'],
      code: [{caption: 'Loaves.java', lines: [
        'int totalCents = 0;',
        'int breadPriceCents = 150;',
        'for (int i = 1; i <= 3; i++) {',
        '    totalCents += breadPriceCents;',
        '}',
        'IO.println(totalCents);   // 450',
      ]}],
      claims: [{text: 'Printed 450.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording, October 2026: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Before you run a loop',
    items: [
      'Where does it start?',
      'When does it keep going?',
      'What moves it towards the end?',
      'Stuck? Ctrl+C in the terminal.',
      'Challenge: predict for (int i = 2; i <= 6; i += 2).',
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
