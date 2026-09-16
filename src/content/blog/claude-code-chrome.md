---
title: 'It Never Logged In. It Still Reached Everything.'
youtube: 'E7Wt3i29QtA'
cover: '/covers/cc-chrome.jpg'
start: 741
description: 'Claude in Chrome closes the loop between writing code and watching it run, by borrowing a browser session you are already signed into. That sentence explains both its power and exactly where it stops.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-advanced-01-chrome.pdf'
tags: ['claude-code', 'ai', 'testing']
series: 'Claude Code Advanced'
episode: 1
duration: '9:00'
draft: false
---

You built the UI. The code compiles, the tests pass, the diff looks right.

Now answer honestly: how do you know it actually works?

Most of the time you know because you alt-tabbed to a browser, clicked around
for thirty seconds, and decided it looked fine. Thirty seconds, forty times a
day. That is the loop this closes.

This is not "Claude can browse the web". It is the moment the tool that wrote
your code can also see it run.

## The shape of it

Claude Code, plus the Claude in Chrome browser extension, driven from the CLI
or the VS Code extension. Claude opens new tabs for browser tasks, and the
actions run in a **visible** Chrome window in real time, so you watch rather
than trusting a report.

```bash
claude --chrome
```

Run `/chrome` at any time to check the connection status, manage permissions,
reconnect the extension, or pick which browser to drive when more than one is
connected. It is working when the panel shows `Status: Enabled` and
`Extension: Installed`.

At the time of writing, September 2026, you need extension version 1.0.36 or
higher. It works with Chrome, Microsoft Edge, and other Chromium browsers
including Brave, Arc, Vivaldi and Opera.

## The distinction the whole feature turns on

Claude **shares your browser's login state**, so it can access any site you are
already signed into. Gmail, Notion, Google Docs, your company's admin panel,
with no API connectors and nothing to configure.

That is the whole reason it feels like magic the first time. But read the verb
again, because it is precise. It **shares**. It did not log in. It has never
authenticated as you and it will not. When it meets a login page, or a CAPTCHA,
it pauses and asks you to handle it manually. Every time.

That is not a gap somebody forgot to close. It is the design, and it is the
correct one: an agent that could complete a login flow on your behalf would be
an agent that could be talked into doing so by a web page.

Keep the shape of it in mind, because it is the hinge of everything that
follows: **the session is borrowed from a browser you are sitting in front of.**

## What it is actually for

**Testing what you just built** is the strongest use and the one that pays for
the setup on day one.

```
I just updated the login form validation. Open localhost:3000,
try submitting the form with invalid data, and check the error
messages appear correctly.
```

It navigates, it interacts, and it reports what it observed. Here is that exact
prompt running against a local demo page, recorded by Claude in Chrome itself:

![Claude in Chrome filling a login form with an invalid email and a five character password, and the two validation errors appearing](/demo/claude-in-chrome-form-validation.gif)

It typed `sam@acme`, typed a five character password, clicked Sign in, and both
validation messages appeared. The page is a local demo that validates and
authenticates nothing, which is deliberate: an agent near a real login is the
thing this series spends an entire episode telling you not to do.

The debugging half works the same way. The demo page logs its failures with a
`[signin]` prefix, so the instruction is "check the console for `[signin]`
errors" rather than "show me the console", which is the advice about telling it
what pattern to look for, applied to itself.

**Live debugging.** It reads console errors and DOM state directly, then fixes
the code that caused them. One instruction from the documentation will save you
a great deal of context: tell it what pattern to look for rather than asking
for all the console output, because logs are verbose and every line costs you.

**Design verification.** Build the UI from a mock, open it, check it matches.
That is a loop that used to need a person in it.

Then the long tail, which is where people find their own use: visual
regressions, user flows, data extraction to a CSV, repetitive form filling from
a local file, multi-site workflows across tabs, drafting straight into a web
app you are signed into, and recording an interaction as a GIF.

