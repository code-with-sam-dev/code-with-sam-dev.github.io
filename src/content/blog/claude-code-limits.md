---
title: 'It Never Tried To Log In'
youtube: 'E7Wt3i29QtA'
cover: '/covers/cc-limits.jpg'
start: 1182
description: 'You are on a train, the session is on the laptop at your desk, and it just stopped at a login page. The reason is not the one people assume, and one of these limits is not a limit at all.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-advanced-03-limits.pdf'
tags: ['claude-code', 'ai', 'security']
series: 'Claude Code Advanced'
episode: 3
duration: '9:30'
draft: true
---

You are on a train. A Remote Control session is running on the laptop at your
desk. You ask it to check something in the admin dashboard. It opens Chrome on
your desk machine, hits a login page, and pauses to ask you to handle it
manually.

The browser it needs you to touch is ninety miles away.

Every other article about this tool is upside. This one is the boundaries,
because a viewer who designs a workflow around a capability that does not exist
loses a day, and a viewer who hears the boundaries first designs something that
works.

And one of the limits below is not a limit at all, once you see what is
actually happening.

## It did not fail to log in

The reason it stopped is not the one people assume.

Claude in Chrome works because it **shares your browser's login state**, so it
can access any site you are already signed into. It rides a session that *you*
established. It never authenticated as you, and it cannot.

At a login page, or a CAPTCHA, it pauses and asks you to handle it manually.
That is the documented behaviour and it happens every time.

Which reframes the whole problem. The question is not *why can it not log in*.
It is: **does the session it needs to borrow already exist?**

A cloud session does not even have the option. It runs on other infrastructure,
with no access to your browser and no cookies to borrow.

## Why the boundary is correct, not unfinished

This is worth defending rather than complaining about.

**A tool that will type your password into a login page is a tool that can be
talked into typing it somewhere else.**

Think about what an agent reads in a normal working day. A web page. A ticket
description. A pull request comment. A search result. All of it text written by
other people.

If that agent also held your credentials and was willing to use them at any
login form it met, then every one of those is a potential instruction to hand
them over.

The boundary is the thing that makes the rest of it safe to use. It is the same
reasoning behind the MCP warning that servers fetching external content can
expose you to prompt injection risk. One problem, two hats.

## Why the phone makes everything else harder

Here is the sentence the whole subject reduces to:

> Working from your phone **multiplies** the number of moments that need a
> human, while **removing** your ability to be that human.

The pause at a login page needs somebody at the browser. On a train, nobody is
at the browser.

### And the permission situation is exactly backwards

The surface where you are **least** able to respond is the surface that asks
you the **most**.

| Where the session runs | Modes you can pick from the app |
|---|---|
| Remote Control, your machine | Manual, Accept edits, Plan. **Not Auto** |
| Cloud session | Accept edits, Plan, Auto (if your org allows it) |
| Either | Bypass permissions: not selectable |

Auto is the mode where a classifier reviews actions in the background instead
of stopping to ask you. So on the surface where you can least respond, you are
locked out of the mode that asks least.

The useful half: **you can set the starting permission mode when you launch the
local session.** That makes it a decision you take at the desk, not one you
discover on a train.

## Four more that will find you

- `/resume` and `/plugin` **do not work from the app**, so you cannot pick up a
  different session from the train. You get the one you left running.
- **Your machine has to stay awake.** Remote Control and Dispatch drive your own
  computer. If it sleeps mid-session Claude Code reconnects when it is back
  online, which is comforting at a desk and useless in a tunnel.
- **Dispatch needs Pro or Max**, and is not available on Team or Enterprise.
- **Remote Control on Team and Enterprise is off** until an Owner enables it in
  admin settings, so it may simply not be there when you first try.

## Your authentication method decides your features

This is the one that catches whole companies, and it is worth knowing on day
one rather than in month three.

| How you authenticate | What you lose |
|---|---|
| API key or long-lived token | Chrome integration, even with the flag |
| API key or long-lived token | Remote Control cannot be established |
| Bedrock, Google Cloud, Foundry | Chrome, cloud sessions **and** Remote Control |
| WSL | Chrome integration |

An API key or a long-lived token turns Chrome integration off even if you pass
`--chrome`, because the extension cannot authenticate with those credentials.
Those tokens can only make model requests, so they cannot establish a Remote
Control session at all.

If your company routes everything through a third-party provider, several parts
of this course do not apply to you.

## The rest, gathered honestly

- **Checkpoints cover files only**, and only changes made through Claude's own
  file-editing tools. Anything that left the machine cannot be undone.
- **Context is finite and compaction is not neutral.** Older tool outputs go
  first, then the conversation is summarised, and detailed early instructions
  may not survive.
- **Uploads**: 10 MB total, the session must be permitted to read the file, and
  files with multiple hard links are refused, which hits `node_modules`.
- **A JavaScript dialog freezes the browser integration**, because it blocks
  browser events entirely.
- **The extension's service worker goes idle** in long sessions.
- **Enabling Chrome by default costs you context every session**, whether you
  use it or not.

All cheap to know, all expensive to discover.

## The useful half: what to do instead

1. **Sign in before you leave.** The session it borrows has to already exist.
2. **Choose a cloud session** for work that must survive you walking away, and
   accept that it cannot touch anything behind your personal logins.
3. **Prefer an API and a token you control over a UI and a password.** This is
   the one that solves the problem rather than working around it.
4. **Front-load the approvals.** Allow-list the commands the task will need, and
   set the permission mode at launch, so the prompts that remain are worth an
   interruption.
5. **Ask for a push notification** instead of checking every ten minutes.

## The reframe, and this is the point

**The wall is around interactive login. It is not around authenticated access.**

If the thing you want is behind a user interface and a password, you are stuck
the moment you are not at that machine. If the same thing is behind an API and
a token you control, the agent reaches it on any surface, on any provider, with
no browser involved at all.

That is not a workaround. It is the correct architecture arriving through the
back door: **a system you can automate is a system whose interface is not a
login form.**

So the limitation is doing you a favour. It is telling you, precisely and for
free, which of your dependencies are actually automatable and which are not.

## Junior and senior

A junior discovers the boundary at the worst possible moment, on a train,
halfway through something, and concludes the tool is unreliable.

A senior checks the boundary **before** designing the workflow.

That is the whole difference. Every item here costs about ten seconds to know
and about a day to find out the hard way. And the habit that follows is not
caution, it is design: work out which parts of the job need a human at a
keyboard, and arrange for those to happen while you are still at the keyboard.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
