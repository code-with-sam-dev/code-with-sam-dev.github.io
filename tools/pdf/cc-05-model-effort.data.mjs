/**
 * Claude Code Episode 5 design sheet: which model, which effort.
 *
 * Verified 2026-09-13. THIS IS THE FASTEST-ROTTING SHEET IN THE SERIES: model
 * names and plan defaults change with releases, so every row is dated and the
 * sheet teaches the decision rule rather than a leaderboard.
 *
 * `/fast` is deliberately absent: it appears in some environments but was not
 * confirmed on the public model-config page during the check.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Which Model, Which Effort',
  subtitle: 'Claude Code deep dive, episode 5',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'You turned everything up, and the answer got worse.',
  verifiedOn: '2026-09-13',

  intro: [
    'There are two dials here, not one: the model, and how much it thinks before it answers. Most people know about the first and have never touched the second.',
    'And more is not always better. The documentation warns about its own top effort level in five words, which is the most useful sentence on this page.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The two dials, and that they interact',
      'The model aliases as of September 2026',
      'Which default your plan puts you on',
      'opusplan, the hybrid almost nobody mentions',
      'The five effort levels and the warning on the top one',
      'Where the dials live, and which setting wins',
      'How to choose from the shape of the task',
    ],
    outTitle: 'Out of scope',
    out: [
      'Benchmarks and leaderboards: none are quoted here',
      '/fast, which was not confirmed in public documentation during this check',
      'Per-token pricing, which is episode 1',
      'Any claim that one model is better than another in general',
    ],
    note: 'This sheet teaches a decision rule rather than a ranking, because a ranking is wrong within a release and a rule is not.',
  },

  scale: {
    title: 'Effort levels, September 2026',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['low', 'short, scoped, not intelligence sensitive'],
      ['medium', 'cost sensitive, trades some intelligence'],
      ['high', 'THE DEFAULT on almost everything'],
      ['xhigh', 'deeper reasoning, higher token spend'],
      ['max', 'demanding tasks, PRONE TO OVERTHINKING'],
      ['ultracode', 'xhigh plus dynamic workflow orchestration'],
    ],
  },

  sections: [
    {
      id: 'two-dials',
      title: 'Two dials, not one',
      body: [
        'The MODEL is which brain does the work. The EFFORT level is how much it thinks before it answers.',
        'They interact, so the same model at two different effort levels behaves like two different tools.',
        'If you have only ever changed the model, you have been operating half the controls, and the half you were missing decides how long it thinks about your problem.',
      ],
      claims: [
        {
          text: 'Effort controls adaptive reasoning: how much the model thinks before responding. Lower effort is faster for straightforward tasks; higher effort provides deeper reasoning for complex problems.',
          source: SRC.MODELS,
        },
      ],
    },
    {
      id: 'the-aliases',
      title: 'The aliases, and why it is not a ladder',
      body: [
        'haiku for simple fast tasks. sonnet for daily coding. opus for complex reasoning. fable for the hardest and longest running. best resolves to whatever the strongest available one is.',
        'And opusplan, which gets its own section below.',
        'Notice what that list is not. It is not a quality ranking where you should always reach for the top. It is a list of different SHAPES of job.',
      ],
      claims: [
        {
          text: 'Aliases include haiku for simple fast tasks, sonnet for daily coding, opus for complex reasoning, fable for the hardest and longest-running tasks, and best for the strongest available.',
          source: SRC.MODELS,
        },
        {
          text: 'Switch models with /model during a session, or start with claude --model <name>.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'your-default',
      title: 'Which one are you on right now',
      body: [
        'It depends on what you pay for, and almost nobody checks.',
        'On Max, Team Premium, Enterprise and the API, the default is Opus 5. On Pro and Team Standard, it is Sonnet 5.',
        'So two developers on one team, doing the same work, can be having genuinely different experiences and neither knows why. If you have read someone saying this tool is brilliant, or useless, and your experience did not match, you may not have been using the same thing.',
      ],
      claims: [
        {
          text: 'The default model is Opus 5 on Max, Team Premium, Enterprise and API accounts, and Sonnet 5 on Pro and Team Standard.',
          source: SRC.MODELS,
        },
      ],
    },
    {
      id: 'opusplan',
      title: 'The setting nobody mentions',
      body: [
        'opusplan is a hybrid: Opus for PLANNING and Sonnet for EXECUTION.',
        'The expensive, careful reasoning goes where the leverage actually is, which is deciding what to do. The fast, cheaper model does the part where the decisions are already made.',
        'That is exactly how you would staff a team, and here it is one setting. If you try one thing from this sheet, try that.',
      ],
      claims: [
        {
          text: 'The opusplan alias is a hybrid that uses Opus for planning and Sonnet for execution.',
          source: SRC.MODELS,
        },
      ],
    },
    {
      id: 'the-warning',
      title: 'The documentation warns about its own top setting',
      body: [
        'On the maximum effort level, the guidance is: demanding tasks, but prone to overthinking, test before adopting broadly.',
        'That is a vendor telling you that more reasoning is not monotonically better, which is rare and worth trusting.',
        'There is a point where extra reasoning stops adding accuracy and starts adding doubt. Both dials at the top on a task that did not need it is paying more for a worse answer, more slowly.',
      ],
      claims: [
        {
          text: 'On the max effort level the guidance is: demanding tasks, but prone to overthinking, test before adopting broadly.',
          source: SRC.MODELS,
        },
        {
          text: 'The high effort level is the default on all models except one, and balances token usage against intelligence.',
          source: SRC.MODELS,
        },
      ],
    },
    {
      id: 'precedence',
      title: 'Why your setting would not stick',
      body: [
        'Both dials can be set in several places, and the precedence explains the setting that was being ignored.',
        'Environment variables take precedence over all settings. Command line flags apply to that session only. The settings file holds saved defaults, including a different effort per model. And the in-session commands change it now.',
        'If a value in a file is being ignored, look for the variable before you look for a bug. And pressing s in either picker applies the change to this session only rather than saving it.',
      ],
      claims: [
        {
          text: 'The environment variable for effort level takes precedence over all settings files.',
          source: SRC.MODELS,
        },
        {
          text: 'Pressing s in the picker applies the change for the current session only, while Enter saves it as the default.',
          source: SRC.MODELS,
        },
      ],
    },
    {
      id: 'prompting-changes',
      title: 'Your prompting should change when your model does',
      body: [
        'The documented guidance for the strongest tier is counterintuitive enough to be worth reading twice.',
        'Describe the OUTCOME, not the steps. Hand it ambiguous problems: root cause investigations, outage debugging, architecture decisions. SKIP THE VERIFICATION REMINDERS, because it verifies its own work with less prompting. And size up larger tasks rather than breaking them into pieces.',
        'That third one contradicts a habit most careful engineers have built. "Make sure you run the tests" is good practice on a smaller model and noise on a bigger one.',
      ],
      claims: [
        {
          text: 'Guidance for the strongest tier: describe the outcome rather than the steps, hand it ambiguous problems, skip the verification reminders because it verifies its own work with less prompting, and size up larger tasks.',
          source: SRC.MODELS,
        },
      ],
    },
  ],

  checklist: {
    title: 'Choosing, without a table',
    items: [
      'Is the hard part DECIDING, or carrying out a decision already made?',
      'Is the problem ambiguous, or specified?',
      'How long will this run?',
      'Would opusplan fit: plan strong, execute fast?',
      'Which default does your plan actually put you on?',
      'Are you reaching for max effort out of caution rather than need?',
      'Is an environment variable overriding the setting you just changed?',
      'Have you adjusted your PROMPTING for the model you switched to?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('model-config', 'Model configuration')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
