---
title: 'You Turned It Up And It Got Worse'
description: 'You had a hard problem, switched to the biggest model and turned reasoning all the way up. It second-guessed itself and talked itself out of the right answer. The documentation warns about this, in one short phrase.'
pubDate: 2026-09-13
sheet: '/downloads/claude-code-05-model-effort.pdf'
tags: ['claude-code', 'ai', 'interviews']
series: 'Claude Code'
episode: 5
duration: '7:04'
draft: true
---

You had a hard problem, so you switched to the biggest model and turned the
reasoning all the way up. And it got worse. Slower, obviously, but also worse:
it second-guessed itself, explored things that did not matter, and talked
itself out of the right answer.

That is not bad luck and it is not you holding it wrong. The documentation
itself warns about it, in one short phrase we will get to.

## There are two dials, not one

**The model**, which is which brain is doing the work. And **the effort
level**, which is how much it thinks before it answers.

Most people know about the first and have never touched the second. Those two
dials interact, so the same model at two different effort levels behaves like
two different tools.

If you have only ever changed the model, you have been operating half the
controls.

## The models

As aliases, at the time of writing, September 2026:

| Alias | For |
|---|---|
| Haiku | simple, fast tasks |
| Sonnet | daily coding |
| Opus | complex reasoning |
| Fable | the hardest and longest running tasks |
| Best | resolves to whatever the strongest available one is |
| **opusplan** | the one almost nobody mentions, below |

Notice what that list is not. It is not a quality ranking where you should
always reach for the top. It is a list of **different shapes of job**.

## Which one are you on right now?

That depends on what you pay for, and it surprises people.

- On **Max, Team Premium, Enterprise and the API**, the default is Opus 5.
- On **Pro and Team Standard**, it is Sonnet 5.

So two developers on the same team, doing the same work, can be having
genuinely different experiences and neither knows why.

If you have ever read someone online saying it is brilliant, or that it is
useless, and your experience did not match, this is one of the reasons. Check
yours before you form an opinion about the tool.

## opusplan, the most senior-looking setting in the list

It is a hybrid: **Opus for planning, Sonnet for execution.**

Think about why that is clever. The expensive, careful reasoning goes where the
leverage is, which is deciding what to do. The fast, cheap model does the part
where the decisions have already been made.

That is exactly how you would staff a team, and it is one setting. If you want
one thing to try from this article, try that one.

## The second dial

Effort controls how much the model thinks before responding. Five levels:

| Level | For |
|---|---|
| low | short, scoped, latency-sensitive work that is not intelligence-sensitive |
| medium | the cost-sensitive trade |
| **high** | the default on almost everything |
| extra high | deeper reasoning at higher token spend |
| max | *"demanding tasks, but prone to overthinking. Test before adopting broadly."* |

That last row is the answer to the question at the top. You did not get
unlucky. You turned a dial past the point where more thinking helps.

## Where the settings live, and which one wins

The precedence matters, because it explains the setting that would not stick.

1. Change model and effort **inside a session**
2. Pass them as **flags at launch**, which applies to that session only
3. Set them in your **settings file** as a saved default, including a different
   effort per model
4. **Environment variables**, which take precedence over all of the settings

So if you have ever set something in a file and watched it be ignored, look for
the variable before you look for a bug.

One small mercy: in the pickers, pressing `s` applies the change to this
session only, instead of saving it as your new default.

## Choosing, without a table

Ask what the task's **shape** is, not how important it is.

- **Is the hard part deciding what to do, or carrying out a decision already
  made?** Planning work wants a stronger model and more effort. Mechanical work
  wants a fast one and less.
- **Is the problem ambiguous, or specified?** Ambiguity is where extra
  investigation pays for itself. A well-specified change is where it is wasted.
- **How long will it run?** For work you would normally break into pieces, the
  documentation's advice for the strongest model is to **size up rather than
  chop it up**: hand it the whole thing and let it hold the thread.

## The stronger the model, the differently you should prompt it

This one people miss entirely. The guidance for the top tier is:

- describe the **outcome**, not the steps
- hand it ambiguous problems, root-cause investigations, outage debugging,
  architecture decisions
- **skip the verification reminders**, because it verifies its own work with
  less prompting

Read that last one again. The habit you built of saying "make sure you run the
tests", which is good practice on a smaller model, is noise on a bigger one.

Your prompting should change when your model does, and almost nobody changes
it.

## Junior and senior

A junior picks the biggest model for anything that feels important, because
bigger sounds safer, and leaves effort alone because they do not know it
exists.

A senior matches the dials to the shape of the work, and changes them during a
session as the shape changes: plan on something strong, execute on something
fast, drop the effort for the mechanical middle, and raise it again when the
problem turns ambiguous.

And the genuinely senior part is knowing that more is not free and not always
better. Max effort is documented as prone to overthinking. Reaching for the top
of both dials on a simple task is not caution. It is paying more for a worse
answer, more slowly.

## In one line

Two dials, not one, and the right setting comes from the shape of the task
rather than its importance. Check which default your plan puts you on. Try
opusplan. And when a hard problem gets worse as you turn everything up,
remember that the documentation warned you: *prone to overthinking.*

*Every claim here was checked against the official Claude Code documentation on
2026-09-13. Claude and Claude Code are products of Anthropic. This is an
independent guide and is not affiliated with or endorsed by Anthropic.*
