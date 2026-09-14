---
title: 'Resuming Yesterday Made Today Worse'
description: 'It forgot a decision you were sure it knew, and re-litigated something you had settled. The obvious conclusion is that resuming is unreliable. That conclusion is wrong, and the real reason has a name.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-03-sessions.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 3
duration: '7:21'
draft: true
---

This morning you opened yesterday's work with `--continue`, and it went worse
than starting over. It forgot a decision you were sure it knew. It
re-litigated something you had already settled. It suggested an approach you
had explicitly ruled out at four o'clock the previous afternoon.

The obvious conclusion is that resuming is unreliable, so you stop doing it.

That conclusion is wrong, and the real reason is specific, fixable, and has a
name.

## What a session actually is

A session is a saved conversation, and the critical word is one most people
miss: it is tied to a project **directory**. Not to a repository. Not to your
account. To a directory.

It is written to disk as you work, as a plain-text JSONL file under your
`.claude` folder, one line per message, tool use and result.

Which means two useful things. Your history is a file you can read with
ordinary tools. And the reason a session does not appear when you expect it is
almost always that **you are standing somewhere else.**

## Nothing carries over by default

Sessions are independent. Each new one starts with a fresh context window and
none of the conversation history from previous sessions.

Two things cross that boundary deliberately:

- **`CLAUDE.md`**, read at the start of every session.
- **Auto memory**, the learnings it saves as it works. The first 200 lines or
  25 KB load each time, whichever comes first.

Everything else about yesterday is gone unless you go and get it.

## Four doors, and one of them is a reflex

| How | What it does |
|---|---|
| `--continue` | picks up the **most recent** session in the directory you are in |
| `--resume <name>` | reopens a **specific** one |
| `--resume` | opens a picker, current worktree by default, with shortcuts to widen |
| the PR flag | starts from a pull request |

Four doors into the same room, and the one you reach for without thinking is
the least deliberate of them.

## Name your sessions

There is a `/rename` command and it takes the name as an argument. Thirty
seconds of work, and here is what it buys: the picker stops being a list of
timestamps you cannot tell apart.

Six sessions from Tuesday, all in the same repo, all showing the same date and
a first line that is some variant of "look at the failing build".

Naming turns resuming from a guess into a choice. It is the difference between
four doors and four doors with labels on them.

## Resume versus fork, which is what the episode turns on

When you **resume**, the session reopens under the **same identifier** and your
new messages are appended to the existing conversation. One thread, getting
longer.

When you **fork** (the fork flag, or `/branch`), the history is copied into a
**new session identifier**, and the original is left exactly as it was. Two
threads now, sharing a past.

Notice what forking gives you that resuming cannot: a way to try a second
approach without contaminating the first, and a way to keep a known-good
conversation intact while you experiment beside it.

## So what happened this morning

You continued a session that already had four hours of yesterday in it. The
window did not start fresh; it started nearly full, and full of the wrong
things. Resolved debugging output. Three abandoned approaches. A file you read
once at eleven and never needed again.

So the first thing that happened when you added today's request was
**compaction**: older tool outputs cleared first, then a summary, and detailed
early instructions at risk.

The decision it forgot was made early, in detail, and was exactly the shape of
the thing that goes.

Resuming was not unreliable. You resumed the wrong session, which was a long
one whose useful content had already been diluted by the argument you won
yesterday afternoon.

## Worktrees, because a session is tied to a directory

Two sessions in the same directory are two conversations about the same files.
And switching branches under a running session changes the files it sees while
the conversation stays the same.

The clean way to run genuinely parallel work is **git worktrees**: a separate
directory per branch, and therefore a separate session per branch, with no
crossover.

It is the difference between one agent being confused about which branch it is
on and two agents each being certain.

## Sessions can talk to each other

Cross-session messaging lets one session send a message to another. That sounds
like a novelty until you have a long build running in one directory and want it
to tell a second session when it is finished, rather than watching it yourself.

The useful framing is not chat between agents. It is that **a session is a
worker you can address**, so the coordination you were doing in your head, by
alt-tabbing and checking, becomes something the sessions do between themselves.

## Junior and senior

A junior has one long session and continues it, because continuing is one flag
and starting over feels like losing something.

A senior treats a session as having a useful lifespan, and knows the three
signals that it is over:

1. the task has changed
2. the window is full of resolved work
3. you are about to try a second approach to the same problem

The first two mean start fresh. The third means fork.

And the genuinely senior move is the boring one: name them, so that in a week
you can find the conversation where the decision was made instead of guessing
between six identical timestamps.

## In one line

A session is a conversation tied to a directory, it starts empty unless you go
and get the old one, and resuming a stale session is worse than starting a
clean one. Resume to continue a thread. Fork to try a second approach without
losing the first. Name them, and use worktrees when you want real parallelism.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
