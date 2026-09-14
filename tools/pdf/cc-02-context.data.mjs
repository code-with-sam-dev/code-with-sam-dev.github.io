/**
 * Claude Code Episode 2 design sheet: context is the product.
 *
 * Verified 2026-09-13. The four controls are the useful half of this sheet and
 * the reason it is worth keeping open on a second screen.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Context Is The Product',
  subtitle: 'Claude Code deep dive, episode 2',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'Something in your conversation is being deleted right now, in a fixed order.',
  verifiedOn: '2026-09-13',

  intro: [
    'Seven things live in your context window and only one of them is what you typed. The rest arrived because of something the agent did on your behalf.',
    'When the window fills, things are removed in a fixed order, and the first thing to go is not the one you would have picked.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What actually loads into the context window',
      'The order things are dropped in',
      'Why "detailed and early" is the profile of what is lost',
      'Control 1: CLAUDE.md and Compact Instructions',
      'Control 2: skills, which load on demand',
      'Control 3: subagents and their own window',
      'Control 4: MCP tool definitions, deferred',
    ],
    outTitle: 'Out of scope',
    out: [
      'How to write a skill, which is episode 6',
      'Choosing MCP servers, which is episode 7',
      'Orchestrating subagents, which is episode 8',
      'Token pricing: this is about what earns its place, not what it costs',
    ],
    note: 'The junior version of this skill is "use fewer tokens". That is the wrong optimisation and it makes results worse.',
  },

  scale: {
    title: 'What loads, and who put it there',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Conversation history', 'you'],
      ['Every file it has read', 'the agent'],
      ['Output of every command', 'the agent'],
      ['CLAUDE.md', 'you, once per session'],
      ['Auto memory', 'the agent, first 200 lines or 25KB'],
      ['Loaded skills', 'either, on demand'],
      ['System instructions', 'the harness'],
    ],
  },

  sections: [
    {
      id: 'what-loads',
      title: 'Only one row is yours',
      body: [
        'Look at the table above and notice the shape of it. Six of the seven arrived because of something the agent did, not something you wrote.',
        'Which is why rewriting your prompt to be cleverer so often changes nothing. You were editing the one line that was already fine.',
        'Auto memory is the one people do not know about: learnings saved as it works, of which the first 200 lines or 25KB load each session, whichever comes first.',
      ],
      claims: [
        {
          text: 'The context window holds conversation history, file contents, command outputs, CLAUDE.md, auto memory, loaded skills, and system instructions.',
          source: SRC.HOW,
        },
        {
          text: 'The first 200 lines or 25KB of MEMORY.md, whichever comes first, load at the start of each session.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'the-order',
      title: 'The order things are removed in',
      body: [
        'Older tool outputs are cleared FIRST. Then, if that is not enough, the conversation is summarised.',
        'Requests and key code snippets are preserved. Detailed instructions from early in the conversation may not be.',
        'That last sentence is the whole episode. The most valuable thing you ever type is usually a detailed instruction, given early, which is exactly the profile of what goes.',
      ],
      claims: [
        {
          text: 'Claude Code clears older tool outputs first, then summarises the conversation if needed. Requests and key code snippets are preserved; detailed instructions from early in the conversation may be lost.',
          source: SRC.HOW,
        },
        {
          text: 'If a single file or tool output is so large that context refills immediately after each summary, Claude Code stops auto-compacting after a few attempts and shows an error rather than looping.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'control-1',
      title: 'Control 1: CLAUDE.md, and the section almost nobody uses',
      body: [
        'A file read at the start of every session is not part of the conversation being summarised, so it cannot be summarised away.',
        'The less known half: you can add a Compact Instructions section to that file saying what should survive a compaction, or run compact with a focus and say what to keep.',
        'Most people wait for compaction to happen. You can decide when, and what matters.',
      ],
      claims: [
        {text: 'Put persistent rules in CLAUDE.md rather than relying on conversation history.', source: SRC.HOW},
        {
          text: 'To control what is preserved during compaction, add a "Compact Instructions" section to CLAUDE.md or run /compact with a focus.',
          source: SRC.HOW,
        },
        {
          text: 'Bloated CLAUDE.md files cause Claude to ignore your actual instructions, so for each line ask whether removing it would cause a mistake.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'control-2',
      title: 'Control 2: skills load on demand',
      body: [
        'At the start of a session Claude sees only the DESCRIPTIONS. The body of a skill loads only when the skill is used.',
        'So a hundred page reference costs you a one line description until the ten minutes you actually need it.',
        'For skills you invoke manually, disable-model-invocation keeps even the description out of the way.',
      ],
      claims: [
        {
          text: 'Unlike CLAUDE.md content, a skill’s body loads only when it is used, so long reference material costs almost nothing until you need it.',
          source: SRC.SKILLS,
        },
        {
          text: 'Claude sees skill descriptions at session start; setting disable-model-invocation keeps descriptions out of context until you need them.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'control-3',
      title: 'Control 3: whose window pays for the work',
      body: [
        'A subagent works in its own context window. It starts fresh unless it is a fork, its tool calls stay out of your window entirely, and you get back a summary.',
        'Ask the main session to read forty files and forty file contents land in your window and stay there. Ask a subagent and you get the answer instead.',
        'That is the difference between a session still sharp after three hours and one that is confused by lunchtime.',
      ],
      claims: [
        {
          text: 'A subagent works in its own context window; its tool calls stay out of your context and Claude gets back a summary when it finishes.',
          source: SRC.HOW,
        },
        {
          text: 'A fork starts with a copy of your conversation so far rather than fresh, and its tool calls still stay out of your window.',
          source: SRC.SUBAGENTS,
        },
      ],
    },
    {
      id: 'control-4',
      title: 'Control 4: a cost you did not know you were paying',
      body: [
        'Each MCP server brings tool definitions with it. Connect six and that could be a great deal of your window spent before you ask anything.',
        'At the time of writing, those definitions are deferred by default and loaded on demand through tool search, so only names and server instructions cost you until a tool is used.',
        'Worth knowing, because when a session feels sluggish the instinct is to blame the model, and the cause may be six servers you connected in March.',
      ],
      claims: [
        {
          text: 'MCP tool definitions are deferred by default and loaded on demand via tool search, so only tool names and server instructions consume context until Claude uses a specific tool.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'the-reframe',
      title: 'Why "use fewer tokens" is the wrong optimisation',
      body: [
        'Writing shorter prompts and being terse makes results worse, because the thing you trimmed was usually the context that would have made the answer right.',
        'The senior version is: decide what earns its place. A precise rule in CLAUDE.md earns it, because it is read once per session and prevents a class of mistake. Forty files of search results do not, so they go to a subagent. A reference earns it only for the ten minutes you need it, so it becomes a skill.',
        'Same window. Completely different contents.',
      ],
      claims: [
        {
          text: 'Most best practices follow from one constraint: the context window fills fast and performance degrades as it fills.',
          source: SRC.BEST,
        },
        {
          text: 'Trimming context indiscriminately removes the material that would have made the answer correct, which is why brevity is not the same as efficiency.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'Questions to ask when quality drops mid-session',
    items: [
      'Run /context: which of the seven is actually eating the window?',
      'Is it tool output from one large file read?',
      'Has the session compacted since your key instruction?',
      'Is that instruction in CLAUDE.md, or only in the conversation?',
      'Does CLAUDE.md have a Compact Instructions section?',
      'Should this reference be a skill instead of a permanent load?',
      'Should this search have gone to a subagent?',
      'How many MCP servers are connected, and do you use them all?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('context-window', 'The context window')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
