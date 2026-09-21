---
title: 'They Agreed. So What?'
youtube: 'y2yb1lO7O44'
cover: '/covers/cc-two-models.jpg'
description: 'You asked Claude, then asked ChatGPT whether it was right, and it said yes. Two models agreed. That is not two checks, and the difference matters more than any workflow tip.'
pubDate: 2026-09-20
sheet: '/downloads/claude-code-advanced-06-two-models.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code Advanced'
episode: 6
duration: '8:39'
draft: false
---

You asked Claude a hard question, got an answer, and did the sensible-looking
thing: pasted it into ChatGPT and asked whether it was right. ChatGPT said yes.
You felt better and you shipped it.

Two models agreed. Does that make it true?

The answer is no, and the reason why is the single most useful idea in running
more than one of these. But first the good news, because two really does work,
and this site is built on it.

## Why two at all

**Independent failure modes.** A model trained differently does not share the
first one's blind spot, so the things it misses are a different set of things.
Obvious, and true.

**No sunk cost.** This is the one that matters. The second model did not spend
forty minutes arguing itself into the current design. It has no attachment to
the approach and no memory of why the awkward compromise seemed reasonable at
the time.

That is a property you cannot buy from the first model at any price, because
you built the sunk cost together. It is also why "start a fresh session" works
within one model: same mechanism, smaller scale.

## Director and executor

| | ChatGPT, the director | Claude Code, the builder |
|---|---|---|
| Decides | the sequence and the risk on each step | how to build it |
| Holds | distance | the filesystem and terminal |
| Can | say what comes next | actually run things |

A concrete shape for it. You are extracting a billing service out of a
monolith. The director never sees the repository: it gets the current call
graph, the invariants that must survive the move, and the deadline, and it
produces a sequence of migrations with the risk on each one named. The executor
gets that sequence, opens the code, runs the tests, and reports what it found
that the plan did not anticipate.

The reason the split works is symmetrical. **The executor has everything except
distance. The director has nothing except distance.**

## Attack the plan, do not review it

```
Here is the PLAN another model produced.

Attack it. Not review it. Attack it.
Where does this fail? What did it assume?
What did it not consider?
```

Give it the **plan**, not the conclusion. A reviewer with nothing invested
finds a different class of problem from the one that wrote it, and finds it
faster, because it is not defending anything.

One caveat from the documentation applies exactly as hard across vendors as
within one: a reviewer prompted to find gaps will usually report some, even
when the work is sound, because that is what it was asked to do. So add: *flag
only what affects correctness.*

## Only artefacts travel

| Cannot travel | Travels |
|---|---|
| A conversation | A prompt |
| A session | A spec written to a file |
| Forty clever messages | A diff |
| Anything in a context window | A failing test, an error message |

That is the entire transfer protocol between any two models from any two
vendors, and it is not going to change.

Which is why prompts deserve to be treated as code. A prompt you can paste into
a different tool is portable. A clever forty-message conversation is not. **If
you want two models working on one job, the job has to exist in files.**

## The trap

**Agreement is not verification.**

Two models agreeing is not two checks. It is two guesses that happen to match,
produced by systems trained on overlapping data, which fail in correlated ways
more often than anyone would like.

Pasting the second model's approval into your pull request as evidence is not
checking. It is **laundering**: you took an unverified claim, ran it past
something that also cannot verify it, and came back with a stronger feeling and
exactly the same amount of evidence.

The confidence went up. The truth did not move.

## Disagreement is the information

When the two disagree, that is genuinely useful, and useful in a specific way:
**it names the exact spot where you now have to consult a primary source.**

- **Not** resolve it by asking a third model.
- **Not** go with whichever sounded more confident.
- Read the documentation, run the thing, or write the test that settles it.

Disagreement points at where the uncertainty actually lives. Agreement tells you
almost nothing, which is uncomfortable, because agreement is the outcome that
feels like success.

What to do instead: write every factual claim down with the page it came from
and the date it was checked. Not the model that said it, the page and the day.
Label anything that cannot be traced to a primary source as a judgement, out
loud, in the same file. Treat both models' output as a draft.

## A second vendor is a second set of terms

The moment you involve a second provider you have two sets of terms, two privacy
policies, two retention rules and two organisations holding whatever you sent.

So: no secrets, no credentials, no keys. No customer data. No proprietary code
your employer would not want in a second provider's logs.

Not paranoia, and not a criticism of either vendor. "Paste it into the other one
and see what it says" is a data transfer, and deserves the same thought as any
other data transfer.

## What it costs

You pay twice in money, which is obvious, and twice in the expensive currency,
which is your own attention: two conversations to hold, two sets of context to
maintain, and a reconciliation step that did not exist before.

Worth it: a design you will live with for a year, a decision expensive to
reverse, a claim you are about to say out loud to an audience.

Theatre: running everything past a second model so you can feel checked, while
adding nothing but latency and a bill.

**The test that separates them is whether you would actually change your mind
based on the answer.**

## Junior and senior

A junior uses the second model as reassurance, and reads agreement as proof.

A senior uses it as an adversary, and reads **disagreement** as the only useful
output.

And the genuinely senior habit sounds like a downgrade: for most tasks, **one
model with good context beats two with poor context.** Every time. Reach for the
second when you want the plan attacked, when the design outlives the week, or
when being wrong is expensive and hard to detect.

*Claude and Claude Code are products of Anthropic. This is an independent guide
and is not affiliated with or endorsed by Anthropic. Most claims on this page
are operational judgement rather than vendor documentation, and the companion
design sheet labels each one.*
