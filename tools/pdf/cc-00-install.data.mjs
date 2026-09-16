/**
 * The Claude Code Episode 0 design sheet: install and first session.
 *
 * Every command was read out of the official quickstart on 2026-09-16, and the
 * doctor claim was verified by RUNNING doctor rather than by reading the doc,
 * because the documentation only promises "install health" while this sheet
 * claims it names the install method and the auto-update state. It prints both.
 *
 * THE PAGE THAT EARNS THE SHEET is the wrong-shell table. Somebody hitting that
 * error is searching for those exact words right now, and every result explains
 * something else. Two error strings and two prompt shapes answer it completely,
 * and that is worth keeping on a page after the video is closed.
 *
 * AN INSTALL SHEET GOES STALE FASTER THAN ANY OTHER KIND, which is why the date
 * is at the top rather than in a footnote.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Claude Code: Install',
  subtitle: 'From nothing installed to your first commit',
  kicker: 'For software engineers: the ten minutes nobody documents',
  strapline:
    'The right command, run in the wrong shell, fails with an error that never says which shell it wanted.',
  verifiedOn: '2026-09-16',

  intro: [
    'This is the half of getting started that every guide skips, because it seems too obvious to write down. It is also where people lose an afternoon.',
    'Four things are on this page: the one line for your shell, the error that does not say what is wrong, the command that tells you whose job upgrading is, and the five commands that are your entire first week.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The three native install lines, and how to tell which one is yours',
      'The two error messages, decoded, and what your prompt already told you',
      'Which routes update themselves and which make it your job',
      'Verifying the install before you build anything on top of it',
      'The five commands that cover the first week',
    ],
    outTitle: 'Out of scope',
    out: [
      'Prompting technique, which is the rest of the series',
      'Any claim about a plan or price. Those move faster than this page can',
      'IDE and editor integrations, which each deserve their own walkthrough',
      'Enterprise gateway and policy setup',
    ],
    note:
      'If you read one section, read the wrong-shell one. It is the only thing here that is actively costing somebody time today.',
  },

  scale: {
    title: 'The wrong shell, decoded',
    note:
      'Neither message says "wrong shell". Your prompt already did, and that is the whole fix.',
    rows: [
      ["The token '&&' is not a valid statement separator", 'You are in PowerShell. You ran the CMD line'],
      ["'irm' is not recognized as an internal or external command", 'You are in CMD. You ran the PowerShell line'],
      ['PS C:\\> in front of your prompt', 'PowerShell. Use the irm line'],
      ['C:\\> with no PS', 'CMD. Use the curl install.cmd line'],
      ['macOS, Linux, WSL', 'curl -fsSL https://claude.ai/install.sh | bash'],
      ['Native Windows, additionally', 'Install Git for Windows, or it falls back to PowerShell as its shell'],
    ],
  },

  sections: [
    {
      id: 'install',
      title: 'One line, and it has to be the right one',
      body: [
        'macOS, Linux and Windows Subsystem for Linux: curl the install script and pipe it to bash.',
        'Windows PowerShell: irm the install script and pipe it to iex.',
        'Windows CMD: curl the installer down, run it, delete it.',
        'The native route is the recommended one, and it has a property the others do not: it updates itself in the background.',
      ],
      claims: [
        {
          text: 'The native install is presented as the recommended method, and native installations automatically update in the background to keep you on the latest version.',
          source: SRC.OVERVIEW,
        },
        {
          text: 'Git for Windows is recommended on native Windows so the Bash tool can be used; without it PowerShell is used as the shell tool instead, and WSL setups do not need it.',
          source: SRC.OVERVIEW,
        },
      ],
    },
    {
      id: 'managed',
      title: 'The package manager routes, and what they cost',
      body: [
        'Homebrew has a cask, WinGet has a package, and apt, dnf and apk cover Debian, Fedora, Red Hat and Alpine.',
        'None of them auto-update. Upgrading becomes your job, and if you forget you can sit several versions behind for months without knowing.',
        'Homebrew has one more wrinkle worth choosing deliberately. There are two casks: the plain one tracks the stable channel, roughly a week behind, skipping releases that had a major regression. The at-latest one ships the day a release does.',
      ],
      claims: [
        {
          text: 'Homebrew and WinGet installations do not auto-update and must be upgraded manually.',
          source: SRC.OVERVIEW,
        },
        {
          text: 'The claude-code cask tracks the stable release channel, typically about a week behind and skipping releases with major regressions, while claude-code@latest receives new versions as soon as they ship.',
          source: SRC.OVERVIEW,
        },
      ],
    },
    {
      id: 'verify',
      title: 'Prove it worked before you build on it',
      body: [
        'claude --version prints a version number followed by Claude Code in brackets. No brackets, or command not found, and either the install did not finish or your path found something else first.',
        'Then run claude doctor, which almost nobody does. It reports the install method it believes it used, and whether auto-updates are switched on.',
        'That answers the question you will actually have in three months, which is: which route did I take, and am I responsible for upgrading this thing.',
      ],
      claims: [
        {
          text: 'claude --version prints a version number followed by "(Claude Code)".',
          source: SRC.OVERVIEW,
        },
        {
          text: 'claude doctor prints read-only installation and settings diagnostics without starting a session, including install health.',
          source: SRC.OVERVIEW,
        },
        {
          text: 'Run on the machine that built this sheet, doctor printed "Config install method: native" and "Auto-updates: enabled", which is the specific output this page relies on.',
          source: 'Run on the machine that built this sheet, not quoted',
        },
      ],
    },
    {
      id: 'login',
      title: 'Logging in, and the behaviour that confuses API users',
      body: [
        'Type claude on its own and it prompts you the first time, completing in your browser. Subscription, Console, or a cloud provider.',
        'The one to know about: if ANTHROPIC_API_KEY is already set in your shell, you get no login prompt at all. It asks you to approve that key instead. If you expected a browser window and got a question about a key, that variable is why.',
        'Credentials are stored, so it is a one off. Type /login inside a session to switch accounts later.',
      ],
      claims: [
        {
          text: 'If the ANTHROPIC_API_KEY environment variable is set, the login prompt is skipped and you are asked to approve the key instead.',
          source: SRC.OVERVIEW,
        },
        {
          text: 'Once logged in, credentials are stored and you will not need to log in again.',
          source: SRC.OVERVIEW,
        },
      ],
    },
    {
      id: 'first-session',
      title: 'Where the first ten minutes actually go',
      body: [
        'Not prompting. The folder. Start a session and there is a line above the prompt showing the version, the model, and the working directory.',
        'Read the working directory line every single time. It reads your project files as it needs them, and only the ones where you started it. Start in your home folder, ask what this project does, and the tool looks broken when it was simply pointed at nothing.',
        'Two that nobody discovers alone: Tab completes a command you have started, and the up arrow walks your history, exactly like a shell.',
      ],
      claims: [
        {
          text: 'The prompt is shown with the version, current model and working directory above it, and files are read as needed rather than added manually.',
          source: SRC.OVERVIEW,
        },
      ],
    },
    {
      id: 'permissions',
      title: 'Who decides whether that edit is allowed',
      body: [
        'On Pro, Max and Team, interactive terminal sessions start in auto mode: a classifier reviews the actions instead of you, so most edits and commands happen without stopping to ask. On other plans, sessions start in manual mode.',
        'Your settings, or your organisation, can change which mode a session starts in.',
        'Shift and Tab together cycles the mode of the session you are in. Learn it now, because the moment you want it is the moment something is about to touch a file you care about.',
      ],
      claims: [
        {
          text: 'Auto mode is the built-in starting permission mode for interactive terminal sessions on Pro, Max and Team plans; on other plans Manual mode is the starting mode.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'Pressing Shift+Tab at any time switches the permission mode of the current session.',
          source: SRC.PERMISSIONS,
        },
      ],
    },
    {
      id: 'first-task',
      title: 'Ask before you instruct, and the order is the lesson',
      body: [
        'Start with questions: what does this project do, where is the main entry point, what technologies does it use. You get a useful answer AND a look at how it explores your codebase, which tells you whether you started it in the right place.',
        'Then change something small and obvious, so you can tell instantly whether it worked.',
        'Then use it for the thing people take months to discover, which is git. What files have I changed. Commit my changes with a descriptive message. Create a branch. You are talking to it the way you would talk to a colleague looking at the same screen.',
      ],
      claims: [
        {
          text: 'Git operations are conversational, covering changed files, commits, branches, history and merge conflicts.',
          source: SRC.OVERVIEW,
        },
      ],
    },
  ],

  checklist: {
    title: 'Your first week, in ten checks',
    items: [
      'Which shell am I actually in, and does my prompt show PS?',
      'Did claude --version print the brackets?',
      'What did claude doctor say my install method was?',
      'Are auto-updates its job or mine?',
      'On Homebrew, am I on the stable cask or at-latest?',
      'On native Windows, is Git for Windows installed?',
      'Is ANTHROPIC_API_KEY set in my shell, and did I mean it to be?',
      'Am I reading the working directory line before I type?',
      'Do I know which permission mode this session started in?',
      'Can I get out with /exit without looking it up?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('quickstart', 'Quickstart')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
