---
title: 'Claude Stops When The Work Looks Done'
description: 'One sentence in the documentation explains more about the difference between a good day and a bad one than anything else in it. Without a check it can run, "looks done" is the only signal available, and you became the verification loop.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-09-working-day.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 9
duration: '9:33'
draft: true
---

One sentence in the documentation explains more than anything else in it:

> Claude stops when the work looks done.

Without a check it can run, "looks done" is the only signal available. Which
means **you** are the verification loop, and every mistake waits for you to
notice it.

## Give it something that returns pass or fail

Then the loop closes on its own: it does the work, runs the check, reads the
result, and iterates until the check passes.

A check is anything that returns a signal it can read.

- a test suite, a build exit code, a linter
- a script that diffs output against a fixture
- a browser screenshot compared against the design

The documentation's own summary is the best one: it is the difference between a
session you watch and one you walk away from.

## Four levels, trading setup for attention

| Level | What it is | Buys you |
|---|---|---|
| In the prompt | ask it to run the check and iterate | works today, no setup |
| A goal condition | an evaluator re-checks every turn | the whole session |
| A Stop hook | your check **blocks** the turn ending | a deterministic gate |
| A second opinion | a verification subagent | a different grader |

The Stop hook is overridden after eight consecutive blocks, so it cannot loop
forever. And the last one matters because **the agent doing the work is not the
one grading it.**

## Evidence, not assertions

Have it show the test output, the command it ran and what came back, or a
screenshot of the result.

Reviewing evidence is faster than re-running the verification yourself, and it
works for sessions you were not watching.

Put more bluntly: **done is a claim, output is a fact.** If all you get back is
the word "done", you have not saved verification work. You have moved it to
later, when you have forgotten the context.

## Planning has a cost, and the documentation says so

The shape is explore, plan, implement, commit. Explore in plan mode, ask for a
plan, edit the plan yourself if you want, then implement against it.

But plan mode adds overhead. For tasks where the scope is clear and the fix is
small, ask for the work directly.

The test is beautifully concrete: **if you could describe the diff in one
sentence, skip the plan.**

Planning is most useful when you are uncertain about the approach, when the
change touches multiple files, or when you are unfamiliar with the code. It is
a tool, not a ritual.

## Do not write the spec

For larger features, have Claude interview you first:

```
I want to build [X]. Interview me in detail using the
AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns
and tradeoffs. Do not ask obvious questions, dig into the hard
parts I might not have considered.

Keep interviewing until we have covered everything, then write
a complete spec to SPEC.md.
```

Then start a **fresh session** to execute it. The new session has clean context
aimed entirely at implementation, and you have a written spec to reference.

The documentation's note on what makes a spec good is worth memorising: name
the files and interfaces involved, state what is out of scope, and end with an
end-to-end verification step.

## When to reach for a hook

Unlike `CLAUDE.md` instructions, which are advisory, **hooks are deterministic
and guarantee the action happens.**

That is the whole decision. If it should usually happen, write it in the file.
If it must happen every time with zero exceptions, it is a hook. Format after
every edit. Lint before a commit. Block writes to a folder.

And you do not have to hand-write them: ask for a hook that runs your linter
after every file edit.

One caution: hooks run with your credentials and your environment, so treat one
you did not write like any other dependency.

## How to describe a bug

Not "fix the login bug". Instead:

```
users report that login fails after session timeout.
check the auth flow in src/auth/, especially token refresh.
write a failing test that reproduces the issue, then fix it.

address the root cause, do not suppress the error.
```

Three things happened there. You gave the **symptom** rather than your guess at
the cause. You pointed at where to look without insisting. And you asked for a
reproduction before a fix, so the fix arrives with evidence that it worked.

That last instruction is worth stealing verbatim. Without it, a failing type
check has an obvious and terrible solution available.

## The documented failure patterns

| Pattern | What went wrong | Fix |
|---|---|---|
| Kitchen sink session | unrelated tasks in one window | `/clear` between them |
| Correcting over and over | context full of failed attempts | after **two**, clear and rewrite |
| Over-specified `CLAUDE.md` | rules lost in the noise | would removing it cause a mistake? |
| Infinite exploration | hundreds of files read | scope it, or use a subagent |

A clean session with a better prompt almost always beats a long session with
accumulated corrections. And a detail worth keeping: if you emphasise many
lines, none of them stands out.

## The most honest line in the documentation

Before treating a task as done, a subagent can review the diff in a fresh
context, seeing only the change and your criteria rather than the reasoning
that produced it.

And then the caveat, which is unusual for a vendor to print about its own
recommended technique:

> A reviewer prompted to find gaps will usually report some, even when the work
> is sound, because that is what it was asked to do.

Chasing every finding leads to over-engineering: extra abstraction layers,
defensive code, and tests for cases that cannot happen. Tell the reviewer to
flag only gaps that affect correctness or the stated requirements, and treat
the rest as optional.

## What to refuse to hand over

- **the decision about what not to build**
- **anything whose result you cannot check cheaply**
- **understanding your own system**

None of those is about capability. You can delegate writing the code. If you
also delegate knowing how it works, the three in the morning version of you has
to learn it under the worst possible conditions.

## In one line

Claude stops when the work looks done, so give it something that can say
otherwise. Plan when you could not describe the diff in one sentence, and skip
it when you could. After two failed corrections, clear and write a better
prompt.

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
