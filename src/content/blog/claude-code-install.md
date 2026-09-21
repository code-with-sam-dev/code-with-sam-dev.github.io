---
title: 'The Install Guide Nobody Writes: Claude Code From Nothing'
description: 'The right command, run in the wrong shell, fails with an error that never says which shell it wanted. That plus four other things that cost people an afternoon, and the five commands that are your entire first week.'
pubDate: 2026-09-17
sheet: '/downloads/claude-code-00-install.pdf'
youtube: '-JDj6Lp4Tfo'
cover: '/covers/cc-install.jpg'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 0
duration: '10:02'
draft: false
---

Every install guide covers the same ninety seconds: run this line, you are done.
Then people lose an afternoon to the part nobody writes down.

This is that part. Everything here was checked against the official
documentation in September 2026, and one claim was checked by running the
command rather than by reading about it, which I will point out when we get to
it.

> At the time of this writing, in September 2026, this is how installation
> works. Installation is the fastest moving part of any tool. If something on
> your screen does not match, the official documentation is what to trust.

## The error that does not say what is wrong

The native install is one line, and there are three of them depending on where
you are standing:

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

```batch
:: Windows CMD
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

Run the wrong one for the shell you are actually in, and the error tells you
nothing useful:

| What you see | What it means |
| --- | --- |
| `The token '&&' is not a valid statement separator` | You are in PowerShell. You ran the CMD line |
| `'irm' is not recognized as an internal or external command` | You are in CMD. You ran the PowerShell line |

Neither message says "wrong shell", which is why this costs people twenty
minutes. Your prompt already told you: PowerShell shows `PS C:\>`, CMD shows
`C:\>` with no `PS` in front.

One more for native Windows. Install Git for Windows as well, because that is
what lets the tool use bash for running commands. Without it, it falls back to
PowerShell. On WSL you do not need it.

## Which routes update themselves, and which make it your job

You can install through a package manager instead, and most people do without
thinking about what they are choosing.

| Route | Who upgrades it |
| --- | --- |
| Native install | It does, in the background |
| `brew install --cask claude-code` | You do |
| `winget install Anthropic.ClaudeCode` | You do |
| apt, dnf, apk | You do |

That is the whole trade. If you installed through Homebrew or WinGet and
forgot, you can sit several versions behind for months and never know.

Homebrew has one more wrinkle worth choosing deliberately. There are two casks.
The plain one tracks the stable channel, roughly a week behind, skipping
releases that had a major regression. The one ending `@latest` ships the day a
release does. A team that wants fewer surprises wants the first. Someone who
wants the newest feature the day it lands wants the second.

## Prove it worked before you build anything on it

```bash
claude --version
```

It prints a version number followed by `(Claude Code)`. Those brackets are the
bit to look at. A version with no brackets, or command not found, means the
install did not finish or your path found something else first.

Then run the command almost nobody runs:

```bash
claude doctor
```

**This is the claim I checked by running it rather than by reading about it.**
The documentation promises "install health", which is vague enough to be
useless. What it actually prints includes these two lines:

```text
Config install method: native
Auto-updates: enabled
```

Which answers the question you will genuinely have in three months: which route
did I take, and am I responsible for upgrading this thing.

## The behaviour that confuses anyone who used the API first

Type `claude` on its own and it prompts you the first time, completing in your
browser. Subscription, Console, or a cloud provider, depending on how you or
your company buys it.

Here is the one to know. If `ANTHROPIC_API_KEY` is already set in your shell,
you get no login prompt at all. It asks you to approve that key instead. If you
expected a browser window and got a question about a key, that variable is why.

Credentials are stored afterwards, so it is a one off. Type `/login` inside a
session to switch accounts later.

## Where your first ten minutes actually go

Not prompting. The folder.

When you start a session there is a line above the prompt showing the version,
the model, and the working directory. **Read the working directory line every
single time.** The tool reads your project files as it needs them, and it can
only read the ones where you started it.

Start it in your home folder, ask what this project does, and you get a
confused answer about nothing in particular. The tool looks bad when in fact it
was pointed at nothing.

Two small ones nobody discovers on their own: Tab completes a command you have
started typing, and the up arrow walks back through your history, exactly like
a shell.

## Who decides whether that edit is allowed

Before your first real task, one concept, because you will meet it within
thirty seconds.

On Pro, Max and Team, interactive terminal sessions start in **auto mode**: a
classifier reviews the actions instead of you, so most edits and most commands
happen without stopping to ask. On other plans, sessions start in **manual
mode**, where you approve things yourself. Your own settings, or your
organisation's, can change that.

`Shift+Tab` cycles the permission mode of the session you are in. Learn it now,
because the moment you want it is the moment something is about to touch a file
you care about, and that is a bad moment to go looking for a shortcut.

## Ask before you instruct

Do the first task in this order, because the order is the lesson.

Start with questions:

```text
what does this project do?
where is the main entry point?
what technologies does this project use?
```

You are doing two things at once: getting a genuinely useful answer, and
watching how it explores your codebase, which tells you whether you started it
in the right place.

Then change something small enough that you can tell instantly whether it
worked:

```text
add a hello world function to the main file
```

Then use it for the thing it is quietly excellent at and that people take
months to discover:

```text
what files have I changed?
commit my changes with a descriptive message
create a new branch called feature/quickstart
```

You are talking to it the way you would talk to a colleague looking at the same
screen. That is the whole shift.

## The five commands that are your first week

| Command | What it does |
| --- | --- |
| `claude` | start a session |
| `claude "task"` | start one with that task already typed |
| `claude -p "query"` | run once and exit. The one for scripts |
| `claude -c` | continue the most recent conversation here |
| `claude -r` | resume an earlier one, and pick which |
| `/clear` | wipe the conversation and start fresh |
| `/help` | list everything |
| `/exit` | leave. Ctrl+D twice does the same |

You want `/clear` far more often than people expect. A session carrying an hour
of unrelated history gives worse answers than a clean one, and that is the
subject of the next piece in this series.

## Three things to carry out of this

- **Check the working directory line before you type anything.** Most early
  frustration is a session started in the wrong folder.
- **Know whether your install route updates itself**, because if it does not,
  that is now your job.
- **Learn `Shift+Tab` now**, not at the moment you need it.

The free design sheet above has the wrong-shell table and the command set on one
page, if you want it beside you rather than in a tab.
