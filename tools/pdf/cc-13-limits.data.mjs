/**
 * Claude Code Advanced Episode 3 design sheet: what it cannot do.
 *
 * Verified 2026-09-13 against the Chrome, Remote Control, permission-modes,
 * checkpointing and costs pages, all re-fetched the day this was written.
 *
 * THIS IS A LIMITS PAGE THAT HAS TO NOT BE A COMPLAINT. The discipline that
 * keeps it useful: every boundary is paired with what to do instead, and the
 * page ends on the reframe rather than on the list. A reader who prints this
 * should come away with a design decision, not a grievance.
 *
 * THE SENTENCE THE PAGE IS BUILT ON is that the wall is around INTERACTIVE
 * LOGIN, not around authenticated access. It converts the whole subject from
 * "the tool is limited" into "some of your dependencies are not automatable,
 * and here is how to tell which".
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'What It Cannot Do',
  subtitle: 'Claude Code Advanced, episode 3',
  kicker: 'Claude Code Advanced: the browser, the phone, the company',
  strapline: 'It never authenticated as you. The wall is around interactive login, not around access.',
  verifiedOn: '2026-09-13',

  intro: [
    'You are on a train. A Remote Control session is running on the laptop at your desk. You ask it to check the admin dashboard. It opens Chrome, hits a login page, and pauses to ask you to handle it manually. The browser is ninety miles away.',
    'Every other page about this tool is upside. This one is the boundaries, because a workflow designed around a capability that does not exist costs a day, and knowing the boundary costs ten seconds.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why it stops at a login, and why that is not a missing feature',
      'Why working from a phone makes every other limit harder',
      'Permission modes by surface, and the one you cannot pick',
      'What authentication method costs you which features',
      'Every other documented boundary, in one place',
      'Five things to do instead',
      'The reframe: interactive login versus authenticated access',
    ],
    outTitle: 'Out of scope',
    out: [
      'Ways around the login boundary. There are none, and there should not be',
      'Complaints about behaviour that is working as designed',
      'Anything undated: a limit without a date is not useful a year from now',
      'Model capability, which is a different subject entirely',
    ],
    note: 'Read the last section before the middle ones. It is what turns this page from a list of limits into a design decision.',
  },

  scale: {
    title: 'Every boundary on one line, checked September 2026',
    note: 'Most of these are deliberate rather than unfinished. The ones that are configuration are marked as such, because those can change without warning.',
    rows: [
      ['Login pages and CAPTCHAs', 'it pauses and asks YOU. Every time, by design'],
      ['Remote Control modes from the app', 'Manual, Accept edits, Plan. NOT Auto'],
      ['Bypass permissions from the app', 'not selectable on either surface'],
      ['/resume and /plugin from the app', 'local CLI only'],
      ['API key or long-lived token', 'no Chrome integration, no Remote Control'],
      ['Bedrock, Google Cloud, Foundry', 'no Chrome, no cloud sessions, no Remote Control'],
      ['WSL', 'no Chrome integration'],
      ['Dispatch', 'Pro or Max only, not Team or Enterprise'],
      ['Remote Control on Team or Enterprise', 'OFF until an Owner enables it (configuration)'],
      ['Checkpoints', 'files only, and only Claude’s own editing tools'],
      ['Uploads', '10 MB total, readable by the session, no multiply hard-linked files'],
      ['A JavaScript dialog', 'freezes the browser integration entirely'],
    ],
  },

  sections: [
    {
      id: 'not-a-login',
      title: 'It did not fail to log in. It was never logging in',
      body: [
        'Claude in Chrome works because it SHARES your browser’s login state, so it can access any site you are already signed into. It rides a session that you established.',
        'It never authenticated as you, and it cannot. When it encounters a login page or a CAPTCHA, it pauses and asks you to handle it manually.',
        'Which reframes the question entirely. It is not "why can it not log in". It is "does the session it needs to borrow already exist, on that machine, right now".',
        'And a cloud session does not even have the option: it runs on other infrastructure, with no access to your browser and no cookies to borrow.',
      ],
      claims: [
        {
          text: 'Claude shares your browser’s login state, so it can access any site you are already signed into. When Claude encounters a login page or CAPTCHA, it pauses and asks you to handle it manually.',
          source: SRC.CHROME,
        },
      ],
    },
    {
      id: 'deliberate',
      title: 'Why the boundary is correct, not unfinished',
      body: [
        'A tool that will type your password into a login page is a tool that can be talked into typing it somewhere else.',
        'Consider what an agent reads in an ordinary working day: a web page, a ticket description, a pull request comment, a search result. All of it written by other people.',
        'If that agent held your credentials and was willing to use them at any login form it met, then every one of those pieces of text is a potential instruction to hand them over. The boundary is what makes the rest of the tool safe to use.',
        'This is the same reasoning behind the MCP warning that servers fetching external content can expose you to prompt injection risk. It is one problem wearing two hats.',
      ],
      claims: [
        {
          text: 'Servers that fetch external content can expose you to prompt injection risk.',
          source: SRC.MCP,
        },
        {
          text: 'That a credential-using agent is a larger attack surface than a credential-free one is a judgement about design, not a documented claim.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'the-phone',
      title: 'Why the phone makes everything else harder',
      body: [
        'One sentence explains the whole episode: working from your phone MULTIPLIES the number of moments that need a human, while REMOVING your ability to be that human.',
        'The pause at a login page needs somebody at the browser, and the browser is on the machine at your desk.',
        'And the permission situation is exactly backwards from what you would want. From the app, a Remote Control session offers Manual, Accept edits and Plan; you cannot select Auto or Bypass permissions. A cloud session offers Accept edits, Plan and Auto, where Auto appears only when your organisation allows it and the model supports it.',
        'Auto is the mode where a classifier reviews actions in the background instead of stopping to ask you. So the surface where you are least able to respond is the surface that asks you most. The useful half: you CAN set the starting permission mode when you launch the local session, which makes it a decision you take at the desk.',
      ],
      claims: [
        {
          text: 'Remote Control sessions on your local machine offer Manual, Accept edits, and Plan. You cannot select Auto or Bypass permissions from the app.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'Cloud sessions offer Accept edits, Plan, and Auto. Auto mode appears only when your organization allows it and the selected model supports it. Bypass permissions is not available.',
          source: SRC.PERMISSIONS,
        },
      ],
    },
    {
      id: 'auth-decides',
      title: 'Your authentication method decides your features',
      body: [
        'This is the one that catches whole companies, and it is worth knowing on day one rather than in month three.',
        'If you authenticate with an API key or a long-lived token from `claude setup-token`, Claude Code keeps Chrome integration OFF even when you pass the flag, because the extension cannot authenticate with those credentials. The same tokens cannot establish a Remote Control session at all, because they can only make model requests.',
        'Third-party providers cut deeper. Through Amazon Bedrock, Google Cloud’s Agent Platform or Microsoft Foundry there is no Chrome integration, and cloud sessions and Remote Control need a claude.ai account, so they are not reachable either.',
        'If your organisation routes everything through a provider, several parts of this course do not apply to you. That is not a criticism of the setup, it is a thing to know before planning a workflow around a surface you cannot reach.',
      ],
      claims: [
        {
          text: 'If you authenticate with an API key or a long-lived token, Claude Code keeps Chrome integration off, even when you pass --chrome, because the browser extension cannot authenticate with those credentials.',
          source: SRC.CHROME,
        },
        {
          text: 'Chrome integration is not available through third-party providers like Amazon Bedrock, Google Cloud’s Agent Platform, or Microsoft Foundry.',
          source: SRC.CHROME,
        },
      ],
    },
    {
      id: 'the-rest',
      title: 'The rest, gathered honestly',
      body: [
        'CHECKPOINTS COVER FILES ONLY, and only changes made through Claude’s own file-editing tools. Anything that left the machine, an API call, a deployment, a row in a production database, cannot be undone by a rewind.',
        'CONTEXT IS FINITE AND COMPACTION IS NOT NEUTRAL. Older tool outputs are cleared first, then the conversation is summarised, and detailed instructions from early on may not survive.',
        'UPLOADS are capped at 10 MB total, the session must be permitted to READ the file, and files with multiple hard links are refused, which is common inside node_modules.',
        'BROWSER RELIABILITY: a JavaScript dialog blocks browser events and prevents Claude from receiving commands at all, and the extension’s service worker goes idle in long sessions, which needs a reconnect.',
        'And enabling Chrome by default increases context usage every session, because the browser tools are always loaded, whether or not today’s work touches a browser.',
      ],
      claims: [
        {
          text: 'Checkpoints only track changes made through Claude’s file editing tools. Changes made through Bash commands or other processes are not captured. Actions that affect remote systems cannot be checkpointed.',
          source: SRC.CHECKPOINTS,
        },
        {
          text: 'JavaScript dialogs block browser events and prevent Claude from receiving commands.',
          source: SRC.CHROME,
        },
      ],
    },
    {
      id: 'instead',
      title: 'The useful half: what to do instead',
      body: [
        'SIGN IN BEFORE YOU LEAVE. The session it borrows has to already exist on that machine. Open the things the task will touch while you are still at the desk.',
        'CHOOSE A CLOUD SESSION for work that must survive you walking away, and accept that it cannot touch anything behind your personal logins.',
        'PREFER AN API AND A TOKEN YOU CONTROL over a user interface and a password. This is the one that solves the problem rather than working around it.',
        'FRONT-LOAD THE APPROVALS. Allow-list the commands the task will need before you go, and set the starting permission mode when you launch the session, so the prompts that remain are the ones worth an interruption.',
        'ASK FOR A PUSH NOTIFICATION, "notify me when the tests finish", so you are interrupted when there is a decision rather than checking every ten minutes.',
      ],
      claims: [
        {
          text: 'You can set the starting permission mode when launching a local Remote Control session.',
          source: SRC.PERMISSIONS,
        },
        {
          text: 'You can request a push in your prompt, for example "notify me when the tests finish".',
          source: SRC.REMOTE,
        },
      ],
    },
    {
      id: 'the-reframe',
      title: 'The reframe, which is why this page is worth keeping',
      body: [
        'The wall is around INTERACTIVE LOGIN. It is not around authenticated access.',
        'If the thing you want is behind a user interface and a password, you are stuck the moment you are not sitting at that machine. If the same thing is behind an API and a token you control, the agent reaches it on any surface, on any provider, with no browser involved at all.',
        'That is not a workaround. It is the correct architecture arriving through the back door: a system you can automate is a system whose interface is not a login form.',
        'So the limitation is doing you a favour. It is telling you, precisely and for free, which of your dependencies are actually automatable and which are not.',
      ],
      claims: [
        {
          text: 'That the login boundary is a signal about which dependencies are automatable is a judgement, not a documented claim. The boundary itself is documented; the conclusion drawn from it is ours.',
          source: SRC.OPERATIONAL,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you design a workflow around it',
    items: [
      'Does any step need a login? Then it needs a human at that machine',
      'Am I signed into everything the task will touch, on the machine it runs on?',
      'Could this step use an API and a token instead of a UI and a password?',
      'Have I set the permission mode at launch, rather than hoping to change it later?',
      'Are the commands it will need already allow-listed?',
      'Does anything here leave the machine? No checkpoint reaches that',
      'Is my auth method claude.ai, or an API key that turns features off?',
      'On a third-party provider: which of these surfaces do I actually have?',
      'On Team or Enterprise: has an Owner enabled Remote Control?',
      'Have I asked for a notification instead of planning to check?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('permission-modes', 'Permission modes')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
