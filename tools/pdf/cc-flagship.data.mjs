/**
 * The Claude Code flagship design sheet.
 *
 * Every product claim was checked against the official documentation on
 * 14 September 2026, recorded in production/claude-code-claims.md. Two claims
 * from an earlier draft did not survive that check and were corrected before
 * recording, which is the argument of the whole episode in miniature.
 *
 * THE PAGE THAT EARNS THE SHEET is the checkpointing table. Everybody repeats
 * that there is an undo. Almost nobody states what it does NOT track, and the
 * gap is the difference between a safety net and a belief in one.
 *
 * THE SECOND IS THE STOPPING FAILURE, which costs the most and gets discussed
 * least, because it looks like good behaviour: one blocked item collapses into
 * a blocked run, and a written apology takes the place of the next action.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE} from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/watch?v=E7Wt3i29QtA', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Claude Code',
  subtitle: 'Everything a software engineer needs to know',
  kicker: 'For software engineers: the harness, not the chat window',
  strapline:
    'Forty files edited, then escape twice and all of it gone. Not reverted with git. Rewound, to a state never committed.',
  verifiedOn: '2026-09-14',

  intro: [
    'That safety net is the single reason it is reasonable to let something else edit your code at all. It also has a gap in it, and the gap is narrower than most people assume.',
    'This sheet is the parts that change how you work: the undo and what it misses, how sessions keep a large codebase out of your context, the three files that make it a team tool, and the failure that costs the most and gets talked about least.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why it is a harness rather than a chat window, and why the loop is the new thing',
      'What checkpointing tracks, and the four things it does not',
      'How subagents keep the evidence out of your context and return the conclusion',
      'The three files you commit, and the one you must not',
      'The stopping failure, and the three things that help',
    ],
    outTitle: 'Out of scope',
    out: [
      'Hooks, output styles and the status line',
      'Agent teams, plugins and the plugin marketplace',
      'Routines, channels and the enterprise controls',
      'Anything about how this channel is produced, which is not the subject',
    ],
    note:
      'Each of those deserves its own piece rather than ninety seconds here. Read the checkpointing table first: it is the one that changes what you are willing to let an agent do.',
  },

  scale: {
    title: 'What the undo actually covers',
    note:
      'This is session level recovery. The documentation is blunt about what follows and so is this sheet: it is not a replacement for version control.',
    rows: [
      ['Its own file edit tools', 'Tracked. Recover with /rewind'],
      ['A bash command', 'NOT tracked. Recover with git'],
      ['A background subagent', 'Usually not tracked. Recover with git'],
      ['Symlinked or hard linked paths', 'Skipped on restore. Recover by hand'],
      ['Age', 'Snapshots swept after about thirty days'],
      ['What it restores', 'Code, conversation, or both, with no commit required'],
    ],
  },

  sections: [
    {
      id: 'harness',
      title: 'It is a harness, not a chatbot',
      body: [
        'Think of it as a chat window that knows code and you paste code in and answers back out, and you get a slightly faster autocomplete.',
        'Think of it as a harness and you give it access, a task, and a way to check its own work, and it closes the loop without you.',
        'Code generation is old and was never the bottleneck. THE LOOP IS THE NEW THING: run, read the failure, change approach, run again.',
      ],
      claims: [
        {
          text: 'It operates as an agentic harness with access to tools, rather than as a conversational interface that returns text.',
          source: SRC.OVERVIEW,
        },
        {
          text: 'The capability that changed is not producing code but iterating against a check without a human between the attempts.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'rewind',
      title: 'The safety net, and exactly where it leaks',
      body: [
        'Before each prompt that starts a turn, the state of your code is captured. Run /rewind, or press escape twice on an empty input, and you can restore the code, the conversation, or both. No commit required, and it is saved with the conversation, so you can resume tomorrow and rewind yesterday.',
        'Now the gap. Checkpointing only tracks changes made through its OWN file editing tools. A bash command that rewrites a file is invisible to it. So is a background subagent, usually. Symlinked and hard linked paths are skipped on restore.',
        'Snapshots are swept after about thirty days. This is session level recovery and it is not version control, which is the sentence to remember before you rely on it.',
      ],
      claims: [
        {
          text: 'Checkpoints are created before each prompt and can restore code, conversation, or both, without requiring a commit.',
          source: SRC.CHECKPOINTS,
        },
        {
          text: 'Checkpointing tracks only changes made through its own file editing tools, and does not capture changes made by bash commands.',
          source: SRC.CHECKPOINTS,
        },
        {
          text: 'Symbolic and hard linked paths are skipped during restore, and snapshots are cleaned up after roughly thirty days.',
          source: SRC.CHECKPOINTS,
        },
      ],
    },
    {
      id: 'sessions',
      title: 'How sessions communicate, which is why a big codebase does not drown you',
      body: [
        'The expensive part of searching a large codebase is not the searching. It is the thousands of lines of file content that land in your context afterwards and stay there for the rest of the session.',
        'So do not do it in your own window. Ask for a subagent. It gets its own isolated context, reads the forty files there, and returns a conclusion.',
        'What comes back is the ANSWER, not the pile of evidence. That is the whole mechanism, and it is the part nobody explains well.',
      ],
      claims: [
        {
          text: 'A subagent runs with its own separate context window and returns its result to the calling session.',
          source: SRC.SUBAGENTS,
        },
        {
          text: 'Delegating a broad search keeps the intermediate file contents out of the calling session, which is the cost being avoided.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'team',
      title: 'The three files you commit, and the one you must not',
      body: [
        'CLAUDE.md, committed, gives everyone the same project context on their first run.',
        '.claude/settings.json, committed, carries the commands the team has agreed are safe, already approved.',
        '.claude/skills/, committed, brings your review checklist along with the clone.',
        '.claude/settings.local.json is PERSONAL. It goes in .gitignore. You are sharing the standards, not the conversation.',
      ],
      claims: [
        {
          text: 'CLAUDE.md is read as project memory and is intended to be checked into the repository.',
          source: SRC.MEMORY,
        },
        {
          text: 'Settings are split into a shared project file and a local file, and the local file is intended to stay out of version control.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'A skill is a directory with a SKILL.md in it, so committing the directory distributes the skill.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'skills',
      title: 'A skill is just a file',
      body: [
        'Create a SKILL.md with instructions in it and it is in the toolkit. No framework, no registration, nothing to compile.',
        'Invoke it by name. A short one that attacks a plan, finds the assumption it rests on, and asks which failure the design does not handle is more useful than it sounds.',
        'The useful ones are boring and specific: your code review checklist, your release steps, how this team writes tests.',
      ],
      claims: [
        {
          text: 'A skill is defined by a SKILL.md file with name and description frontmatter, and requires no build step or registration.',
          source: SRC.SKILLS,
        },
      ],
    },
    {
      id: 'stopping',
      title: 'The failure that costs the most',
      body: [
        'You give it a standing instruction. Work through this list, do not stop, and if something is blocked skip it and carry on.',
        'It does three items. The fourth needs a human for one click. And it stops. Not that item, THE WHOLE RUN. Then it writes a summary and apologises, while seven items that needed nothing from you sit untouched.',
        'Underneath, it collapses one blocked item into a blocked run, and treats writing a report as a finishing move. THE APOLOGY IS THE TELL, because an apology fills the space where the next action should be.',
        'Three things help. Put the skip rule in CLAUDE.md rather than only in the message, so it survives every session. Ask for the next action rather than a status update. And check real output, not what it says it did.',
      ],
      claims: [
        {
          text: 'Instructions placed in project memory persist across sessions, where an instruction given in one message does not.',
          source: SRC.MEMORY,
        },
        {
          text: 'An agent that stops safely is not the same as an agent that does the work, so autonomy is a property to test for rather than assume.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you let it run unattended',
    items: [
      'Is the work committed, given the undo does not cover bash edits?',
      'Does anything in this task write files through a shell command?',
      'Are there symlinks in the tree I would need to restore by hand?',
      'Is the skip rule in CLAUDE.md, or only in this message?',
      'Did I ask for the next action, or for a status update?',
      'Am I checking real output, or reading a report of it?',
      'Should this search be a subagent so the evidence stays out of my context?',
      'Is settings.local.json in .gitignore?',
      'Which of my team standards is still only in my head rather than in a skill?',
      'If it stops early, will I be able to tell that it did?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('checkpointing', 'Checkpointing docs')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
