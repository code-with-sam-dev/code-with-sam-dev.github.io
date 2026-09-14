---
title: 'Something In Your Conversation Is Being Deleted'
description: 'Not by you, and not at random. There is a fixed order, and the thing that goes first is not the thing you would have picked. Here is what is in your context window, what it costs, and the four controls you actually have.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-02-context.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 2
duration: '6:37'
draft: true
---

Something in your conversation is being deleted, right now, while you work.
Not by you. And not at random either: there is a specific order, decided in
advance, and the thing that goes first is not the thing you would have picked.

Most people using this tool every day have never looked at what is in their
context window, and it is the single biggest lever on the quality of what they
get back.

## What is actually in there

More than people assume:

- your conversation history
- the contents of every file it has read
- the output of every command it has run
- your `CLAUDE.md`
- auto memory, the learnings it saves as it works
- any skills that have loaded
- the system instructions underneath all of it

Notice the shape of that list. **Only the first item is what you typed.**
Everything else arrived because of something the agent did on your behalf,
which means your context is mostly a consequence of its actions, not of your
words.

## The order of loss

When the window fills, it is managed automatically, and the order is fixed.

1. Older **tool outputs** are cleared first.
2. If that is not enough, the conversation is **summarised**. Your requests and
   key code snippets are preserved. **Detailed instructions from early in the
   conversation may not be.**

Read that last sentence again, because it is the whole episode. The careful
constraint you gave it in your second message, the one about never touching a
particular folder, is exactly the kind of thing that does not survive. It was
detailed, and it was early. Both count against it.

## Stop guessing: `/context`

There is a command that shows you what is using space. Run it and you will find
out which of those seven things is actually eating your window, and it is
usually not what you expected.

In most sessions it is tool output: one large file read, or a command that
printed more than anyone wanted.

That is a measurement, not an opinion, and it turns context from a vague
anxiety into something you can look at.

## Control one: `CLAUDE.md`

Put persistent rules in `CLAUDE.md`, not in the conversation. A file read at
the start of every session is not part of the conversation being summarised, so
it cannot be summarised away.

There is a second, less known control. You can add a **compact instructions**
section to that file, saying what should survive a compaction. Or you can
compact deliberately with a focus, and tell it what to keep.

Most people wait for it to happen. You can decide when, and what matters.

## Control two: skills, the elegant one

Skills load on demand. At the start of a session Claude sees only the
descriptions; the **body** of a skill loads only when the skill is actually
used.

The documentation puts it plainly: unlike `CLAUDE.md` content, a skill's body
loads only when it is used, so long reference material costs almost nothing
until you need it.

That is the difference between a hundred page style guide occupying your window
all day, and a hundred page style guide that costs nothing until the moment you
are writing that kind of code.

## Control three: subagents

A subagent works in its own context window. It starts fresh, does the work, and
its tool calls stay out of your window entirely. You get back a summary.

Think about what that means for a big search. Ask the main session to read
forty files looking for something and forty file contents land in your window
and stay there. Ask a subagent, and you get the answer while the forty files
never touch your context at all.

That is not a small optimisation. That is the difference between a session that
stays sharp for hours and one that is confused by lunchtime.

## Control four: MCP deferral

When you connect external tools through MCP, each server brings tool
definitions with it. Connect six servers and that could be a great deal of your
window spent before you have asked anything.

At the time of writing, September 2026, those definitions are **deferred by
default** and loaded on demand through tool search, so only the names and the
server instructions cost you anything until a specific tool is actually used.

Worth knowing, because the instinct when a session feels sluggish is to blame
the model, and the cause may be six servers you connected in March.

## Junior and senior, and it is not what people expect

The junior version of this skill is *use fewer tokens*. Write shorter prompts.
Be terse.

That is the wrong optimisation, and it makes your results worse, because the
thing you trimmed was usually the context that would have made the answer
right.

The senior version is: **decide what earns its place.**

- A long, precise rule in `CLAUDE.md` earns its place, because it is read once
  per session and prevents a class of mistake.
- Forty files of search results do not, so they go to a subagent.
- A reference document earns its place only in the ten minutes you need it, so
  it becomes a skill.

Same window. Completely different contents.

## In one line

What you get back is mostly decided by what is in the window when you ask, and
you have four controls over that, not zero. `CLAUDE.md` for what must never be
lost. Skills for what should cost nothing until needed. Subagents for work
whose mess should not come home. And deferral for tools you have connected but
are not using.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
