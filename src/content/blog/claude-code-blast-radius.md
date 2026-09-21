---
title: 'You Can Undo What Changed A File'
youtube: 'TNcmA2hy7LQ'
cover: '/covers/cc-blast-radius.jpg'
start: 170
description: 'You have an undo, you have pressed it, and it worked. That experience quietly taught you something dangerous. There is a specific, knowable list of things no undo reaches, and by the time you notice, they have already happened.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-04-blast-radius.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 4
duration: '8:15'
draft: false
---

You have an undo. You have pressed it, it worked, and that experience has
quietly taught you something dangerous: that mistakes here are cheap.

Most of them are. But there is a category of thing this tool can do that no
undo reaches, and by the time you notice, it has already happened.

Not a hypothetical. A specific, knowable list.

## Checkpoints, which are genuinely good

Before it edits a file, it snapshots what was there. If something goes wrong,
press Escape twice and rewind to a previous state, or just ask it to undo.

That is not a git operation and it does not need you to have committed
anything, which matters because the moment you most want an undo is the moment
you were halfway through something and had not committed for an hour.

It is the safety net that makes it reasonable to let an agent edit files at
all.

### Two properties, and one limit narrower than people assume

**Checkpoints are separate from git.** Your branches, your stash and your
commits are untouched by a rewind, and a rewind is not a commit. Two
independent histories, and you can use both.

**They survive resuming**, so yesterday's snapshots are still there this
morning.

And the limit: checkpoints only track changes made through **Claude's own file
editing tools**. Changes made through Bash commands, or by any other process,
are not captured. So if it fixes something with `sed` in a shell command rather
than by editing the file directly, that change is not in the snapshot.

The documentation is blunt about what follows: this is not a replacement for
git. There is also one smaller gap, that a restore skips symlinked and
hard-linked files.

## What no checkpoint reaches

Checkpoints cover **file changes**. That is the whole scope. Which means all of
this is outside it:

- a request sent to an API
- a row written to a production database
- a deployment triggered
- a message posted
- an email sent
- a package published
- a cloud resource created, and billed for

Read that list again, because the thing they have in common is not that they
are dangerous. It is that they are **outside your filesystem**, and a snapshot
of your files cannot reach any of them.

The documentation is explicit: actions that affect remote systems cannot be
checkpointed. You control those with your permission mode and your permission
rules instead.

So: the mistakes you can undo are the ones that changed a file. The ones that
have already happened are the ones that left the machine.

## The four permission modes

Cycle them with Shift+Tab.

| Mode | What it does |
|---|---|
| **Auto** | a classifier reviews most actions in the background and blocks the risky ones instead of asking you |
| **Manual** | asks before file edits and shell commands |
| **Accept edits** | edits files and runs common filesystem commands without asking, still asks for anything else |
| **Plan** | explores and proposes, does not edit your source files at all |

Four positions on one dial, and most people never touch it.

### The one to know about yourself

At the time of writing, September 2026, **Auto is the built-in starting mode**
on Pro, Max and Team plans for interactive terminal and VS Code sessions.

That is a reasonable default, and it is worth understanding what it means: a
classifier is reviewing actions in the background and blocking the risky ones,
rather than stopping to ask you about each one.

You are not being asked, and that is by design. The fewer prompts you see are
not evidence that nothing consequential is happening.

### The one most underused

In plan mode it explores and proposes without editing your source files. Think
about when that is exactly what you want: a codebase you do not know yet, a
change whose shape you have not decided, an investigation where you want the
analysis before any commitment.

The instinct is to treat plan mode as training wheels, something you graduate
from. It is closer to the opposite. It is the mode for work where **thinking is
the deliverable**, and a senior reaches for it deliberately at the start of
anything unfamiliar.

## Allowlist the boring ones

The dial is blunt on its own. You can allow specific commands in settings, so
it never asks about the ones you trust. Running your test suite. Checking git
status.

Those are the things you would approve every time without reading, which is
exactly the problem: **a prompt you always approve is a prompt you have stopped
reading, and a prompt you have stopped reading provides no safety at all.**

Allowlisting the boring ones is not laziness. It keeps the remaining prompts
rare enough that you still look at them.

## Scope, which matters the moment this is more than you

Settings are scoped, from organisation-wide policy down to personal preference.
So a team can say, at the top level, that certain things are never permitted
here, and that is not a convention in a README that everyone agrees to and then
forgets. It is enforced configuration.

If you are introducing this to a team, that scope is the conversation to have
first, before anybody has opinions about prompts.

## Junior and senior

A junior thinks about permissions as an interruption to get past, and reaches
for the most permissive mode that stops the asking.

A senior thinks about **blast radius**, and asks one question before starting:
*what can this task touch that I cannot undo?*

If the answer is nothing outside the filesystem, be permissive: the checkpoint
has you covered and the prompts are pure friction. If the answer includes a
deployment, a production database or an external API, the mode matters more
than the speed, and plan mode first is not timidity. It is the cheapest way to
find out what the change involves before anything can happen.

## In one line

You can undo what changed a file, and you cannot undo what left the machine. So
the question before any task is not whether you trust the agent. It is what
this particular task can reach.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
