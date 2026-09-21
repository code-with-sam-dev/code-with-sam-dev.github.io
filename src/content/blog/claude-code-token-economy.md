---
title: 'Clearing Is Free. Compacting Is Not.'
youtube: 'CmmjXyVAA-I'
cover: '/covers/cc-token-economy.jpg'
start: 1100
description: 'You asked a one line question at the end of a long day and it drew down your usage like an hour of work. That is not unfair billing, and the fix is a habit that costs nothing.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-10-token-economy.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 10
duration: '8:57'
draft: false
---

You asked a one line question. A quick one, at the end of a long day. And it
drew down your usage like an hour of real work.

That is not a bug, and it is not unfair billing. There is a documented reason,
and once you know it a set of habits that felt like fussiness make obvious
sense.

## Why a short question is not a short request

Claude Code sends your full conversation with every request. Each time it uses
a tool, that is another request, carrying that batch of tool results along with
everything before it.

Prompt caching means the history is re-read at the cached token rate, which
helps enormously and does not make it free. The documentation puts it plainly:
a one line question in a session that has been open all day still draws usage
for the whole conversation.

So the cost of a question is not the length of the question. It is the length
of everything behind it.

## Run `/usage` before you change any habit

On a Pro, Max, Team or Enterprise plan, `/usage` does better than show you a
number. It **attributes** recent usage to skills, subagents, plugins and
individual MCP servers, each as a percentage of the total.

It flags behaviours such as long context or cache misses when one accounts for
10% or more of recent usage. And it lists your heaviest recent scheduled tasks
and loops, ordered by total tokens, with how often each fires and when it last
ran.

Press `d` or `w` to switch between the last 24 hours and the last 7 days. The
figures come from local session history on that machine, so other devices are
not included.

The reason this is step one rather than step five: the thing consuming your
budget is rarely the thing you assumed, and a habit change aimed at the wrong
thing costs effort and saves nothing.

## The asymmetry almost nobody knows

Compacting is not free. `/compact` **reads** the conversation it is
summarising, so compacting a large context is itself a large request.

And then the sentence worth memorising, quoted from the documentation:

> When you want a fresh start instead of continuity, `/clear` costs nothing.

Clearing is free. Compacting is a large request. Almost everyone has it
backwards, and treats clearing as the drastic option.

So the rule is simple. Moving to unrelated work? Clear. Do not compact out of
politeness. Need the history carried forward? Compact, and steer it:

```
/compact focus on the API changes and the test output
```

You can also put a `# Compact instructions` section in your `CLAUDE.md` so it
knows every time without being told.

### Rename first, and clearing stops being frightening

```
/rename payments-retry-investigation
/clear

# and later, if you were wrong:
/resume payments-retry-investigation
```

Renaming before clearing turns throwing away into filing. That one extra step
is why the senior habit is possible at all.

## The cost you cannot see

Your first message after a break longer than the cache lifetime misses the
cache and reprocesses your full context.

The lifetime is **one hour on a subscription**, and it drops to **five minutes**
once you are drawing on usage credits. On an API key or a cloud provider it is
five minutes by default.

Two documented escapes. You can choose the TTL yourself to keep the one hour
lifetime while on usage credits. And on Pro and Max plans, resuming a large
session after a long break offers to resume from a summary, so later requests
do not carry the full history.

Which gives you an odd but real habit: if you are about to leave a large
session for an hour, that is a good moment to clear it rather than a good
moment to leave it open.

## A session can spend while nobody is touching it

Five documented ways, and each of the first three sends your **full context**
every time.

| What | What it does while you are away |
|---|---|
| A scheduled task | fires on its interval even while the session is idle |
| A cross-session message | delivered as a new turn when this session sits idle |
| A goal check-in | up to three per goal between your prompts |
| An agent teammate | keeps consuming until it exits |
| Compaction | is a large request in its own right |

A forgotten loop in a session with a large context is a meter running in an
empty room. This is exactly what the Loops rows in `/usage` are for.

## The highest ratio technique is a grep

Hooks can preprocess data before Claude ever sees it. The documentation's own
example: instead of Claude reading a 10,000 line log file to find the errors, a
`PreToolUse` hook greps for `ERROR` and returns only the matching lines,
reducing context from tens of thousands of tokens to hundreds.

```bash
# the shipped example rewrites a test command to:
npm test 2>&1 | grep -A 5 -E '(FAIL|ERROR|error:)' | head -100
```

That is not a small saving. It is a different order of magnitude, and it is a
few lines of shell.

The second half of the same idea is skills. `CLAUDE.md` is loaded into context
at session start, so detailed instructions for specific workflows are present
even when today's work is unrelated. Skills load on demand. Move the
specialised material out, and aim to keep `CLAUDE.md` under 200 lines.

## Three more people miss

**Prefer CLI tools where one exists.** MCP tool definitions are deferred by
default, so only names and server instructions enter context until a tool is
used. But `gh`, `aws`, `gcloud` and `sentry-cli` are still more context
efficient, because they add no per-tool listing at all. Run `/context` to see
what is consuming space and `/mcp` to disable servers you are not using.

**Extended thinking bills as output tokens**, and the default budget can run to
tens of thousands per request depending on the model. For simpler work, lower
the effort level with `/effort` or in `/model`.

**Write specific prompts.** "Improve this codebase" triggers broad scanning.
"Add input validation to the login function in auth.ts" lets Claude work with
minimal file reads. It sounds like productivity advice and is actually cost
advice.

## The published figures, with their qualifiers attached

Across **enterprise deployments**, the published average is around $13 per
developer per active day and $150 to $250 per developer per month, with costs
remaining below $30 per active day for 90% of users.

Read the qualifier, because it is the point. That is an average across
enterprise deployments, checked September 2026. It is not a prediction about
you, and per-developer costs vary widely with model selection, codebase size
and how many instances are running.

Two smaller figures worth carrying. Background processes consume a small amount
even when idle, typically under $0.04 per session. And agent teams use
approximately 7x more tokens than standard sessions when teammates run in plan
mode, because each teammate maintains its own context window.

The honest use of all of this is to notice when you are an order of magnitude
away from it, not to aim at it.

## The split is unusually clean

| Junior | Senior |
|---|---|
| Rations prompts | Manages the session |
| Writes shorter questions | Clears between unrelated tasks |
| Hesitates before asking | Renames before clearing |
| Feels vaguely guilty | Puts reference material in skills |
| Saves almost nothing | Sends verbose work to subagents |

The cost was never in the question. An hour of habit change beats a year of
typing less.

## In one line

Your whole conversation is sent with every request, so a question costs what is
behind it. Clear between unrelated tasks, because clearing is free and
compacting is not. Rename before you clear. And run `/usage`, because the thing
eating your budget is almost never the thing you assumed.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
