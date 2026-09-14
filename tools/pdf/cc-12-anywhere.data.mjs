/**
 * Claude Code Advanced Episode 2 design sheet: work from anywhere.
 *
 * Verified 2026-09-13 against the Remote Control and Desktop pages, re-fetched
 * the day this sheet was written.
 *
 * THE SHEET IS ORGANISED AROUND ONE QUESTION, not around a product. Where does
 * the work run? Three ways to reach a session look identical on a phone and
 * two of them need a machine of yours switched on, and once a reader holds
 * that, every limit further down stops being arbitrary.
 *
 * THE LINE THAT MATTERS MOST IS THE LAST SECTION'S, and it is deliberately
 * unglamorous: sign in before you leave. It is the only mitigation that exists
 * for the failure most likely to ruin somebody's journey.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Work From Anywhere',
  subtitle: 'Claude Code Advanced, episode 2',
  kicker: 'Claude Code Advanced: the browser, the phone, the company',
  strapline: 'This is not Claude Code on your phone. The phone is the screen. You are choosing where the work happens.',
  verifiedOn: '2026-09-13',

  intro: [
    'Your laptop is shut and you are on a train. Is your task still running? That question has three different answers, they look identical on a phone, and which one applies to you was decided before you left, by a command you typed at your desk.',
    'This sheet is the three answers, the one question that separates them, what works from a phone and what does not, and the mitigation for the failure most likely to ruin the journey.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Cloud sessions, Remote Control and Dispatch, and where each one runs',
      'Starting Remote Control, and the three ways in',
      'Working from terminal, browser and phone at the same time',
      'What happens when the laptop sleeps or the network drops',
      'Push notifications, and asking for one in the prompt',
      'Which slash commands work from mobile and web, and which do not',
      'Every documented limit, dated',
      'The login wall, and the one mitigation that works',
    ],
    outTitle: 'Out of scope',
    out: [
      'The Claude mobile app’s own features, which are separate',
      'Cowork, which is a different product surface',
      'Anything that requires the agent to log in for you, which none of them do',
      'Advice about which phone to buy, which is not a software problem',
    ],
    note: 'Read the decision table first. Everything else on this page is a consequence of which row you are on.',
  },

  scale: {
    title: 'Where the work runs, and what it needs',
    note: 'Checked September 2026. The middle column is the whole subject: two of the three ways in need a machine of yours switched on.',
    rows: [
      ['Cloud session (claude.ai/code)', 'Anthropic cloud. Your laptop can be shut'],
      ['Remote Control', 'YOUR machine. It must stay awake'],
      ['Dispatch (mobile app)', 'YOUR machine via Desktop. Pro or Max only'],
      ['Dispatch on Team or Enterprise', 'not available'],
      ['Remote Control on Team or Enterprise', 'off until an Owner enables it'],
      ['Remote sessions per instance', 'one, outside server mode'],
      ['Server mode, machine awake but offline', 'gives up after roughly 10 minutes'],
      ['Interactive session, same situation', 'keeps retrying, reconnects on its own'],
      ['Forwarded non-permission dialog', 'waits 5 minutes, then its no-action default'],
    ],
  },

  sections: [
    {
      id: 'three-ways',
      title: 'Three ways in, and the question that separates them',
      body: [
        'A CLOUD SESSION runs on cloud infrastructure that Anthropic manages, so nothing of yours has to be switched on.',
        'REMOTE CONTROL connects claude.ai/code or the Claude mobile app to a session running on your machine. The documentation is exact: Claude keeps running locally the entire time, so your code execution and filesystem access stay on your machine.',
        'DISPATCH is a conversation you message a task to; it decides the task is development work and spawns a Claude Code session, which appears in the Code tab with a Dispatch badge. It requires a Pro or Max plan and is not available on Team or Enterprise.',
        'So the decision rule is one question: WILL YOUR COMPUTER BE OFF? If yes, you need a cloud session, because Remote Control runs as a local process and goes offline when that process stops. If no, and the work needs your local filesystem or MCP servers, Remote Control is the only one of the three that has them.',
      ],
      claims: [
        {
          text: 'When you start a Remote Control session on your machine, Claude keeps running locally the entire time, so your code execution and filesystem access stay on your machine.',
          source: SRC.REMOTE,
        },
        {
          text: 'Dispatch requires a Pro or Max plan and is not available on Team or Enterprise plans.',
          source: SRC.DESKTOP,
        },
      ],
    },
    {
      id: 'starting-it',
      title: 'Starting Remote Control, and the three doors',
      body: [
        '`claude remote-control` runs a server that stays in your terminal waiting for remote connections, showing a session URL, with spacebar to toggle a QR code.',
        '`claude --remote-control` (or `--rc`) gives you a normal interactive session in your terminal that is ALSO available remotely, so you can still type locally.',
        '`/remote-control` (or `/rc`) inside a session you already have continues that one remotely. The VS Code extension uses the same command.',
        'If you do not have the app, `/mobile` displays a download QR code. And to keep a session alive on a remote machine after you disconnect from SSH, start it inside tmux or screen.',
      ],
      claims: [
        {
          text: 'The process stays running in your terminal in server mode. It displays a session URL, and you can press spacebar to show a QR code for quick access from your phone.',
          source: SRC.REMOTE,
        },
        {
          text: 'To keep a session running on a remote machine after you disconnect from SSH, start it inside tmux or screen.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'both-surfaces',
      title: 'It is one session with more windows, not a handover',
      body: [
        'The conversation, and the progress of subagents and dynamic workflows, stay in sync across all connected devices, so you can send messages from your terminal, browser and phone interchangeably.',
        'And it survives interruption. If your laptop sleeps or your network drops, Claude Code reconnects automatically when your machine comes back online. While the connection is rebuilding it QUEUES messages, permission prompts and status updates from subagents and workflows, and delivers them once the connection recovers.',
        'Which turns a tunnel into an inconvenience rather than a lost session. The permission prompt you missed is waiting for you, not gone.',
        'One asymmetry worth carrying: if your machine is awake but cannot reach the network, server mode gives up after roughly ten minutes and the process exits, while an interactive session keeps retrying for as long as the outage lasts.',
      ],
      claims: [
        {
          text: 'The conversation and the progress of subagents and dynamic workflows stay in sync across all connected devices.',
          source: SRC.REMOTE,
        },
        {
          text: 'While the connection is rebuilding, Claude Code queues messages, permission prompts, and status updates from subagents and workflows, and delivers them once the connection recovers.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Ask for the notification instead of checking',
      body: [
        'Claude decides when to push, and typically sends one when a long-running task finishes or when it needs a decision from you to continue.',
        'You can also request a push in your prompt, for example "notify me when the tests finish". Beyond the on and off toggles there is no per-event configuration, so the prompt is the control.',
        'Attachments go the other way. A photo from your phone is saved under your Claude uploads directory and the PATH is given to Claude; other files are downloaded and passed as @ references. A screenshot of a broken screen, taken on the phone, is simply input.',
      ],
      claims: [
        {
          text: 'You can request a push in your prompt, for example "notify me when the tests finish". Beyond the two on/off toggles there is no per-event configuration.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'commands',
      title: 'What works from a phone, and the rule underneath it',
      body: [
        'Some commands are LOCAL ONLY. Commands that only run in the terminal interface, such as /plugin or /resume, work only from the local CLI, whether or not you pass an argument.',
        'Text-output commands work as they are: /compact, /clear, /context, /usage, /exit, /usage-credits, /recap and /reload-plugins.',
        'Commands that open a picker or a slider take the value as an ARGUMENT instead: /model sonnet, /effort high, and the same for /fast, /color and /rename.',
        '/mcp from the mobile app returns a text summary of server status rather than opening the picker, and its reconnect, enable and disable subcommands work from both mobile and web.',
        'The rule underneath all of it: anything that needs a terminal interface stays in the terminal, and everything else grew a text form. Learn the rule and you can predict the answer without looking it up.',
      ],
      claims: [
        {
          text: 'Commands that only run in the terminal interface, such as /plugin or /resume, work only from the local CLI, whether or not you pass an argument.',
          source: SRC.REMOTE,
        },
        {
          text: 'From mobile and web, /model and /effort take the argument in place of the terminal picker or slider.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'limits',
      title: 'The harder limits, dated',
      body: [
        'Remote Control requires a claude.ai subscription. If an API key or an auth token is in use, that credential takes precedence and Remote Control refuses, naming the credential it found. A long-lived token from `claude setup-token` can only make model requests, so it cannot establish a Remote Control session at all.',
        'Outside server mode, each Claude Code instance supports one remote session at a time. Server mode exists to run several from one process.',
        'Remote Control is available on all plans, but on Team and Enterprise it is OFF by default until an Owner enables the toggle in the Claude Code admin settings.',
        'And a forwarded dialog that is neither a permission prompt nor a question, such as the model-choice prompt after a safety refusal, waits five minutes by default and then closes with its no-action default. Permission prompts and questions stay open until answered.',
      ],
      claims: [
        {
          text: 'Remote Control is available on all plans. On Team and Enterprise, it is off by default until an Owner enables the Remote Control toggle in Claude Code admin settings.',
          source: SRC.REMOTE,
        },
        {
          text: 'Long-lived tokens can only make model requests, so they cannot establish Remote Control sessions.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'other-doors',
      title: 'Two more doors, and the same question again',
      body: [
        'CHANNELS forward a chat app into a session, Telegram, Discord or iMessage, or your own server through a webhook, so Claude reacts to external events such as a CI failure while you are away. The work runs on YOUR machine, through the CLI.',
        'SLACK is a different animal: mention @Claude in a team channel, and the work runs in Anthropic’s cloud. That makes it the right door for pull requests and reviews from team chat, and the wrong one for anything that needs your laptop.',
        'Notice what that comparison is really saying. Every one of these surfaces is the same question in a different costume: which machine does the work, and does it have to be yours.',
      ],
      claims: [
        {
          text: 'Channels forward Telegram, Discord, or iMessage into a session so Claude reacts to messages while you are away, running on your machine through the CLI.',
          source: SRC.CHANNELS,
        },
        {
          text: 'With the Slack app, mentioning @Claude in a team channel runs the work in Anthropic cloud.',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'the-login-wall',
      title: 'The one to actually remember',
      body: [
        'A Remote Control session can reach anything you are signed into on that machine. That is the power of it.',
        'And when it meets a login page, it pauses and asks a human to handle it. On a train, that human is at home, asleep, under a laptop lid.',
        'This is the same design as the browser integration and it is the correct one: it never authenticates as you, and it does not start doing so because you happen to be far away.',
        'The mitigation is one line and it is completely unglamorous. SIGN IN BEFORE YOU LEAVE. Open the things the task is going to touch while you are still at the desk. The next episode is about this wall and the rest of what the tool genuinely cannot do.',
      ],
      claims: [
        {
          text: 'When Claude encounters a login page or CAPTCHA, it pauses and asks you to handle it manually.',
          source: SRC.CHROME,
        },
        {
          text: 'Signing in to what the task will touch before you leave the machine is operational practice, not a documented feature.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you leave the desk',
    items: [
      'Will my machine be awake for the whole of this?',
      'Does the work need my local filesystem or MCP servers? Then it is Remote Control',
      'If the laptop is going in a bag, is this a cloud session instead?',
      'Am I signed into everything the task is going to touch?',
      'Over SSH? Is it inside tmux or screen?',
      'Have I asked for a notification, rather than planning to keep checking?',
      'Do I need /plugin or /resume during this? Those stay in the terminal',
      'On Team or Enterprise: has an Owner actually enabled Remote Control?',
      'Am I signed in with claude.ai rather than an API key or a setup token?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('remote-control', 'Remote Control')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
