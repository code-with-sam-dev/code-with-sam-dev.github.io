/**
 * Claude Code Advanced Episode 5 design sheet: handoffs.
 *
 * THE FACT CHECK THAT SAVED THE EPISODE, and it belongs on the sheet too. The
 * narration originally taught a `/rename` command. There is no such command.
 * The commands reference documents `/clear [name]` as labelling the
 * conversation you are LEAVING, and `/resume` as the picker where that label
 * appears. Same outcome, different act, and a reader typing `/rename` would get
 * nothing.
 *
 * THE PAGE THAT EARNS THE SHEET is the two-things-cross table. Everyone knows
 * sessions are independent. Almost nobody can name what survives one, and the
 * list is short enough to print and long enough to be surprising: CLAUDE.md,
 * and the first part of auto memory. That is all.
 *
 * THE SECOND IS THE TEST. Thirty seconds, on your own project: if this tool
 * disappeared for a day, what would you rebuild out of your own head? The
 * answer is a list, and every item on it belongs in a file before you need it.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Handoffs',
  subtitle: 'What survives a session, a model, and a Monday',
  kicker: 'For software engineers: plan it at the start, not when you need it',
  strapline:
    'By the time you need a handoff, the thing that would have made it possible is the exact thing you have just lost.',
  verifiedOn: '2026-09-16',

  intro: [
    'The model you depend on is unavailable. Not gone forever: an outage, a provider problem, or the far more likely one, a usage limit at four in the afternoon. Does your work stop?',
    'Three different problems get called the same word, exactly two things cross a session boundary on their own, and there is a thirty second test that tells you whether yours would survive.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Three kinds of handoff, and why they fail for one shared reason',
      'Exactly what crosses a session boundary without you doing anything',
      'The four primitives, including the one almost nobody knows',
      'What belongs in CLAUDE.md, by a sharper test than "is this useful"',
      'Git history as the handoff that outlives the tool entirely',
    ],
    outTitle: 'Out of scope',
    out: [
      'Context management inside one session, which is its own episode',
      'Any claim about a specific provider outage or its frequency',
      'Vendor comparison. The point is not being locked into a chat log',
      'Backup strategy for your repository, which is a different subject',
    ],
    note:
      'Read the two-things-cross table first. Everything else on this page is a consequence of how short that list is.',
  },

  scale: {
    title: 'What crosses a session boundary on its own',
    note:
      'That is the whole list. Every decision you argued through, every constraint you agreed, every dead end you ruled out: unless it landed in a file, it is gone.',
    rows: [
      ['CLAUDE.md', 'Read at the start of every session'],
      ['Auto memory', 'The first 200 lines or 25 KB, whichever comes first'],
      ['The conversation', 'Does NOT cross. Each session starts fresh'],
      ['Your reasoning', 'Does NOT cross, unless you wrote it down'],
      ['Skills and MCP servers', 'Do NOT cross to another tool or vendor'],
      ['Git history', 'Crosses everything, including the tool going away'],
    ],
  },

  sections: [
    {
      id: 'three-kinds',
      title: 'Three different problems, one word',
      body: [
        'SESSION TO SESSION: today is gone and tomorrow has to pick it up. That one is about what you wrote down.',
        'MODEL TO MODEL: a different model, or a different vendor, takes over the same job. That one is about whether your instructions are portable.',
        'PERSON TO PERSON: a colleague inherits a branch an agent helped write, and has to understand decisions they never saw being made. That one is about whether your git history tells a story.',
        'They feel similar and they are not, but all three fail for the same underlying reason, which is the next section.',
      ],
      claims: [
        {
          text: 'Each session starts with a fresh context window and none of the conversation history from previous sessions.',
          source: SRC.SESSIONS,
        },
      ],
    },
    {
      id: 'primitives',
      title: 'The four primitives, and the one almost nobody knows',
      body: [
        '/export writes the current conversation out as plain text, and takes a filename. That is your transcript: portable, readable by any tool and any human.',
        '/memory edits your CLAUDE.md files and shows what auto memory has actually saved. Worth looking at once, because it is rarely what you assumed.',
        'AND THE ONE PEOPLE MISS: /clear takes a NAME. `/clear refund-rounding-investigation` labels the conversation you are walking away from, as you leave it. That label is what you see in /resume later.',
        'There is no /rename command. The naming happens on the way out, not afterwards, and that distinction is the whole trick.',
      ],
      claims: [
        {
          text: '/clear accepts an optional name, which labels the conversation being cleared so it can be identified later.',
          source: SRC.SESSIONS,
        },
        {
          text: '/resume presents previous conversations to pick from, where a label given at clear time appears.',
          source: SRC.SESSIONS,
        },
        {
          text: 'No /rename command exists. The commands reference documents naming at clear time only.',
          source: SRC.SESSIONS,
        },
      ],
    },
    {
      id: 'spec',
      title: 'The technique you have already seen without it being called a handoff',
      body: [
        'The documented pattern is: have it interview you, write the spec to a FILE, then start a FRESH SESSION to execute it.',
        'Read that again with handoffs in your head. That IS a handoff. You are passing work from one session to another, deliberately, and it works because the thing being handed over is a written artefact rather than a conversation.',
        'A spec travels. A conversation does not. Which makes the highest value habit here not a command at all: when a decision gets made, put it somewhere a file can hold it.',
      ],
      claims: [
        {
          text: 'Writing a specification to a file and executing it in a fresh session is a documented working pattern.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'claude-md',
      title: 'What belongs in CLAUDE.md, by a sharper test',
      body: [
        'Not "is this useful". The test is: if the next session, the next model, or the next person cannot function without this, it belongs in a file.',
        'A constraint you would be annoyed to have to re-explain. A decision that took an argument to reach. The reason a thing is done the strange way it is done.',
        'And the counterweight is real: a bloated file means the important rules get lost. For each line, ask whether removing it would cause a mistake. Durable, not merely true.',
      ],
      claims: [
        {
          text: 'CLAUDE.md is read as project memory at the start of every session.',
          source: SRC.MEMORY,
        },
      ],
    },
    {
      id: 'git',
      title: 'The artefact everybody forgets, because it is not part of the tool',
      body: [
        'Your git history. It is the one thing every model, every vendor and every human can read with none of your configuration.',
        'Commit early, and describe what you were DOING rather than what changed, because the diff already says what changed. A message that says why is a handoff note that survives the tool disappearing entirely.',
        'This is what pays off in the third kind of handoff. The colleague inheriting the branch cannot read your conversation and was never in your session. The commit log is what they have.',
      ],
      claims: [
        {
          text: 'Version control is outside the tool, so it is readable without any of its configuration, by anyone.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'unavailability',
      title: 'The honest shape of unavailability',
      body: [
        'People picture an outage. The rare case IS an outage. The common case is a usage limit, hit mid task, in the afternoon, by you.',
        'Same problem in ordinary clothes, and the cost is identical: work stops unless the state is somewhere else.',
        'Two things change your exposure. How your organisation routes requests, because a gateway or a cloud provider fails differently from a direct plan and several features are simply unavailable on some of them. And whether the task you are halfway through could be described to somebody else in a paragraph.',
      ],
      claims: [
        {
          text: 'Feature availability differs across direct plans, gateways and cloud provider routes.',
          source: SRC.GATEWAY,
        },
      ],
    },
    {
      id: 'junior-senior',
      title: 'The split, and it is about timing rather than knowledge',
      body: [
        'A junior handles a handoff when a handoff is needed, which is the one moment it cannot be done well, because the context has already gone.',
        'A senior sets it up at the START, when it costs almost nothing. Label the conversation when you clear it. Write the spec to a file. Put the constraint in CLAUDE.md. Commit with a message that says why.',
        'None of that is extra work. It is the same work, written down instead of remembered.',
      ],
      claims: [
        {
          text: 'The preparation that makes a handoff possible has to exist before the handoff is needed, because it is made of the context the handoff has lost.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'The thirty second test, on your own project, right now',
    items: [
      'If this tool disappeared for a day, what would I rebuild out of my own head?',
      'Not what would be inconvenient. What would I genuinely reconstruct from memory?',
      'Is that list written down anywhere, or is it in a window?',
      'Which constraint would I be annoyed to re-explain tomorrow?',
      'Which decision took an argument, and where is that argument recorded?',
      'Would removing this CLAUDE.md line cause a mistake, or is it just true?',
      'Do my commit messages say why, or only what?',
      'Could a colleague inheriting this branch follow it without me?',
      'Do I label conversations when I clear them?',
      'Could I describe my current half-finished task in one paragraph?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('manage-sessions', 'Manage sessions')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
