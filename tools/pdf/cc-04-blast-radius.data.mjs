/**
 * Claude Code Episode 4 design sheet: permissions, checkpoints, blast radius.
 *
 * Verified 2026-09-13, and CORRECTED the same day. The first version said
 * checkpoints cover "file changes", which is what one page supports and is
 * narrower in another: they cover changes made through Claude's own file
 * editing tools, NOT changes made via Bash. A reader trusting the looser
 * version could lose work, so the sheet states the narrow boundary.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Permissions And Blast Radius',
  subtitle: 'Claude Code deep dive, episode 4',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'You can undo what changed a file. You cannot undo what left the machine.',
  verifiedOn: '2026-09-13',

  intro: [
    'You have an undo, you have pressed it, and it worked. That experience quietly teaches you that mistakes here are cheap. Most of them are.',
    'There is a category this tool can reach that no undo covers, and by the time you notice it has already happened. This sheet is that boundary, drawn precisely.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What checkpoints actually cover, and the narrower-than-expected edge',
      'Why checkpoints and git are two independent histories',
      'The things outside the filesystem entirely',
      'The four permission modes',
      'Which mode you are probably on right now',
      'What plan mode is actually for',
      'Allow-listing, and settings scope',
    ],
    outTitle: 'Out of scope',
    out: [
      'Organisation policy and audit, which is episode 15',
      'Sandboxing configuration in detail',
      'MCP server trust, which is episode 7',
      'Any claim that a permission mode makes an action safe',
    ],
    note: 'The question before any task is not whether you trust the agent. It is what this particular task can reach.',
  },

  scale: {
    title: 'The four modes',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Auto', 'a classifier blocks the risky ones'],
      ['Manual', 'asks before edits and shell commands'],
      ['Accept edits', 'edits and common filesystem commands, no prompt'],
      ['Plan', 'explores and proposes, edits nothing'],
      ['Cycle them with', 'Shift+Tab'],
      ['Default on Pro, Max, Team', 'Auto, for terminal and VS Code'],
    ],
  },

  sections: [
    {
      id: 'checkpoints',
      title: 'The good news, and it is genuinely good',
      body: [
        'Before it edits a file, it snapshots what was there. Press Escape twice to rewind, or ask it to undo.',
        'That is not a git operation and it does not require you to have committed, which matters because the moment you most want an undo is the moment you were halfway through something and had not committed for an hour.',
        'They survive resuming a conversation, so yesterday’s snapshots are still there this morning.',
      ],
      claims: [
        {
          text: 'Before Claude edits a file it snapshots the current contents; pressing Esc twice rewinds to a previous state.',
          source: SRC.HOW,
        },
        {
          text: 'Checkpoints are separate from git and remain available when you resume a conversation.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'the-narrow-edge',
      title: 'The edge is narrower than "file changes"',
      body: [
        'This is the correction worth the whole sheet. Checkpoints track changes made through CLAUDE’S OWN FILE EDITING TOOLS. Changes made through Bash commands, or by any other process, are not captured.',
        'So a fix applied with a stream editor in a shell command is a file change that is NOT in the snapshot.',
        'The documentation is blunt about what follows: this is not a replacement for git. There is one further gap: a restore skips symlinked and hard linked files.',
      ],
      claims: [
        {
          text: 'Checkpoints only track changes made through Claude’s file editing tools. Changes made through Bash commands or external processes are not captured. This isn’t a replacement for git.',
          source: SRC.BEST,
        },
        {
          text: 'A restore skips symlinked and hard-linked files.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'outside-entirely',
      title: 'And everything here is outside it',
      body: [
        'A request sent to an API. A row written to a production database. A deployment triggered. A message posted. An email sent. A package published. A cloud resource created, and billed for.',
        'What they have in common is not that they are dangerous. It is that they are outside your filesystem, and a snapshot of your files cannot reach any of them.',
        'You control those with your permission mode and your permission rules instead.',
      ],
      claims: [
        {
          text: 'Actions that affect remote systems, such as databases, APIs and deployments, cannot be checkpointed; you control those with your permission mode and permission rules.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'auto-mode',
      title: 'The mode you are probably on',
      body: [
        'At the time of writing, Auto is the built-in starting mode on Pro, Max and Team plans for interactive terminal and VS Code sessions.',
        'A classifier reviews most actions in the background and blocks the risky ones rather than stopping to ask you about each.',
        'That is a reasonable default, and it is worth understanding what it means: you are not being asked, by design. Fewer prompts is not evidence that nothing consequential is happening.',
      ],
      claims: [
        {
          text: 'In Auto mode a classifier reviews most actions in the background and blocks the risky ones instead of asking you.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'On Pro, Max and Team plans, Auto is the built-in starting permission mode for interactive terminal and VS Code sessions.',
          source: SRC.PERMISSIONS,
        },
      ],
    },
    {
      id: 'plan-mode',
      title: 'Plan mode is not training wheels',
      body: [
        'In plan mode it explores and proposes without editing your source files.',
        'The instinct is to treat that as something you graduate from once you trust the tool. It is closer to the opposite.',
        'Think about when not editing is exactly what you want: a codebase you do not know yet, a change whose shape you have not decided, an investigation where you want the analysis before any commitment. It is the mode for work where thinking is the deliverable.',
      ],
      claims: [
        {
          text: 'In plan mode Claude explores and proposes a plan without editing your source files.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'Use plan mode to separate exploration from execution, because letting Claude jump straight to coding can produce code that solves the wrong problem.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'allowlist',
      title: 'So the prompts you do see are worth reading',
      body: [
        'Allow specific commands you trust in settings, so it stops asking about them. Running your test suite. Checking git status.',
        'A prompt you always approve is a prompt you have stopped reading, and a prompt you have stopped reading provides no safety at all.',
        'Allow-listing the boring ones is not laziness. It keeps the remaining prompts rare enough that you still look at them.',
      ],
      claims: [
        {
          text: 'You can allow specific commands in settings so Claude does not ask each time, which is useful for trusted commands like npm test or git status.',
          source: SRC.HOW,
        },
        {
          text: 'A prompt that is always approved provides no safety, because approval without reading is indistinguishable from no prompt at all.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'scope',
      title: 'And the moment this is more than you',
      body: [
        'Settings are scoped, from organisation-wide policy down to personal preference.',
        'So a team can say at the top level that certain things are never permitted here, and that is not a convention in a README that everyone agrees to and then forgets. It is enforced configuration.',
        'If you are introducing this to a team, that scope is the conversation to have first, before anybody has opinions about prompts.',
      ],
      claims: [
        {
          text: 'Settings can be scoped from organization-wide policies down to personal preferences.',
          source: SRC.HOW,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you start: what can this task reach?',
    items: [
      'Does anything in this task leave the filesystem?',
      'Will any file be changed via Bash rather than the edit tools?',
      'Have you committed recently enough that git is a real fallback?',
      'Which permission mode are you actually in?',
      'If it is Auto, are you comfortable not being asked?',
      'Should this start in plan mode instead?',
      'Are the boring commands allow-listed so the real prompts stand out?',
      'For a team: is the policy set at organisation level, or per person?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('permission-modes', 'Permission modes')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
