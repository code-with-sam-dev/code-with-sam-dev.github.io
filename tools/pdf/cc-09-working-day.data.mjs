/**
 * Claude Code Episode 9 design sheet: the working day.
 *
 * Verified 2026-09-13. This is the sheet most worth printing: it is almost
 * entirely actionable, and the failure-pattern table is something people will
 * recognise in their own sessions immediately.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'The Working Day',
  subtitle: 'Claude Code deep dive, episode 9',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'Claude stops when the work LOOKS done. So you became the verification loop.',
  verifiedOn: '2026-09-13',

  intro: [
    'One sentence in the documentation explains more about the difference between a good day and a bad one than anything else in it: Claude stops when the work looks done.',
    'Without a check it can run, "looks done" is the only signal available, and every mistake waits for you to notice it. This sheet is how to fix that, plus the failure patterns you are probably already in.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Giving it a check it can run',
      'The four levels of how hard that check gates the work',
      'Evidence rather than assertions of success',
      'Explore, plan, implement, commit, and when to skip the plan',
      'Letting it interview you before a big feature',
      'When to reach for a hook',
      'How to describe a bug',
      'The documented failure patterns',
    ],
    outTitle: 'Out of scope',
    out: [
      'CI configuration in detail',
      'Deployment tooling, which is yours and not this tool’s',
      'Any claim about how much faster this makes anyone',
      'Prompt "tricks": none of this is about phrasing',
    ],
    note: 'Almost everything on this sheet is actionable today, with no setup, which is unusual for a page about an agentic tool.',
  },

  scale: {
    title: 'The four levels of verification',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['In the prompt', 'works today, no setup'],
      ['A goal condition', 're-checked after every turn'],
      ['A Stop hook', 'blocks the turn from ending'],
      ['A verification subagent', 'a different grader'],
      ['Stop hook override', 'after 8 consecutive blocks'],
      ['Corrections before you /clear', 'TWO'],
    ],
  },

  sections: [
    {
      id: 'the-check',
      title: 'Give it something that returns pass or fail',
      body: [
        'Claude stops when the work looks done. Give it a check it can run and the loop closes on its own: it does the work, runs the check, reads the result, and iterates until the check passes.',
        'A check is anything that returns a signal it can read. A test suite. A build exit code. A linter. A script that diffs output against a fixture. A browser screenshot compared against the design.',
        'The documentation’s own summary is the best one: it is the difference between a session you watch and one you walk away from.',
      ],
      claims: [
        {
          text: 'Claude stops when the work looks done. Without a check it can run, "looks done" is the only signal available, and you become the verification loop.',
          source: SRC.BEST,
        },
        {
          text: 'Give Claude a check it can run: tests, a build, a screenshot to compare. It is the difference between a session you watch and one you walk away from.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'evidence',
      title: 'Evidence, not assertions',
      body: [
        'Have it show the test output, the command it ran and what came back, or a screenshot of the result.',
        'Reviewing evidence is faster than re-running the verification yourself, and it works for sessions you were not watching.',
        'Put more bluntly: done is a claim, output is a fact. If all you get back is the word done, you have not saved verification work, you have moved it to later when you have forgotten the context.',
      ],
      claims: [
        {
          text: 'Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'when-to-plan',
      title: 'Planning has a cost, and the documentation says so',
      body: [
        'The shape is explore, plan, implement, commit. Explore in plan mode, ask for a plan, edit the plan yourself if you want, then implement against it.',
        'But plan mode adds overhead. For tasks where the scope is clear and the fix is small, ask it to do the work directly.',
        'The test is beautifully concrete: IF YOU COULD DESCRIBE THE DIFF IN ONE SENTENCE, SKIP THE PLAN. Planning is most useful when you are uncertain about the approach, when the change touches multiple files, or when you are unfamiliar with the code.',
      ],
      claims: [
        {
          text: 'Plan mode is useful but adds overhead. For tasks where the scope is clear and the fix is small, ask Claude to do it directly. If you could describe the diff in one sentence, skip the plan.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'interview',
      title: 'Do not write the spec',
      body: [
        'For larger features, have Claude interview you first. Ask it to cover technical implementation, interface, edge cases, concerns and tradeoffs, to skip the obvious questions and dig into the hard parts, and to keep going until everything is covered, then write the spec to a file.',
        'Then start a FRESH session to execute it. The new session has clean context aimed entirely at implementation, and you have a written spec to reference.',
        'The documentation’s note on what makes a spec good is worth memorising: name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step.',
      ],
      claims: [
        {
          text: 'For larger features, have Claude interview you first, then start a fresh session to execute the resulting spec.',
          source: SRC.BEST,
        },
        {
          text: 'The most useful specs are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'hooks',
      title: 'When to reach for a hook',
      body: [
        'Unlike CLAUDE.md instructions, which are advisory, hooks are deterministic and guarantee the action happens.',
        'That is the whole decision. If it should usually happen, write it in the file. If it must happen every time with zero exceptions, it is a hook. Format after every edit. Lint before a commit. Block writes to a folder.',
        'And you do not have to hand-write them: ask for a hook that runs your linter after every file edit. One caution: hooks run with your credentials and your environment, so treat one you did not write like any other dependency.',
      ],
      claims: [
        {
          text: 'Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens.',
          source: SRC.BEST,
        },
        {
          text: 'Hook handlers run in the current directory with Claude Code’s environment, which includes the credentials available to that session.',
          source: SRC.HOOKS,
        },
      ],
    },
    {
      id: 'debugging',
      title: 'How to describe a bug',
      body: [
        'Not "fix the login bug". Instead: users report that login fails after session timeout, check the auth flow in this directory, especially token refresh, write a failing test that reproduces the issue, then fix it.',
        'Three things happened there. You gave the SYMPTOM rather than your guess at the cause. You pointed at where to look without insisting. And you asked for a reproduction before a fix, so the fix arrives with evidence that it worked.',
        'There is a matching instruction for builds worth stealing verbatim: address the root cause, do not suppress the error. Without it, a failing type check has an obvious and terrible solution available.',
      ],
      claims: [
        {
          text: 'Describe the symptom, the likely location, and what "fixed" looks like, and ask for a failing test that reproduces the issue before the fix.',
          source: SRC.BEST,
        },
        {
          text: 'Ask Claude to address the root cause rather than suppress the error.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'failure-patterns',
      title: 'The documented failure patterns',
      body: [
        'The kitchen sink session: one task, then something unrelated, then back again, and the context is full of irrelevance. Clear between unrelated tasks.',
        'Correcting over and over: after TWO failed corrections on the same issue, stop. Clear and write a better prompt incorporating what you learned. A clean session with a better prompt almost always beats a long session with accumulated corrections.',
        'The over-specified CLAUDE.md: if it is too long, important rules get lost. For each line ask whether removing it would cause a mistake. And if you emphasise many lines, none of them stands out.',
      ],
      claims: [
        {
          text: 'After two failed corrections on the same issue, run /clear and start fresh with a more specific prompt that incorporates what you learned.',
          source: SRC.BEST,
        },
        {
          text: 'Bloated CLAUDE.md files cause Claude to ignore your actual instructions. If you emphasize many lines, none of them stands out.',
          source: SRC.BEST,
        },
      ],
    },
    {
      id: 'the-reviewer',
      title: 'The most honest line in the documentation',
      body: [
        'Before treating a task as done, a subagent can review the diff in a fresh context, seeing only the change and your criteria rather than the reasoning that produced it.',
        'And then the caveat, which is unusual for a vendor to print about its own recommended technique: a reviewer prompted to find gaps will usually report some, even when the work is sound, because that is what it was asked to do.',
        'Chasing every finding leads to over-engineering: extra abstraction layers, defensive code, and tests for cases that cannot happen. Tell the reviewer to flag only gaps that affect correctness or the stated requirements, and treat the rest as optional.',
      ],
      claims: [
        {
          text: 'A reviewer prompted to find gaps will usually report some, even when the work is sound, because that is what it was asked to do. Chasing every finding leads to over-engineering.',
          source: SRC.BEST,
        },
        {
          text: 'A reviewer running in a fresh subagent context sees only the diff and the criteria you give it, not the reasoning that produced the change.',
          source: SRC.BEST,
        },
      ],
    },
  ],

  checklist: {
    title: 'The working day, as a checklist',
    items: [
      'Does this task have a check it can run?',
      'If it runs unattended, is the check a goal or a Stop hook?',
      'Are you getting evidence, or the word "done"?',
      'Could you describe the diff in one sentence? Then skip the plan',
      'Is this big enough that it should interview you first?',
      'Is this rule advisory, or must it happen every time? That decides hook or file',
      'Did you describe the symptom, or your guess at the cause?',
      'Have you corrected the same thing twice? Then clear and rewrite',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('best-practices', 'Best practices')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
