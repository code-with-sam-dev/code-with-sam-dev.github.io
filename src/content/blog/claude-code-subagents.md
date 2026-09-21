---
title: 'Five Agents Finished Slower Than One'
youtube: 'qZ9s5HPZrjs'
cover: '/covers/cc-subagents.jpg'
start: 966
description: 'You split the work across five agents expecting a fifth of the time. It took longer and cost several times as much. That is predictable, and there is a specific documented behaviour that explains a lot of it.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-08-subagents.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 8
duration: '8:50'
draft: false
---

You split the work across five agents, expecting it to finish in a fifth of the
time. It took longer than doing it in one conversation, and it cost several
times as much.

That happens, it is predictable, and there is a specific documented behaviour
that explains a lot of it.

## What a subagent is

A worker with its own context window, its own system prompt, its own tool
access and its own permissions.

The documentation gives the clearest possible rule for when to use one: use it
when a side task would flood your main conversation with search results, logs,
or file contents you will not reference again. The subagent does that work in
its own context and returns only the summary.

So the test is not *is this task big*. It is: **do I want the answer, and not
the mess it took to get there.**

## What it does not inherit

This causes more confusion than anything else here.

A subagent does **not** inherit your conversation history. It also does not
inherit your output style, your main conversation's auto memory, or any skills
you invoked earlier.

What it does get: its own system prompt, the task message, your `CLAUDE.md`
files, a git status snapshot, and any skills it was told to preload.

So when you delegate something and it comes back having missed the obvious
constraint you agreed forty minutes ago: **it never saw that conversation.** It
is not being forgetful. It was never told.

## Which is exactly what a fork is for

A fork is a subagent that inherits the **entire conversation so far** instead
of starting fresh, along with the system prompt, the tools and the model. And
crucially, its own tool calls still stay out of your conversation, so only its
result comes back and your main window stays clean.

The documentation's rule is precise: use a fork when any other subagent would
need too much background to be useful, or when you want to try several
approaches in parallel from the same starting point.

That second use is the good one. Three forks from the same point, three
attempts at a hard problem, and your main conversation stays exactly as it was.

## Defining one is the same shape as a skill

A markdown file with a small settings block, in `.claude/agents` in your
project, or the same path in your home directory for everywhere. Name,
description, the tools it is allowed, and the model it runs on.

That last field is a cost lever people miss: **a subagent can run on a smaller,
cheaper model than your main conversation.** A file lister does not need your
best model.

And a limit worth knowing: those descriptions are loaded at startup and take
context, so keep them short. Claude Code warns you when the combined
descriptions of your own subagents exceed 15,000 tokens.

## Workflows are a different animal

A dynamic workflow is a JavaScript script that orchestrates many subagents,
which Claude writes for the task you describe, and a runtime executes in the
background while your session stays responsive.

Here is the distinction that matters, in one line:

- With **subagents**, *Claude* holds the plan and decides turn by turn what to
  spawn next, and every result lands in a context window.
- With a **workflow**, the *script* holds the plan, and the intermediate
  results live in script variables. Your context holds only the final answer.

That is not a bigger version of delegation. It is moving the orchestration out
of the conversation entirely.

### And that buys quality, not just quantity

Moving the plan into code lets you apply a repeatable **quality** pattern.
Independent agents can adversarially review each other's findings before
anything is reported. A plan can be drafted from several angles and the angles
weighed against each other.

The bundled research workflow does exactly this: it fans out, cross-checks the
sources against each other, and the claims that did not survive are filtered
out of the report.

That is not more output. It is output you have more reason to trust, which is a
completely different value proposition.

## The numbers, because this is where money goes

| Guardrail | Value |
|---|---|
| Concurrent agents | up to 16 at once |
| Total agents in a run | 1,000 |
| Default size guideline | aims for fewer than 15 agents |
| Warning threshold | more than 25 agents scheduled |
| Warning threshold | projected token total past 1.5 million |

That warning is **advisory**. It does not pause anything. So treat it as what
it is: the tool telling you a script has become more ambitious than you
probably intended.

## So why did five agents finish slower?

Three documented reasons.

**The work was not genuinely independent.** If it was not, you have not
parallelised anything. You have added coordination to something that was
already sequential.

**Cache warming latency.** In a fan out, agents that share a prompt cache
prefix are deliberately held for up to five seconds so they can read what the
first one cached rather than each paying to process it. That is a saving, and
it is also latency you did not expect.

**Relaunch reruns everything after the failure.** If an agent fails partway
through a run, relaunching reruns it *and* every agent that started after it,
even the ones that already completed. Start A, B, C, D: if B fails, a relaunch
returns A from cache and runs B, C and D again.

A single failure in the middle of a fan out can rerun most of your run.

## What not to hand to a fleet of agents

- **Anything where the steps depend on each other**, because that is sequential
  work wearing a parallel costume.
- **Anything where you cannot check the output cheaply**, because twenty agents
  producing plausible results you have to verify by hand is not leverage, it is
  homework.
- **Anything where being wrong is expensive and hard to detect**, because more
  agents means more surface, and a wrong answer produced confidently by nine of
  them is not more true than one.

## Junior and senior

A junior reaches for parallelism because it feels fast and because five agents
sounds more impressive than one.

A senior asks whether the work is actually independent, and reaches for a
subagent for the narrow reason in the documentation: *I want the answer and not
the mess.*

And the genuinely senior move is knowing which of the four tools you want:

- a **skill** when the instructions repeat
- a **subagent** when the mess should not come home
- a **fork** when the background is too expensive to re-explain
- a **workflow** when the orchestration itself is the thing worth keeping,
  because a script can be read, reviewed and rerun, and a clever conversation
  cannot

## In one line

A subagent keeps the mess out of your window, a fork brings the background with
it, and a workflow moves the plan out of the conversation and into code you can
rerun. Parallelism is not free, it is not always faster, and a failure in the
middle of a fan out can rerun most of your run.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
