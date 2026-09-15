---
title: 'Six Servers. What Did That Actually Cost You?'
youtube: 'E7Wt3i29QtA'
cover: '/covers/cc-mcp.jpg'
start: 589
description: 'Most people assume the answer is context. That used to be the right worry and mostly is not any more. The thing that replaced it is more serious and gets discussed far less.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-07-mcp.pdf'
tags: ['claude-code', 'ai', 'security']
series: 'Claude Code'
episode: 7
duration: '7:52'
draft: true
---

You connected six MCP servers. Your ticket system, your docs, your database, a
couple of others you were curious about.

What did that cost you?

Most people assume the answer is context: six servers worth of tool definitions
eating your window before you have asked anything. That used to be the right
worry. It mostly is not any more, and the thing that replaced it is more
serious and gets discussed far less.

## What MCP is

MCP is the Model Context Protocol, an open source standard for connecting AI
tools to external systems. In the documentation's own framing, MCP servers give
Claude Code access to **your** tools, **your** databases and **your** APIs.

The important word is *your*. This is the feature that moves the tool from
working on your code to working in your actual environment: reading the ticket,
checking the dashboard, querying the staging database.

Everything up to now has been about the codebase. This is the part that reaches
outside it.

## Adding one, and the four transports

- **HTTP**, the recommended one for anything remote
- **SSE**, which is deprecated. If a tutorial hands you that, prefer the HTTP
  form
- **local**, which runs a process on your machine
- a **websocket** variant

One detail trips people on the local form: the `--` separates Claude's own
options from the command that actually runs the server. Everything before it
configures Claude Code. Everything after it is the program.

Get that boundary wrong and the error message will not obviously tell you which
half was misread.

## Scope matters more than it looks

| Scope | Reach |
|---|---|
| **local** (default) | just you, in this project |
| **user** | you, across all your projects |
| **project** | writes `.mcp.json` at the repo root, so it goes into version control |

That third one is the same move as putting a skill in the project instead of
your home folder. It is how a setup stops being yours and starts being the
team's.

## The context cost, which shrank

It used to be real: connect many servers and their tool definitions sat in your
context window from the moment the session began.

That has changed. At the time of writing, September 2026, Claude Code keeps a
**discovery cache**, so instead of connecting to every server at startup it
uses the tool lists it learned in previous sessions, and a server actually
connects the first time one of its tools is needed.

You can see it in the status: cached two hours ago, connects on first use, five
tools.

So the honest answer is: less than you think, and less than it used to be.
Which is good, and it is not the answer that matters.

## The cost that matters, in one sentence

> Verify you trust each server before connecting it. Servers that fetch
> external content can expose you to prompt injection risk.

Read that twice, because two separate things are being said.

**First**: an MCP server is code, usually somebody else's, running with your
access. That is the ordinary supply chain question and you already know how to
think about it.

**Second, and this is the one people miss**: a server that fetches external
content hands that content to your agent. A web page. A ticket description. A
pull request comment. If that text contains instructions, your agent is now
reading instructions written by whoever wrote the ticket.

The server does not have to be malicious for that to be true. It only has to be
useful.

## Why there is an approval step

Project-scoped servers, the ones that arrive in a repository you cloned,
require approval before they will be used. And the documentation puts the
reason beautifully: **a cloned repository cannot approve its own servers.**

Think about what that prevents. Without it, cloning a repo would be enough to
give an agent on your machine a set of tools chosen by whoever wrote that repo.

The trust decision is deliberately yours, at the moment you first run it, and
not something a file can grant itself.

## Authentication, where people get stuck

Most hosted servers use OAuth: add the server, run `/mcp`, and it walks you
through a browser login. There is also a command-line login.

A server that needs it will say so in its status rather than silently failing,
and Claude Code marks one as needing authentication when it gets a 401 or 403
back.

For internal systems that do not use OAuth, there is a **headers helper**: you
point at a script, it prints a JSON object of headers, and Claude Code runs it
fresh on every connection. That is the detail that makes short-lived tokens and
internal SSO workable, and almost nobody knows it is there.

## Which servers earn their place

Three questions:

1. **Does it remove a context switch I make several times a day?** A server
   that saves me opening a browser tab to read a ticket earns its place. One
   that wraps something I touch monthly does not.
2. **Does it return content that somebody else wrote?** If yes, that is not a
   reason to refuse it. It is a reason to know it, and to be more careful about
   what that session is permitted to do.
3. **Could I do the same thing with a command I already have?** A great many
   MCP servers are a wrapper around a CLI tool you have installed, and a skill
   calling that tool directly is simpler, faster, and has a smaller trust
   surface.

## Junior and senior

A junior collects servers, because each one is a single command and it feels
like capability.

A senior connects the two or three that remove a daily context switch, and
treats every one of them as a dependency: whose is it, what does it return, and
what would it mean if the content it returns were hostile.

And the genuinely senior habit is the pairing with permissions. The question is
not only *do I trust this server*. It is **what is this session permitted to do
while a server is feeding it text that somebody else wrote.** Those are
different questions, and the second one is the one with teeth.

## In one line

MCP is how the tool reaches outside your codebase, the context cost is smaller
than it used to be, and the cost that actually matters is trust. Connect few.
Prefer project scope when the team needs the same setup. And remember the
sentence: servers that fetch external content can expose you to prompt
injection risk.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
