---
title: 'Your Laptop Is Shut. Is It Still Running?'
youtube: 'E7Wt3i29QtA'
cover: '/covers/cc-anywhere.jpg'
start: 824
description: 'That question has three completely different answers, and which one applies to you was decided before you left the house. All three look identical on your phone.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-advanced-02-anywhere.pdf'
tags: ['claude-code', 'ai', 'workflow']
series: 'Claude Code Advanced'
episode: 2
duration: '9:15'
draft: true
---

Your laptop is shut and you are on a train. Is your task still running?

That question has three completely different answers, and which one applies to
you was decided before you left the house, by a command you typed at your desk.
All three look identical on your phone: the same app, the same conversation,
the same messages arriving. They differ completely in what they need from you
and what they can reach.

So the question this is really about is not *how do I use Claude Code on my
phone*. It is: **where does the work actually happen?**

## Three ways in, and only one column matters

| How you reach it | Where the work runs | What that costs you |
|---|---|---|
| Cloud session, claude.ai/code | Anthropic cloud | nothing of yours has to be on |
| Remote Control | **your machine** | that machine has to stay awake |
| Dispatch, from the mobile app | **your machine**, via Desktop | Pro or Max only, not Team or Enterprise |

Two of the three need a computer of yours switched on. That is the whole
subject, and everything below is a consequence of which row you are on.

## Remote Control, which is the one people misunderstand

The documentation's sentence is exact: Claude keeps running locally the entire
time, so your **code execution and filesystem access stay on your machine**.

Which gives you what cloud cannot:

- your filesystem
- your MCP servers and tools
- your project configuration
- `@` autocompletes file paths from your **local** project

It is your real environment, reached from a phone.

### Three doors, and they are not the same

```bash
claude remote-control        # a server, stays running in your terminal
claude --remote-control      # a normal interactive session, also remote
/remote-control              # a session you already have
```

Then you get a session URL and a QR code. In server mode, press spacebar to
toggle the QR display. If you do not have the app yet, `/mobile` shows a
download code.

And to keep a session alive on a remote machine after you disconnect from SSH,
start it inside `tmux` or `screen`.

## It is one session with more windows, not a handover

The conversation, and the progress of subagents and dynamic workflows, stay in
sync across all connected devices, so you can send messages from your terminal,
browser and phone interchangeably.

It also survives interruption. If your laptop sleeps or your network drops,
Claude Code reconnects automatically when your machine comes back online. While
the connection is rebuilding it **queues** messages, permission prompts and
status updates, and delivers them once the connection recovers.

A tunnel is an inconvenience, not a lost session. The permission prompt you
missed is waiting for you.

One asymmetry worth carrying: if your machine is awake but cannot reach the
network, **server mode gives up after roughly ten minutes** and the process
exits, while an interactive session keeps retrying for as long as the outage
lasts.

## The decision rule is one question

**Will your computer be off?**

If yes, you need a cloud session, because Remote Control runs as a local
process and the session goes offline the moment that process stops.

If no, and the work needs your local filesystem, your MCP servers or your
project configuration, Remote Control is the only one of the three that has
them.

## Ask for the notification instead of checking

Claude decides when to push, and typically sends one when a long-running task
finishes or when it needs a decision from you to continue.

But you can also just ask:

```
notify me when the tests finish
```

Beyond the on and off toggles there is no per-event configuration, so the
prompt is the control.

Attachments go the other way. A photo from your phone is saved under your
Claude uploads directory and the **path** is handed to Claude; other files are
downloaded and passed as `@` references. A screenshot of a broken screen, taken
on the phone, is simply input.

## What works from a phone, and the rule underneath

| Command | From mobile or web |
|---|---|
| `/plugin`, `/resume` | **local only** |
| `/model`, `/effort`, `/fast`, `/color`, `/rename` | pass the value as an argument |
| `/compact`, `/clear`, `/context`, `/usage`, `/recap` | work as they are |
| `/mcp` | a text summary of server status, not the picker |

So it is `/model sonnet`, not `/model`.

The rule underneath: **anything that needs a terminal interface stays in the
terminal, and everything else grew a text form.** Learn the rule and you can
predict the answer without looking it up.

## The harder limits, dated

All checked September 2026.

- Remote Control and cloud sessions need a **claude.ai account**. If an API key
  or auth token is in use, that credential takes precedence and Remote Control
  refuses, naming what it found.
- A long-lived token from `claude setup-token` can only make model requests, so
  it **cannot establish a Remote Control session at all**.
- Outside server mode, each Claude Code instance supports **one** remote
  session at a time.
- Remote Control is available on all plans, but on **Team and Enterprise it is
  off** until an Owner enables the toggle in Claude Code admin settings.
- A forwarded dialog that is neither a permission prompt nor a question waits
  five minutes by default, then closes with its no-action default. Permission
  prompts and questions stay open until answered.

## Two more doors, and the same question again

**Channels** forward a chat app into a session, Telegram, Discord or iMessage,
or your own server through a webhook, so Claude reacts to external events such
as a CI failure while you are away. The work runs on **your** machine, through
the CLI.

**Slack** is a different animal: mention `@Claude` in a team channel and the
work runs in Anthropic's cloud. That makes it right for pull requests and
reviews from team chat, and wrong for anything that needs your laptop.

Notice what that is really saying. Every one of these is the same question in a
different costume: **which machine does the work, and does it have to be
yours.**

## The one to actually remember

A Remote Control session can reach anything you are signed into **on that
machine**. That is the power of it.

And when it meets a login page, it pauses and asks a human to handle it. On a
train, that human is at home, asleep, under a laptop lid.

This is the same design as the browser integration and it is the correct one:
it never authenticates as you, and it does not start doing so because you
happen to be far away.

The mitigation is one line and it is completely unglamorous. **Sign in before
you leave.** Open the things the task is going to touch while you are still at
the desk.

## Junior and senior

A junior installs the app and thinks the question is answered, then discovers
on a Saturday that the session died when the laptop slept.

A senior decides where execution lives **before** leaving the desk, and that
decision has a checklist attached:

- does this need my filesystem, or will the cloud do?
- will my machine be awake for the whole of it?
- am I signed into everything it is going to touch?
- have I asked for a notification, instead of planning to keep checking?

And the framing worth keeping: this is not Claude Code on your phone. The phone
is just the screen. You are choosing where the work happens.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
