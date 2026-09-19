/**
 * Spring to Node, Episode 0 design sheet: the toolchain install.
 *
 * EVERY VERSION AND EVERY COMMAND OUTPUT HERE CAME OUT OF A REAL RUN on
 * 2026-09-19, transcribed in the course repository as VERIFIED-INSTALL-LOG.md.
 * That matters more for this sheet than for most: the whole point of the
 * episode is that a setup guide assembled from memory is wrong, and nine
 * things in this one contradict what a guide written from memory would say.
 *
 * NO ANTHROPIC TRADEMARK BLOCK HERE. This course is about Node, TypeScript,
 * NestJS and Spring, and the boilerplate from the Claude Code sheets would be
 * naming products this sheet never mentions.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run on a real machine, 2026-09-19. See VERIFIED-INSTALL-LOG.md in the course repository.',
  NODE: 'nodejs.org/en/download, checked 2026-09-19',
  INITIALIZR: 'start.spring.io metadata endpoint, checked 2026-09-19',
  JUDGEMENT: 'A judgement, not a documented fact.',
};

const PERISHABLE =
  'Every version on this sheet was current on 19 September 2026 and will not ' +
  'stay current. The method is the durable part: check the source, run the ' +
  'command, and write down what actually came back.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'The Toolchain, From Nothing Installed',
  subtitle: 'Spring Boot to TypeScript, episode 0',
  kicker: 'For Java developers who have never touched the Node ecosystem',
  strapline: 'Every tutorial starts at minute three, on a machine that already has everything.',
  verifiedOn: '2026-09-19',

  intro: [
    'This is the part before that. Node, npm, npx, TypeScript, tsconfig, and only then NestJS, in that order, with nothing assumed.',
    'The demonstration that matters is halfway through: compile a TypeScript file, open the JavaScript it produced, and watch the type disappear. Node runs JavaScript and has never seen TypeScript in its life.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The layers: TypeScript compiles to JavaScript, which runs on Node',
      'Choosing a Node version deliberately, and a version manager',
      'A plain Node project before any framework',
      'TypeScript as a project-local dev dependency, and what npx is',
      'tsconfig, and only the options this backend actually uses',
      'Compiling, reading the output, and breaking it on purpose',
      'npm scripts, and where the Maven analogy stops',
      'NestJS last, once the ground under it is understood',
      'Both applications answering the same endpoint',
    ],
    outTitle: 'Out of scope',
    out: [
      'Databases and persistence, which come later in the course',
      'Validation and error handling, which get their own episodes',
      'Deployment beyond a local docker compose',
      'Any framework comparison beyond the shapes that transfer',
    ],
    note: 'Installation comes before application code. That ordering is the episode.',
  },

  scale: {
    title: 'The versions this course pins, and what most tutorials still say',
    note: 'Checked against the official sources on the day, not remembered. The right hand column is the trap.',
    rows: [
      ['Node LTS', '24.21.0 (tutorials often say 18 or 20)'],
      ['npm', '11.19.0, ships with that Node'],
      ['TypeScript', '7.0.2 (most material assumes 5.x)'],
      ['Java', '21 LTS'],
      ['Spring Boot', '4.1.1 (Initializr REFUSES 3.5.6)'],
      ['Everything else', 'check it on the day you start'],
    ],
  },

  sections: [
    {
      id: 'layers',
      title: 'Four separate things, and people conflate them',
      body: [
        'You write Java, javac makes bytecode, the JVM runs it, and Spring Boot is a framework on top. The other column has the same shape: you write TypeScript, tsc makes JavaScript, Node runs it, NestJS is a framework on top.',
        'Say it plainly, because getting this wrong is the biggest single source of confusion arriving from Java: Node is not TypeScript. Node is not NestJS. TypeScript is not Node. NestJS is not Node.',
        'You install them separately, in that order.',
      ],
      claims: [
        {text: 'Node is the runtime. npm is the package manager, and it ships with Node rather than being installed separately.', source: SRC.RUN},
        {text: 'The JVM-and-Maven comparison is approximate: Maven is a build tool with a lifecycle, npm is closer to a dependency installer with a script runner attached.', source: SRC.JUDGEMENT},
      ],
    },
    {
      id: 'versions',
      title: 'Check the version, do not copy it',
      body: [
        'The official download page gives the current long term support release. On the day this was recorded that was 24.21.0, and installing it brought npm 11.19.0 with it.',
        'Install through a version manager rather than a system installer, because one project will eventually need a different version from another. If SDKMAN is your instinct from Java, that instinct is right even though the tools are not equivalent.',
        'Write both numbers in your README, and commit a version file so the repository helps the next person onto the right one.',
      ],
      claims: [
        {text: 'Node 24.21.0 was the current LTS, and 26.9.0 the current release, on 19 September 2026.', source: SRC.NODE},
        {text: 'nvm install 24 reported: Now using node v24.21.0 (npm v11.19.0).', source: SRC.RUN},
      ],
    },
    {
      id: 'the-payoff',
      title: 'The four second demonstration',
      body: [
        'Write a file with a Payment type: an id, an amount that is a number, a currency. Compile it. Open the JavaScript that came out.',
        'The type is gone. Not renamed, not compiled into a class, not stored elsewhere. There is no Payment type in that file, because there is no such thing at runtime.',
        'Then break it on purpose. Put a string where the number belongs and the compiler stops you with TS2322. Fix it, compile again, and the generated JavaScript is identical to before. The types worked, and then they vanished.',
      ],
      claims: [
        {text: 'After compiling, dist/index.js contains the object literal and the log line, and no trace of the declared type.', source: SRC.RUN},
        {text: "The deliberate error reproduces as: error TS2322: Type 'string' is not assignable to type 'number'.", source: SRC.RUN},
        {text: 'Because annotations are erased, data arriving at runtime is unchecked. Validation at the edges is separate code you have to write.', source: SRC.JUDGEMENT},
      ],
    },
    {
      id: 'surprises',
      title: 'Four things that will make you think you broke something',
      body: [
        'Run npm init -y in a directory called node-basics and the package is named "basics". npm strips the node prefix.',
        'Run tsc --init and the generated config sets no root directory and no output directory. The compiler has no idea where to put anything until you say.',
        'Generate a fresh NestJS project and it writes a vitest config and an oxlint config, not jest and eslint. Tutorials describing jest.config are not wrong, they are old.',
        'Ask Spring Initializr for Boot 3.5.6 and it refuses outright: the compatibility range is 4.0.0 and above.',
      ],
      claims: [
        {text: 'npm init -y in node-basics produced "name": "basics".', source: SRC.RUN},
        {text: 'A fresh Nest project generated vitest.config.ts, vitest.config.e2e.ts and .oxlintrc.json.', source: SRC.RUN},
        {text: "Initializr returned: Invalid Spring Boot version '3.5.6', Spring Boot compatibility range is >=4.0.0.", source: SRC.INITIALIZR},
        {text: 'Initializr version ids carry a legacy .RELEASE suffix that is not the Maven coordinate. Passing 4.1.1.RELEASE writes an unresolvable parent POM; the coordinate is 4.1.1.', source: SRC.RUN},
      ],
    },
    {
      id: 'gitignore',
      title: 'Ten thousand six hundred and seventy five, against forty six',
      body: [
        'node_modules is generated, enormous, and rebuildable from one command, so it never goes into version control.',
        'Measured on the repository for this course rather than asserted: without an ignore file git offered to track 10,675 files. With one, 46.',
        'The lock file is the opposite case. It records the exact versions that were installed and it is what makes a clone reproducible, so that one is committed.',
      ],
      claims: [
        {text: 'git offered to track 10,675 files without .gitignore and 46 with it, in the same project, in the same minute.', source: SRC.RUN},
        {text: 'A fresh clone then runs: mvn test 2 passing, npm ci, npm test 2 passing.', source: SRC.RUN},
      ],
    },
  ],

  checklist: {
    title: 'Before you write any application code',
    items: [
      'node --version and npm --version both answer',
      'You opened the REPL and ran something in it',
      'Your Node version came from the official site today, not a blog post',
      'A version file is committed so the repository helps the next person',
      'TypeScript is a dev dependency, not a global install',
      'You have opened the generated JavaScript at least once',
      'You have seen a compile error and fixed it',
      'node_modules is ignored and the lock file is committed',
      'A fresh clone builds and tests without you explaining anything',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Node.js downloads', url: 'https://nodejs.org/en/download'},
    {label: 'NestJS docs', url: 'https://docs.nestjs.com'},
    {label: 'Spring Initializr', url: 'https://start.spring.io'},
  ],
  trademarks:
    'Node.js is a trademark of the OpenJS Foundation. Java is a trademark of ' +
    'Oracle. Spring and Spring Boot are trademarks of Broadcom. NestJS and ' +
    'TypeScript are the property of their respective owners. This is an ' +
    'independent, unofficial guide produced by Code with Sam, not affiliated ' +
    'with or endorsed by any of them, and no third party artwork is ' +
    'reproduced here.',
  closing: CLOSING,
};
