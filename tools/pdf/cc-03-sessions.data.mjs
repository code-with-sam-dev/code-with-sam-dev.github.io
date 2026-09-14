/**
 * Claude Code Episode 3 design sheet: sessions.
 *
 * Verified 2026-09-13. The resume-against-fork table is the reason to keep
 * this one open; it is the distinction the whole episode turns on.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Sessions, Resume And Fork',
  subtitle: 'Claude Code deep dive, episode 3',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'You continued yesterday’s work and it went worse than starting over.',
  verifiedOn: '2026-09-13',

  intro: [
    'The obvious conclusion is that resuming is unreliable, so people stop doing it. That conclusion is wrong.',
    'A session is a conversation tied to a project DIRECTORY, it starts empty unless you go and get the old one, and resuming a stale session is worse than starting a clean one.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What a session is, and where it lives on disk',
      'What crosses from yesterday to today, and what does not',
      'The four ways to pick a session up',
      'Naming, and why six identical timestamps is the problem',
      'Resume against fork, which is the distinction that matters',
      'Git worktrees for genuinely parallel work',
      'Cross-session messaging',
    ],
    outTitle: 'Out of scope',
    out: [
      'Cloud sessions and Remote Control, which are episode 11',
      'Background agents and workflows, which are episode 8',
      'Scheduled work, which is episode 16',
      'Transcript formats and log parsing',
    ],
    note: 'A session has a useful lifespan. Three signals say it has ended, and they are in the checklist.',
  },

  scale: {
    title: 'What crosses from yesterday to today',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['Conversation history', 'no'],
      ['Files it had read', 'no'],
      ['Command output', 'no'],
      ['CLAUDE.md', 'YES, every session'],
      ['Auto memory', 'YES, first 200 lines or 25KB'],
      ['Everything else', 'gone unless you go and get it'],
    ],
  },

  sections: [
    {
      id: 'what-it-is',
      title: 'Tied to a directory, not a repository',
      body: [
        'That one word explains most of the confusing behaviour. Not your repo, not your account: a directory.',
        'It is written to disk as you work, as a plaintext JSONL file, one line per message, tool use and result. So your history is a file you can read with ordinary tools.',
        'And the reason a session does not appear where you expected it is almost always that you are standing somewhere else.',
      ],
      claims: [
        {
          text: 'A session is a saved conversation tied to a project directory, stored locally as you work.',
          source: SRC.SESSIONS,
        },
        {
          text: 'Each message, tool use and result is written to a plaintext JSONL file under ~/.claude/projects/.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'independent',
      title: 'Sessions are independent',
      body: [
        'Each new one starts with a fresh context window and none of the conversation history from previous sessions. Nothing carries over by default.',
        'Two things cross the boundary deliberately: CLAUDE.md, read at the start of every session, and auto memory.',
        'Everything else about yesterday is gone unless you go and get it.',
      ],
      claims: [
        {
          text: 'Each new session starts with a fresh context window, without the conversation history from previous sessions.',
          source: SRC.HOW,
        },
        {
          text: 'Claude can persist learnings across sessions using auto memory, and you can add persistent instructions in CLAUDE.md.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'four-doors',
      title: 'Four ways in, and they are not interchangeable',
      body: [
        'continue picks up the most recent session in the directory you are standing in. Fast, and the one people use by reflex.',
        'resume with a name reopens a specific one. resume with nothing opens a picker, showing sessions from the current worktree by default with shortcuts to widen the list.',
        'And there is a flag to start from a pull request. Four doors into the same room, and the one you reach for without thinking is the least deliberate of them.',
      ],
      claims: [
        {
          text: 'claude --continue finds the most recent session in the current directory.',
          source: SRC.SESSIONS,
        },
        {
          text: 'The /resume picker shows sessions from the current worktree by default, with keyboard shortcuts to widen the list to other worktrees or projects.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'resume-vs-fork',
      title: 'The distinction the episode turns on',
      body: [
        'RESUME reopens the session under the SAME identifier and appends your new messages to the existing conversation. One thread, getting longer.',
        'FORK copies the history into a NEW identifier and leaves the original exactly as it was. Two threads, sharing a past.',
        'Forking gives you what resuming cannot: a second approach that does not contaminate the first, and a known good conversation kept intact while you experiment beside it.',
      ],
      claims: [
        {
          text: 'Resuming a session with claude --continue or claude --resume reopens it under the same session ID and appends new messages to the existing conversation.',
          source: SRC.HOW,
        },
        {
          text: 'Forking with --fork-session or /branch copies the history into a new session ID, leaving the original unchanged.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'why-it-went-badly',
      title: 'Why continuing yesterday made it worse',
      body: [
        'You continued a session that already had hours in it. The window did not start fresh; it started nearly full, and full of the wrong things: resolved debugging output, abandoned approaches, a file read once and never needed again.',
        'So adding today’s request triggered compaction immediately, and the decision it forgot was made early, in detail, which is exactly the profile of what goes.',
        'You did not resume badly. You resumed a STALE session.',
      ],
      claims: [
        {
          text: 'Detailed instructions from early in the conversation may be lost during compaction, while requests and key code snippets are preserved.',
          source: SRC.HOW,
        },
        {
          text: 'A resumed session inherits the token cost of everything already in it, so it begins closer to the compaction threshold than a fresh one.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'worktrees',
      title: 'Real parallelism, because sessions are per directory',
      body: [
        'Two sessions in one directory are two conversations about the same files. Switching branches under a running session changes the files it sees while the conversation stays the same, which is how an agent ends up confused about which branch it is on.',
        'Git worktrees give a separate directory per branch, and therefore a separate session per branch, with no crossover.',
        'Once several are running, cross-session messaging lets one tell another when a long build finished, so the coordination you were doing by alt-tabbing happens between the sessions instead.',
      ],
      claims: [
        {
          text: 'Since sessions are tied to directories, you can run parallel Claude sessions by using git worktrees, which create separate directories for individual branches.',
          source: SRC.HOW,
        },
        {
          text: 'Claude sees the current branch’s files, and when you switch branches the conversation history stays the same.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'naming',
      title: 'The thirty second habit almost nobody has',
      body: [
        'Name your sessions. The rename command takes the name as an argument.',
        'Without it, the picker is a list of timestamps you cannot tell apart: six sessions from Tuesday, same repo, same date, and a first line that is some variant of "look at the failing build".',
        'Naming turns resuming from a guess into a choice.',
      ],
      claims: [
        {
          text: 'Run /rename with a new name to name the current session, and resume it later by that name.',
          source: SRC.SESSIONS,
        },
        {
          text: 'A picker full of identically-named sessions provides no information, so the cost of not naming them is paid every time you resume.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'Three signals a session is over, and what to do',
    items: [
      'The task has changed: start fresh',
      'The window is full of resolved work: start fresh',
      'You are trying a second approach to one problem: FORK',
      'Would this conversation help tomorrow, or just weigh on it?',
      'Is the decision you need recorded in CLAUDE.md, or only here?',
      'Are you in the directory you think you are in?',
      'Do you need two branches at once? Use worktrees, not one session',
      'Have you named it so you can find it in a week?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('sessions', 'Manage sessions')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
