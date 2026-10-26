/**
 * Complete Modern Java design sheet, episode 3: install Node.js and TypeScript on a Mac.
 *
 * EVERY OUTPUT HERE WAS RUN, on 2026-10-23, in a fresh student home folder with no Node and no
 * .zshrc: nvm 0.40.8 from nodejs.org's own commands, Node 24.22.1, npm 11.19.1, TypeScript 7.0.2
 * installed in the project, the receipt compiled and run, and the wrong-type run. The commands are
 * in the repository README.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real Mac, 2026-10-23, in a fresh home folder: nvm 0.40.8, Node 24.22.1, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'node: not found?',
  subtitle: 'Complete Modern Java, episode 3: install Node.js and TypeScript on a Mac',
  kicker: 'For complete beginners',
  strapline: 'nvm installs Node in your home folder. TypeScript goes in the project. Node runs; tsc checks.',
  verifiedOn: '2026-10-23',

  intro: [
    'The terminal on this Mac answered node -v with command not found. No Node, so no TypeScript either.',
    'We installed nvm with the commands from nodejs.org, then Node 24, then TypeScript inside a project, and rebuilt the grocery receipt in TypeScript. No admin password for any of it.',
  ],

  scope: {
    inTitle: 'In this episode',
    in: ['Node, npm, tsc and nvm', 'The .zshrc a new Mac does not have', 'TypeScript installed per project', 'Running is not checking'],
    outTitle: 'Coming next',
    out: ['Windows install (its own episode)', 'Reading errors properly (episode 4)', 'tsconfig.json (later)'],
    note: 'At the time of recording: Node 24 LTS, TypeScript 7.0.2, nvm 0.40.8. Any LTS version works for the course.',
  },

  scale: {
    title: 'What each check printed',
    note: 'Run in IntelliJ\'s terminal on a Mac, 2026-10-23.',
    rows: [
      ['node -v, BEFORE', 'zsh: command not found: node'],
      ['ls ~/.zshrc on a new Mac', 'No such file or directory'],
      ['node -v, AFTER', 'v24.22.1'],
      ['npm -v', '11.19.1'],
      ['which node', '~/.nvm/versions/node/v24.22.1/bin/node'],
      ['npx tsc -v', 'Version 7.0.2'],
      ['node groceryReceipt.js', "Sarah's groceries, Items: 3, Total: $3.99"],
    ],
  },

  sections: [
    {
      id: 'nvm',
      title: 'Install nvm, then Node',
      body: [
        'Take the commands from nodejs.org, Download, macOS, nvm. Piping a script into bash runs it: only do that with a command the tool\'s official site gives you.',
        'Apple\'s command line tools are a separate prerequisite. If xcode-select -p prints an error, xcode-select --install is Apple\'s installer, and it may ask for a password.',
      ],
      code: [{caption: 'terminal', lines: [
        'xcode-select -p',
        'touch ~/.zshrc',
        'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash',
        '# open a new terminal tab',
        'nvm install 24',
        'node -v',
        'npm -v',
      ]}],
      claims: [{text: 'Without ~/.zshrc the installer prints "Profile not found" and a new tab says nvm: command not found.', source: RUN}],
    },
    {
      id: 'project',
      title: 'TypeScript in the project',
      body: ['Each project keeps the TypeScript it was written with. npx runs the project\'s own copy; if a tool is not installed, npx can download it, so read what you npx.'],
      code: [{caption: 'in the project folder', lines: [
        'npm init -y',
        'npm install --save-dev typescript',
        'npx tsc -v',
        'npx tsc groceryReceipt.ts',
        'node groceryReceipt.js',
      ]}],
      claims: [{text: 'package.json records "typescript": "^7.0.2"; package-lock.json records the exact version.', source: RUN}],
    },
    {
      id: 'checking',
      title: 'Running is not checking',
      body: ['Node removes the types and runs what is left. It never checks them. tsc does.'],
      code: [
        {caption: 'groceryReceipt.ts', lines: [
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
        ]},
        {caption: 'with milk = "2"', lines: [
          'node groceryReceipt.ts            # Items: 22, Total: $4.98',
          'npx tsc --noEmit groceryReceipt.ts',
          "# error TS2322: Type 'string' is not assignable to type 'number'.",
        ]},
      ],
      claims: [{text: 'Items: 22 because + joins text; the total looks right because * turns the text back into a number.', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Node 24 LTS, TypeScript 7.0.2, IntelliJ IDEA 2026.1.',

  checklist: {
    title: 'Five checks prove your setup',
    items: [
      'node -v starts with v24.',
      'npm -v prints a version.',
      'npx tsc -v says 7.',
      'npx tsc groceryReceipt.ts finishes with no errors.',
      'node groceryReceipt.js prints the receipt.',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The code and the steps: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
    {label: 'Node.js: Download', url: 'https://nodejs.org/en/download'},
    {label: 'nvm: troubleshooting on macOS', url: 'https://github.com/nvm-sh/nvm#troubleshooting-on-macos'},
  ],
  trademarks:
    'Node.js is a trademark of the OpenJS Foundation. TypeScript is a trademark of Microsoft. IntelliJ IDEA is a trademark of ' +
    'JetBrains. Java is a trademark of Oracle. This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