That last one carries a warning worth repeating out loud. The recording
captures **everything visible in the browser**, including account details on
logged-in pages. Review it before it leaves your team.

## Plan mode: reading is free, changing asks

The safety model is better designed than people expect.

In plan mode, browser tool calls that only read the page or browser state run
**without a permission prompt**. Calls that change state prompt for approval.

| Runs with no prompt | Asks for approval |
|---|---|
| `read_page`, `get_page_text`, `find` | Clicks and typing |
| Reading console messages or network requests | Navigation |
| Taking a screenshot | Tab and window management |
| | Recording a GIF |

And the detail that shows somebody thought it through: an otherwise read-only
call **also** prompts when it sets a state-changing input flag. `save_to_disk`
on a screenshot. `createIfEmpty` on the tab context call. `clear` on the
console and network readers. A `browser_batch` call runs without a prompt only
when every action inside it is read-only.

Underneath all of that, site-level permissions are inherited from the Chrome
extension, so which sites Claude may browse, click and type on is yours to set.

## Uploads, and what happens to your tabs

Claude can attach files from your machine to upload fields, and it works in
remote sessions too, because Claude Code reads the file and sends its contents
to the browser. Three restrictions apply:

- **Permissions**: it can upload a file only when the session is allowed to
  **read** it, so a rule denying `Read` also blocks the upload.
- **Size**: 10 MB of files in total for a single upload.
- **Hard links**: it refuses files with multiple hard links, which is common
  inside package-manager stores like `node_modules`. Copy the file and upload
  the copy.

The tabs Claude opens are collected into a Chrome tab group tied to your
session. `/clear` closes that group, open pages included, unless work that
survives the clear is still running. Exiting or switching sessions closes it
only if it holds nothing but empty new tabs, so a page you may still be reading
stays open.

## Check these before you start

This feature has more preconditions than anything else in Claude Code, and
every one of them has cost somebody an evening. All checked September 2026.

| Requirement | What happens otherwise |
|---|---|
| A direct Anthropic plan (Pro, Max, Team, Enterprise) | Not available through Bedrock, Google Cloud's Agent Platform or Microsoft Foundry |
| Sign in with `/login` | An API key or long-lived token keeps the integration off, even with the flag |
| Not WSL | Unsupported |
| Extension 1.0.36 or higher | Not detected |
| "Enabled by default" | **Increases context usage**, browser tools always loaded |

That last row is the context lesson arriving again: everything in the window
has a price. If you notice context climbing, turn it off and use `--chrome`
only when you need it.

## The three failures you will actually hit

**The browser stops responding entirely.** Check for a modal dialog. A
JavaScript alert, confirm or prompt blocks browser events and prevents Claude
from receiving any commands. Dismiss it yourself, then tell Claude to continue.

**It worked for an hour and then stopped.** The extension's service worker goes
idle during extended sessions, which breaks the connection. `/chrome`, then
"Reconnect extension". The error `Receiving end does not exist` is this.

**It was never detected.** Check the extension is installed and enabled in
`chrome://extensions`, check Chrome is running, then **restart Chrome once**.
The first time you enable the integration, Claude Code installs a native
messaging host configuration file, and Chrome only reads that file at startup.

## The honest framing

A browser is a stateful, slow, flaky dependency, and an agent driving one
inherits all three.

What it is superb at is the loop between a change and its effect: I changed
this, show me what happened. That loop used to require a person, and a tool
that closes it is a real shift in how a working day feels.

What it is not is a replacement for a test suite. A suite is fast,
deterministic, and runs in CI with no browser, no login, and no service worker
that has to stay awake.

So if you find yourself using Claude in Chrome to verify the same thing for the
third time, you have not found a workflow. You have found a missing test.

And if the task genuinely cannot be done in a browser at all, the documentation
points you at computer use, which drives native macOS applications instead.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
