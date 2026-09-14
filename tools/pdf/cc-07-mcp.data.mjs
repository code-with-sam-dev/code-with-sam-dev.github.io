/**
 * Claude Code Episode 7 design sheet: MCP.
 *
 * Verified 2026-09-13. The security section is the reason this sheet exists:
 * it is a documented warning that most people connecting servers have never
 * read, and it is quoted rather than paraphrased.
 */
import {CHANNEL_LINKS, docsLink, ANTHROPIC_TRADEMARK, CLOSING, SRC, PERISHABLE_NOTE}
  from './claude-code-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'MCP, And What It Costs You',
  subtitle: 'Claude Code deep dive, episode 7',
  kicker: 'Claude Code: from first install to life after production',
  strapline: 'The server does not have to be malicious. It only has to be useful.',
  verifiedOn: '2026-09-13',

  intro: [
    'You connected six servers. Most people assume the cost is context: six servers of tool definitions eating the window before you ask anything.',
    'That used to be the right worry. It mostly is not any more, and the thing that replaced it gets discussed far less.',
    PERISHABLE_NOTE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What MCP is, and why it reaches outside your codebase',
      'The four transports, and the double dash',
      'Scopes, and the one that travels with the repository',
      'What connected servers actually cost your context now',
      'The cost that matters, quoted from the documentation',
      'Why a cloned repository cannot approve its own servers',
      'Authentication, including the headers helper',
    ],
    outTitle: 'Out of scope',
    out: [
      'Writing an MCP server',
      'Any specific server as a recommendation',
      'Organisation-level server policy, which is episode 15',
      'Protocol internals',
    ],
    note: 'Three questions before adding another server are in the checklist. The third deletes most candidates.',
  },

  scale: {
    title: 'The three scopes',
    note: 'These are interview assumptions chosen to make the behaviour concrete. They are not published figures from any provider and no claim is made about any particular deployment.',
    rows: [
      ['local (the default)', 'you, this project, not shared'],
      ['user', 'you, all your projects'],
      ['project', 'anyone who clones, via .mcp.json'],
      ['Recommended remote transport', 'HTTP'],
      ['Deprecated transport', 'SSE'],
      ['Local transport', 'stdio, after a double dash'],
    ],
  },

  sections: [
    {
      id: 'what-it-is',
      title: 'The part that reaches outside your codebase',
      body: [
        'MCP is an open source standard for connecting AI tools to external systems. MCP servers give Claude Code access to your tools, your databases and your APIs.',
        'The important word in that sentence is YOUR.',
        'Everything else in this course is about the codebase. This is the feature that reads the ticket, checks the dashboard and queries staging.',
      ],
      claims: [
        {
          text: 'Claude Code can connect to hundreds of external tools and data sources through the Model Context Protocol, an open source standard for AI-tool integrations. MCP servers give Claude Code access to your tools, databases, and APIs.',
          source: SRC.MCP,
        },
      ],
    },
    {
      id: 'adding',
      title: 'Adding one, and the boundary that trips people',
      body: [
        'One command, four transports. HTTP is recommended for anything remote. SSE is deprecated, so prefer the HTTP form if a tutorial hands you it. There is a local form and a websocket variant.',
        'On the local form, the DOUBLE DASH separates Claude’s own options from the command that actually runs the server.',
        'Everything before it configures Claude Code; everything after it is the program. Get that boundary wrong and the error will not obviously tell you which half was misread.',
      ],
      claims: [
        {
          text: 'The double dash separates Claude’s own options from the command and arguments that run the server.',
          source: SRC.MCP,
        },
        {
          text: 'Remote HTTP is the recommended transport, and SSE is deprecated.',
          source: SRC.MCP,
        },
      ],
    },
    {
      id: 'scope',
      title: 'Project scope is the one that changes a team',
      body: [
        'Local is just you in this project, and it is the default. User is you across all your projects.',
        'PROJECT writes a .mcp.json file at the repository root, so it goes into version control and everyone who clones gets the same servers configured.',
        'That is the same move as putting a skill in the project instead of your home folder: it is how a setup stops being yours and starts being the team’s.',
      ],
      claims: [
        {
          text: 'Project scope stores the configuration in .mcp.json at the project root, which is shared via version control.',
          source: SRC.MCP,
        },
      ],
    },
    {
      id: 'context-cost',
      title: 'What six servers cost you now',
      body: [
        'It used to be real: connect many servers and their tool definitions sat in your window from the moment the session began.',
        'That changed. Claude Code keeps a discovery cache, so instead of connecting to every server at startup it uses tool lists learned in previous sessions, and a server connects the first time one of its tools is needed.',
        'You can see it in the status line: cached two hours ago, connects on first use, five tools. So the answer is: less than you think. Which is good, and is not the answer that matters.',
      ],
      claims: [
        {
          text: 'Claude Code uses a discovery cache to load servers’ tool lists from previous sessions rather than connecting at startup, and servers connect the first time their tools are needed.',
          source: SRC.MCP,
        },
        {
          text: 'MCP tool definitions are deferred by default and loaded on demand via tool search.',
          source: SRC.HOW,
        },
      ],
    },
    {
      id: 'the-real-cost',
      title: 'The cost that actually matters',
      body: [
        'Verify you trust each server before connecting it. Servers that fetch external content can expose you to prompt injection risk.',
        'Two things are being said. First: an MCP server is CODE, usually somebody else’s, running with your access. That is the ordinary supply chain question and you know how to think about it.',
        'Second, and this is the one people miss: a server that FETCHES EXTERNAL CONTENT hands that content to your agent. A web page. A ticket description. A pull request comment. If that text contains instructions, your agent is reading instructions written by whoever wrote the ticket. The server does not have to be malicious for that to be true. It only has to be useful.',
      ],
      claims: [
        {
          text: 'Verify you trust each server before connecting it. Servers that fetch external content can expose you to prompt injection risk.',
          source: SRC.MCP,
        },
        {
          text: 'Content returned by a server is data the agent reads, so a useful server that relays text written by third parties widens the surface without being compromised itself.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'approval',
      title: 'Seven words that explain a whole design',
      body: [
        'Project scoped servers, the ones that arrive in a repository you cloned, require approval before they will be used.',
        'And the documentation gives the reason beautifully: a cloned repository cannot approve its own servers.',
        'Think about what that prevents. Without it, cloning a repo would be enough to give an agent on your machine a set of tools chosen by whoever wrote that repo. The trust decision is deliberately yours, and not something a file can grant itself.',
      ],
      claims: [
        {
          text: 'Project-scoped servers from .mcp.json require approval before use in interactive sessions, because a cloned repository can’t approve its own servers.',
          source: SRC.MCP,
        },
      ],
    },
    {
      id: 'auth',
      title: 'Authentication, and the part nobody knows about',
      body: [
        'Most hosted servers use OAuth: add the server, then authenticate through a browser login, or use the login command.',
        'A server that needs it says so in its status rather than failing silently, and Claude Code marks one as needing authentication when it gets a 401 or a 403 back.',
        'For internal systems that do not use OAuth there is a headers helper: point at a script, it prints a JSON object of headers, and Claude Code runs it FRESH on every connection. That last detail is what makes short lived tokens and internal single sign on workable.',
      ],
      claims: [
        {
          text: 'Claude Code marks a remote server as needing authentication when the server responds with 401 Unauthorized or 403 Forbidden.',
          source: SRC.MCP,
        },
        {
          text: 'A headersHelper command writes a JSON object of string key-value pairs to stdout, and Claude Code runs the helper fresh on each connection.',
          source: SRC.MCP,
        },
      ],
    },
  ],

  checklist: {
    title: 'Three questions before you add another server',
    items: [
      'Does it remove a context switch I make several times a DAY?',
      'Does it return content somebody else wrote?',
      'Could I do this with a command line tool I already have?',
      'Whose server is it, and what happens if it is compromised?',
      'What is this session permitted to DO while that server feeds it text?',
      'Should this be project scope, so the team gets it too?',
      'Does it need OAuth, or an internal headers helper?',
      'When did you last remove one you stopped using?',
    ],
  },

  links: [...CHANNEL_LINKS, docsLink('mcp', 'MCP')],
  trademarks: ANTHROPIC_TRADEMARK,
  closing: CLOSING,
};
