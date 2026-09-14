---
title: 'Same Prompt, Same Project, Worse Answer'
description: 'On Monday it produced exactly the right change. On Friday, something confidently wrong. Nothing about the prompt changed. The answer is not prompt engineering, and it is the thing that separates people who get a lot out of this tool from people who quietly give up.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-01-harness.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 1
duration: '6:49'
draft: true
---

The same prompt, in the same project, by the same developer. On Monday it
produces exactly the right change. On Friday it produces something confidently
wrong.

Nothing about the prompt changed. So what did?

Hold that question. The answer is the thing that separates people who get a lot
out of this tool from people who quietly give up on it, and it is not prompt
engineering.

## It is not a chat window

Most people install Claude Code and treat it like a chat that happens to sit in
a terminal. Ask a question, get some code, paste it in. That model of what is
happening is wrong, and it puts a ceiling on what you get out of it.

The documentation is precise about this. Claude Code is the **agentic harness**
around Claude: it provides the tools, the context management, and the execution
environment that turn a language model into a coding agent.

Read that again. The model reasons. The harness acts. You are not talking to a
model. You are operating a harness.

## The loop, and you are inside it

The harness runs a loop with three phases:

1. **Gather context**
2. **Take action**
3. **Verify results**

Then repeat, until the task is done or you stop it. A question about your
codebase might only need the first phase. A bug fix cycles through all three,
repeatedly.

And here is the part most explanations leave out: **you are inside the loop as
well.** You can interrupt at any point, steer, add a fact, or send it in a
different direction. It works autonomously and stays responsive to you at the
same time.

Every senior habit in this series is really a way of intervening in that loop
at the right moment.

## Tools are what make it an agent

Without tools, a model can only produce text. With tools, it can act: read your
code, edit files, run your test suite, search the web. The built-in tools fall
into five groups, covering file operations, search, execution, web, and code
intelligence.

Watch what that means in practice. You say "fix the failing tests":

- it runs the suite to see what is failing
- it reads the error output
- it searches for the relevant source
- it reads those files
- it makes the edit
- it runs the tests again to check

Six steps, and you asked for one thing. Each result changed what it did next.
That is the loop, and that is why this is not autocomplete.

## Installing it

At the time of writing, September 2026, one line installs it on macOS, Linux or
WSL, with a PowerShell line for Windows, a Homebrew cask, and a WinGet package.

One detail worth knowing before you pick. The native install **updates itself**
in the background. Homebrew and WinGet do not, so on those you are responsible
for upgrading. Homebrew also ships two casks: a stable one that runs about a
week behind, and a latest one that gets releases as they ship.

Then change into a project directory, type `claude`, and log in.

## Four surfaces, one engine

It is not only a terminal tool, and this surprises people. There is a VS Code
extension, a JetBrains plugin, a desktop app, and it runs in a browser at
claude.ai/code.

The sentence that matters: each surface connects to the **same underlying
engine**, so your project's `CLAUDE.md`, your settings, and your MCP servers
work across all of them.

You are not configuring four tools. You are configuring one, and choosing where
to sit.

## Money, with a date on it

This is the most perishable thing on this page, so it comes dated. At the time
of writing, September 2026, Claude Code is included in every paid plan. Pro is
$20 a month, or $17 billed annually. Max starts at $100, and you choose 5x or
20x Pro's usage per session.

The part people miss is not the price. It is that **Claude Code and your normal
chats draw from the same pool.** All activity in both counts against the same
limits. Limits reset on a rolling five hour window, and paid plans add a weekly
limit on top.

Check the current numbers before you rely on any of that, because this page
changes.

## The answer to the question at the top

Same prompt, same project, different day, different quality.

On Monday you had just started. The context window held your request, the files
it read, and almost nothing else.

On Friday you were four hours into a session. The window had filled, and it had
been compacted. **Compaction is not neutral.** It clears older tool outputs
first, then summarises the conversation. Your requests and key snippets survive.
Detailed instructions from early on may not.

So that careful constraint you gave it at ten in the morning, the one about
never touching the migrations folder, was quietly summarised away by two in the
afternoon.

The prompt did not change. The context around it did.

## The first genuinely senior habit

It is one line: **put persistent rules in `CLAUDE.md`, not in the
conversation.**

That is the documentation's own advice, and it is there for exactly the reason
we just watched. A rule in the conversation is a rule that expires. A rule in
`CLAUDE.md` is read at the start of every session, and survives compaction,
because it is not part of the conversation being compacted.

## Junior and senior

A junior sends a prompt and judges the tool by the answer. A senior manages the
conditions the answer is produced under.

Same tool. Same model. Completely different results, and the gap widens with
the size of the codebase.

Everything from here is a specific version of that: what earns a place in
context, when to start a fresh session, how much you let it do without asking,
and which model is actually right for the job in front of you.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
