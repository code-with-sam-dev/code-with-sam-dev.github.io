/**
 * Complete Modern Java design sheet, episode 2: install Java 25 and IntelliJ IDEA on a Mac.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-18, from the course repository with Java 25 (Corretto
 * 25.0.4), Node 24.22.0 and TypeScript 7.0.2: the old terminal Java, the Java 25 download inside IntelliJ, the run,
 * the one-window fix and running from source. The commands are in the repository README.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real Mac, 2026-10-18, in a fresh IntelliJ IDEA with Temurin 25.0.4.1.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Wrong Java?',
  subtitle: 'Complete Modern Java, episode 2: install Java 25 and IntelliJ IDEA on a Mac',
  kicker: 'For complete beginners',
  strapline: 'Installing a JDK does not change which Java your terminal finds. The path does.',
  verifiedOn: '2026-10-18',

  intro: [
    'The terminal on this Mac answered java -version with Java 11, from 2022. Java was installed; the wrong one answered.',
    'We installed IntelliJ IDEA, downloaded Java 25 from inside it, typed and ran the receipt program, then made the terminal find Java 25 too.',
  ],

  scope: {
    inTitle: 'In this episode',
    in: ['The JDK and the IDE', 'Download JDK in IntelliJ', 'Java Compact File and Run', 'PATH and JAVA_HOME, for one window'],
    outTitle: 'Coming next',
    out: ['Windows install (its own episode)', 'Node and TypeScript (episode 3)', 'Making the PATH change permanent (later)'],
    note: 'At the time of recording: Java 25 LTS; IntelliJ IDEA core Java free, no sign in.',
  },

  scale: {
    title: 'What each check printed',
    note: 'Run in IntelliJ\'s terminal on a Mac, 2026-10-18.',
    rows: [
      ['java -version, BEFORE', 'openjdk version "11.0.14.1" 2022-02-08 LTS'],
      ['type -a java', 'java is /usr/bin/java'],
      ['java -version, AFTER the fix', 'openjdk version "25.0.4.1" 2026-08-18 LTS'],
      ['IntelliJ Run', "Sarah's groceries, Items: 3, Total: $3.99, exit code 0"],
      ['Project Structure, SDK', 'temurin-25'],
    ],
  },

  sections: [
    {
      id: 'install',
      title: 'Java 25 from inside IntelliJ',
      body: ['New Project: name GroceryReceipt, build system IntelliJ, untick Add sample code. JDK: Download JDK, version 25, vendor Eclipse Temurin. The dialog shows where Java will live: note it.'],
      code: [{caption: 'the location IntelliJ showed', lines: ['~/Library/Java/JavaVirtualMachines/temurin-25.0.4.1']}],
      claims: [{text: 'Project Structure, SDK: temurin-25', source: RUN}],
    },
    {
      id: 'terminal',
      title: 'Make this terminal find Java 25',
      body: ['The terminal runs the first java on its PATH. Point JAVA_HOME at the JDK and put its bin folder first. This lasts for one window.'],
      code: [{caption: 'terminal', lines: [
        'java -version',
        'type -a java',
        'export JAVA_HOME=$HOME/Library/Java/JavaVirtualMachines/temurin-25.0.4.1/Contents/Home',
        'export PATH="$JAVA_HOME/bin:$PATH"',
        'java -version',
        'java src/GroceryReceipt.java',
      ]}],
      claims: [{text: 'Before: 11.0.14.1. After: 25.0.4.1. The last command printed the receipt.', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Java 25 LTS, IntelliJ IDEA 2026.1.',

  checklist: {
    title: 'Three checks prove your setup',
    items: [
      'The program runs in IntelliJ.',
      'The terminal says Java 25.',
      'java src/GroceryReceipt.java prints the receipt.',
      'Project Structure shows the SDK you downloaded.',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The code and the steps: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
    {label: 'IntelliJ IDEA: SDKs', url: 'https://www.jetbrains.com/help/idea/sdk.html'},
  ],
  trademarks:
    'Java is a trademark of Oracle. IntelliJ IDEA is a trademark of JetBrains. Eclipse Temurin is a trademark of the ' +
    'Eclipse Foundation. This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
