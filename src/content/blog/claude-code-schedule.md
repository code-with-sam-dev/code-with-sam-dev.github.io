---
title: 'You Typed /loop And Walked Away'
description: 'Where is that actually running, and what happens to it when you close the terminal? Three answers, and picking the wrong one is not a small mistake.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-advanced-04-schedule.pdf'
tags: ['claude-code', 'ai', 'workflow']
series: 'Claude Code Advanced'
episode: 4
duration: '9:00'
draft: true
---

You want something checked every five minutes. The deploy, the build, a pull
request. So you type `/loop` and you move on.

Where is that actually running, and what happens to it when you close the
terminal?

Most people find out at eleven at night, when they open the laptop and discover
the thing they thought was watching the deploy stopped watching it six hours
ago.

## The three-way choice, which is the whole subject

| | Cloud routine | Desktop task | `/loop` |
|---|---|---|---|
| Runs on | Anthropic cloud | your machine | your machine |
| Machine on? | **No** | yes | yes |
| Open session? | no | no | **yes** |
| Local files | no, fresh clone | yes | yes |
| Minimum interval | **1 hour** | 1 minute | 1 minute |

The documentation's own rule is the right one: **cloud** for work that should
run reliably without your machine, **Desktop** when it needs local files and
tools, **`/loop`** for quick polling during a session.

Everything below is a consequence of which row you are on.

## Three shapes, one command

```
/loop 5m check the deploy      # fixed schedule
/loop check the deploy         # Claude picks the interval
/loop                          # the built-in maintenance prompt
```

**With an interval**, Claude converts it to a cron expression. It can lead as a
bare token or trail as "every 2 hours". Intervals that do not map to a clean
cron step, like `7m` or `90m`, are rounded and Claude tells you what it picked.

**Without one**, Claude chooses a delay after each iteration, between one minute
and one hour, based on what it just observed: short waits while a build is
finishing, longer ones once the PR goes quiet. **The delay and the reason are
printed each iteration** — that line is the only feedback a self-paced loop
gives you, and it tells you whether the loop understood what it was watching.

You can also loop a skill: `/loop 20m /review-pr 1234`.

## A bare `/loop` is not a no-op

With no prompt at all, Claude works through a fixed list, in order:

1. continue any unfinished work from the conversation
2. tend the current branch's PR: review comments, failed CI runs, merge conflicts
3. run cleanup passes, bug hunts or simplification, when nothing else is pending

And two limits are written into it. It does not start new initiatives outside
that scope. And **irreversible actions such as pushing or deleting only proceed
when they continue something the transcript already authorised.**

That second sentence is the entire reason you can leave it running.

### Replace it with your own

```markdown
# .claude/loop.md
Check the release/next PR. If CI is red, pull the failing job log,
diagnose, and push a minimal fix. If new review comments have
arrived, address each one and resolve the thread. If everything is
green and quiet, say so in one line.
```

`.claude/loop.md` for the project, `~/.claude/loop.md` for the user, project
wins. **Edits take effect on the next iteration**, so you can watch a loop work
and sharpen its instructions without ever stopping it. Keep it under 25,000
bytes or it is truncated.

## What a scheduled fire will not execute

A scheduled fire only runs skills Claude is allowed to invoke **on its own**.
Everything else reaches Claude as **plain text** instead of executing:

- built-in commands such as `/permissions`, `/model` or `/clear`
- skills marked `disable-model-invocation: true`, including the bundled
  `/verify`
- skills withheld by a `skillOverrides` setting or a `Skill` deny rule
- MCP prompts

So a loop that looks like it is running your command every ten minutes, and is
actually sending Claude the words, is a real thing that happens. Now you know
its shape.

## The limits that decide whether this is the right tool

**Session-scoped.** Tasks fire only while Claude Code is running and idle.
Closing the terminal stops them. Backgrounding the session carries `/loop` tasks
over, which is the escape hatch.

**No catch-up.** If a task's time passes while Claude is busy, it fires once
when Claude becomes idle, not once per missed interval.

**Seven-day expiry.** Recurring tasks expire 7 days after creation: one final
fire, then the task deletes itself. That is a feature. It bounds how long a
forgotten loop can run, which is exactly the failure the token economy episode
is about.

**Resume is partial.** `--resume` restores tasks scheduled with `CronCreate`,
but not expired recurring ones, not one-shots whose time has passed, and **not
a self-paced `/loop`** — run it again to restart that one.

And `Esc` stops a self-paced loop while it is waiting.

## Fire times are deliberately not exact

To stop every session hitting the API at the same wall-clock moment, the
scheduler adds a deterministic offset:

- recurring tasks fire **up to 30 minutes after** the scheduled time, or up to
  half the interval for anything more often than hourly
- one-shot tasks on the top or bottom of the hour fire **up to 90 seconds
  early**

The offset comes from the task ID, so the same task always gets the same one.

Which gives you a trick worth keeping: **if exact timing matters, pick a minute
that is not `:00` or `:30`** — `3 9 * * *` rather than `0 9 * * *` — and the
one-shot jitter does not apply at all.

## Routines, and the blast radius that comes with them

At the time of writing, a research preview on Pro, Max, Team and Enterprise.
Three trigger types, combinable on one routine: a **schedule**, an **API call**,
and **GitHub events**.

They run autonomously, which means **no permission prompts during a run**. Read
that with blast radius in mind: autonomy, plus write access, plus nobody
watching.

Two things follow. **Connectors are included by default**, and Claude can use
every tool from an included connector — **writes included** — without asking.
Remove the ones the routine does not need, and treat what remains as the answer
to "what can this reach at three in the morning".

And **a green status means the session started and exited.** It does not mean
the task succeeded.

## The best piece of design in the product

You can fire a routine by sending text to an API endpoint. The obvious
question: what stops somebody using that to send it instructions?

The answer is that the text **arrives wrapped in a block that labels it
untrusted data**, and the routine's own prompt must explicitly opt in before it
will act on any of it.

The reasoning is stated plainly: anyone holding the bearer token can send that
text, so it arrives labelled as data rather than as instructions.

That is prompt injection defence designed into an API rather than bolted on
afterwards, and it is the clearest real-world answer to the MCP warning that
servers fetching external content can expose you to prompt injection risk.

Worth copying in your own systems, whether or not you ever use a routine.

## Junior and senior

A junior types `/loop 5m` and assumes it is running somewhere.

A senior asks the only question that matters first: **does this need to survive
my laptop being shut?** If yes, it is a routine or a Desktop task and `/loop` is
the wrong tool no matter how convenient it is. If no, `/loop` is perfect and the
seven-day expiry is a feature rather than a limitation.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
