/**
 * Claude Code Episode 6 design sheet: skills.
 *
 * Verified 2026-09-13. The frontmatter table and the dynamic context injection
 * line are why someone keeps this one: both are things you look up rather than
 * remember.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Skills: Free Until You Use Them',
  subtitle: 'Claude Code deep dive, episode 6',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'The same hundred page document, at two completely different prices.',
  verifiedOn: '2026-09-13',

  intro: [
    'A skill is a folder with a markdown file in it, and the folder name becomes the command you type. That is the whole feature.',
    'What makes it the highest leverage thing in the tool is the cost model: only the description loads at session start, and the body loads when the skill is used.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What a skill is, and the file that defines it',
      'Why the folder name matters',
      'The four locations, and what each one reaches',
      'On-demand loading, which is the whole argument',
      'The frontmatter worth knowing',
      'context: fork, and whose window pays',
      'Dynamic context injection',
      'That custom commands were merged into skills',
    ],
    outTitle: 'Out of scope',
    out: [
      'MCP servers, which are episode 7',
      'Subagent definition files, which are episode 8',
      'Plugin authoring and distribution',
      'Any specific community skill as a recommendation',
    ],
    note: 'Make one when you keep pasting the same instructions, or when a section of CLAUDE.md has grown into a procedure rather than a fact.',
  },

  scale: {
    title: 'The four locations, and what each reaches',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['~/.claude/skills/', 'every project on this machine'],
      ['.claude/skills/', 'anyone who clones the repository'],
      ['<subdir>/.claude/skills/', 'sessions at or below that path'],
      ['managed settings', 'everyone in the organisation'],
      ['The directory name', 'becomes the command'],
      ['The description', 'decides when Claude reaches for it'],
    ],
  },

  sections: [
    {
      id: 'what-it-is',
      title: 'Smaller than people expect',
      body: [
        'Create a file called SKILL.md with instructions in it, and Claude adds it to its toolkit. It uses the skill when relevant, or you invoke it directly by name with a slash.',
        'There is no framework, no registration step, and nothing to compile.',
        'If you have been putting this off because it sounded like a project, it is a file.',
      ],
      claims: [
        {
          text: 'Skills extend what Claude can do. Create a SKILL.md file with instructions, and Claude adds it to its toolkit. Claude uses skills when relevant, or you can invoke one directly with /skill-name.',
          source: SRC.SKILLS,
        },
        {
          text: 'The directory name becomes the command name you type.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'the-cost-model',
      title: 'The argument for the whole feature, in one sentence',
      body: [
        'At the start of a session Claude sees only the DESCRIPTIONS. The body of a skill loads only when the skill is actually used.',
        'So your hundred page style guide in CLAUDE.md occupies your context window all day whether or not today’s work touches that kind of code. The same guide as a skill costs you a one line description until the ten minutes you need it.',
        'Same file, same words, two completely different prices.',
      ],
      claims: [
        {
          text: 'Unlike CLAUDE.md content, a skill’s body loads only when it is used, so long reference material costs almost nothing until you need it.',
          source: SRC.SKILLS,
        },
        {
          text: 'Create a skill when you keep pasting the same instructions, checklist or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'scope',
      title: 'The location is the scope',
      body: [
        'Your home folder makes it available in every project on this machine. The project folder makes it available to anyone who clones the repository.',
        'That second one is the move that turns a personal habit into a team standard, and it costs nothing extra.',
        'A nested location loads only for sessions started at or below that path, which is how a monorepo gives different teams different tooling without collision. And an enterprise location deploys one to everybody.',
      ],
      claims: [
        {
          text: 'Skills live in personal, project, nested and enterprise locations, and the location determines which sessions load them.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'frontmatter',
      title: 'The settings worth knowing',
      body: [
        'description is how Claude decides whether a skill is relevant, which makes it the most important line in the file and the one people write carelessly.',
        'disable-model-invocation means only you can trigger it, never Claude, which keeps even the description out of the way until you ask. user-invocable set to false is the opposite.',
        'allowed-tools pre-approves a specific set for that skill, so a read-only skill can be genuinely read-only. arguments gives it named positional arguments.',
      ],
      claims: [
        {
          text: 'Frontmatter fields include name, description, disable-model-invocation, user-invocable, allowed-tools, context and arguments.',
          source: SRC.SKILLS,
        },
        {
          text: 'A skill with context set to fork runs in an isolated subagent context with its own conversation history.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'dynamic-context',
      title: 'The line of syntax that changes what a skill can be',
      body: [
        'Put an exclamation mark and a shell command in backticks, and Claude Code RUNS that command and substitutes the output before Claude ever sees the file.',
        'So a skill is not a static instruction. It is a template that gathers its own evidence at the moment you invoke it.',
        'A review skill that runs your diff and reviews what is actually there. A deploy checklist that reads the current branch. A triage skill that pulls the last fifty log lines. The instruction and the evidence arrive together.',
      ],
      claims: [
        {
          text: 'The exclamation-backtick syntax uses dynamic context injection: Claude Code runs the command and replaces the line with its output before Claude sees the skill content.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'commands-merged',
      title: 'Something that quietly changed',
      body: [
        'Custom commands have been MERGED into skills. A file in the commands folder and a skill folder both create the same slash command, and both work.',
        'Your existing command files keep working; nothing breaks.',
        'What skills add on top is a folder for supporting files, frontmatter controlling whether you or Claude invokes them, and the ability for Claude to load them automatically when relevant. So a tutorial about custom commands is describing the smaller half of the same feature.',
      ],
      claims: [
        {
          text: 'Custom commands have been merged into skills: a file at .claude/commands/deploy.md and a skill at .claude/skills/deploy/SKILL.md both create /deploy and work the same way.',
          source: SRC.SKILLS,
        },
        {
          text: 'Bundled skills include /debug, /code-review, /batch and /loop.',
          source: SRC.SKILLS,
        },
      ],
    },
  ],

  checklist: {
    title: 'Should this be a skill?',
    items: [
      'Have you pasted these instructions more than twice?',
      'Has a section of CLAUDE.md become a procedure rather than a fact?',
      'Does the reference only matter for some tasks? Then it is a skill, not CLAUDE.md',
      'Does the team need it, or only you? That decides the folder',
      'Is the description precise enough for Claude to know when it applies?',
      'Should Claude be able to invoke it, or only you?',
      'Would it be better if it gathered its own evidence first?',
      'Does it read many files? Consider context: fork',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('skills', 'Skills')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
