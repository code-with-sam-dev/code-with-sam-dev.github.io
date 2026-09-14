---
title: 'The Same Document, At Two Different Prices'
description: 'The same hundred page document costs you nothing in one place and every session in another. Most people put it in the expensive place, because that is the place they know about.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-06-skills.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 6
duration: '7:53'
draft: true
---

Same hundred page document. In one place it costs you nothing. In another it
costs you every single session, all day, whether or not today's work touches
it.

Same file. Same words. Two completely different prices. And most people put it
in the expensive place, because that is the place they know about.

## A skill is smaller than people expect

Create a file called `SKILL.md` with instructions in it, and Claude adds it to
its toolkit. That is the whole thing. It uses the skill when it is relevant, or
you invoke it directly by name with a slash.

A folder, a markdown file, and now you have a command. There is no framework,
no registration step, and nothing to compile. If you have been putting this off
because it sounded like a project: it is a file.

## The folder name becomes the command

A folder called `summarize-changes` holding a `SKILL.md` gives you
`/summarize-changes`.

You are not declaring the command anywhere. You are naming a folder. Renaming
the folder renames the command, and the thing you type is always discoverable
by looking at a directory listing rather than hunting through configuration.

## Four places they can live, and the choice is scope

| Where | Reach |
|---|---|
| your home folder | every project on this machine |
| the project, under `.claude` | anyone who clones the repository |
| a subdirectory | only sessions started at or below that path |
| an enterprise location | everyone in the organisation |

Same file format in all four. Only the reach changes. The project one is what
turns a personal habit into a team standard.

## The answer to the question at the top

**Skills load on demand.** At the start of a session Claude sees only the
**descriptions**. The body of a skill loads only when the skill is actually
used.

The documentation puts it directly: unlike `CLAUDE.md` content, a skill's body
loads only when it is used, so long reference material costs almost nothing
until you need it.

That is the whole trick. Your hundred page style guide in `CLAUDE.md` occupies
your context window all day whether or not you touch that kind of code. The
same guide as a skill costs you a one-line description until the ten minutes
you actually need it.

## Four settings worth knowing

- **`description`**: how Claude decides when a skill is relevant. It is the
  most important line in the file, and the one people write carelessly.
- **disable model invocation**: only you can trigger it, never Claude. Keeps
  even the description out of the way until you ask.
- **user invocable: false**: the opposite. Claude can reach for it and you
  cannot.
- **allowed tools**: pre-approves a specific set for that skill, so a read-only
  skill can be genuinely read-only.

### And one that connects back to context

**`context: fork`** runs the skill in an isolated context.

Think about when that is what you want. A skill that reads twenty files to
answer one question. Without it, twenty file contents land in your window and
stay. With it, the reading happens somewhere else and you get the answer.

So a skill is not only a saved procedure. It is also a way of deciding **whose
context window pays for the work**.

## Custom commands were merged into skills

This quietly changed, and it confuses anyone reading older material.

A file at `.claude/commands/deploy.md`, and a skill at
`.claude/skills/deploy/SKILL.md`, both give you `/deploy`, and both work. Your
existing commands keep working. Nothing breaks.

What skills add on top is a folder for supporting files, the settings block
that controls who can invoke it, and the ability for Claude to load it
automatically when it is relevant.

So if you read a tutorial about custom commands, it is not out of date exactly.
It is describing the smaller half of the same feature.

## The line of syntax that changes what a skill can be

Put `!` and then a shell command in backticks, and Claude Code **runs that
command and substitutes the output** before Claude ever sees the file.

Sit with that for a second. A skill is not a static instruction. It is a
template that gathers its own evidence at the moment you invoke it.

- a review skill that runs your diff and reviews what is actually there
- a deploy checklist that reads the current branch
- a triage skill that pulls the last fifty log lines

The instruction and the evidence arrive together, which is the difference
between asking someone to review your code and handing them the code.

## A worked example, described accurately

There is a widely shared skill called **grill-me**. It interrogates your plan,
question after question, until the decisions are actually settled, before any
code gets written. It is genuinely good and it is worth trying.

It is **not an official feature.** It is a community skill that somebody wrote
and shared, which is exactly why it is the right example: the most talked-about
thing in this ecosystem is a few dozen lines of markdown in a folder.

That is the whole argument of this article in one artefact.

## Junior and senior

A junior pastes the same instructions again, every week, and does not notice
they are doing it, because each individual paste is only twenty seconds.

A senior notices the repetition and spends ninety seconds turning it into a
folder.

And the genuinely senior version goes further: they put it in the **project**
rather than their home directory, so the next person who clones the repository
gets the same standards without a conversation. That is the move that turns a
personal habit into a team's default, and it costs nothing extra.

The documentation's own advice on when to make one is worth memorising: when
you keep pasting the same instructions, or when a section of `CLAUDE.md` has
grown into a procedure rather than a fact.

## In one line

A folder with a markdown file in it, whose name becomes the command, whose body
costs you nothing until it is used, and which can run a command to gather its
own evidence before Claude reads it. Make the thing you paste every week. Put
it in the project, not your home folder.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
