---
title: 'By The Time You Need A Handoff, It Is Too Late To Make One'
youtube: '1unhvZBzWag'
description: 'The model is unavailable. Usually not an outage, usually a usage limit at four in the afternoon. Exactly two things cross a session boundary on their own, and the list is shorter than you think.'
pubDate: 2026-09-20
sheet: '/downloads/claude-code-advanced-05-handoffs.pdf'
tags: ['claude-code', 'ai', 'workflow']
series: 'Claude Code Advanced'
episode: 5
duration: '9:08'
draft: false
---

The model you depend on is unavailable. Not gone forever, just unavailable: an
outage, a provider problem, or the far more likely one, you hit a usage limit
at four in the afternoon.

Does your work stop?

For most people the honest answer is yes, and here is the cruel part. By the
time you *need* a handoff, the thing that would have made it possible is the
exact thing you have just lost.

## Three problems, one word

They feel similar and they are not.

- **Session to session.** Today's conversation is gone and tomorrow's has to
  pick it up. This one is about what you wrote down.
- **Model to model.** A different model, or a different vendor entirely, takes
  over the same job. This one is about whether your instructions are portable.
- **Person to person.** A colleague inherits a branch an agent helped write,
  and has to understand decisions they never saw being made. This one is about
  whether your git history tells a story.

All three fail for the same underlying reason.

## Exactly two things cross a session boundary

Sessions are independent. Each new one starts with a fresh context window and
none of the conversation history from previous sessions.

Two things cross that boundary on their own:

| What | When |
| --- | --- |
| `CLAUDE.md` | Read at the start of every session |
| Auto memory | The first 200 lines or 25 KB, whichever comes first |

That is the whole list.

Every decision you argued through, every constraint you agreed, every dead end
you ruled out: unless it landed in a file, it is gone. A handoff is only ever as
good as what you wrote down **before** you needed one.

## The four primitives, and the one almost nobody knows

`/export` writes the current conversation out as plain text, and takes a
filename. That is your transcript: portable, readable by any tool and any human.

`/memory` edits your `CLAUDE.md` files and shows what auto memory has actually
saved. Worth looking at once, because it is rarely what you assumed.

And the one people miss: **`/clear` takes a name.**

```text
/clear refund-rounding-investigation
```

The conversation you are walking away from is labelled *as you leave it*. That
label is what you see later in `/resume`.

This is the half of session naming almost nobody knows, and it pairs with
`/rename` rather than replacing it. `/rename` names the session you are sitting
in. `/clear <name>` names the one you are walking away from, in the one moment
you still know what it was about. Two commands, two ends of the same session.

## The technique you have already used without calling it a handoff

The documented pattern is: have it interview you, write the spec to a **file**,
then start a **fresh session** to execute it.

Read that again with handoffs in your head. That *is* a handoff. You are passing
work from one session to another, deliberately, and it works because the thing
being handed over is a written artefact rather than a conversation.

A spec travels. A conversation does not.

Which makes the highest value habit here not a command at all: when a decision
gets made, put it somewhere a file can hold it.

## What belongs in CLAUDE.md, by a sharper test

Not "is this useful". The test is:

> If the next session, the next model, or the next person cannot function
> without this, it belongs in a file.

A constraint you would be annoyed to have to re-explain. A decision that took an
argument to reach. The reason a thing is done the strange way it is done.

And the counterweight is real: a bloated file means the important rules get
lost. For each line, ask whether removing it would cause a mistake. Durable, not
merely true.

## The artefact everybody forgets

Your git history. It is not part of the tool at all, which is exactly why it is
the strongest handoff you have: every model, every vendor and every human being
can read it with none of your configuration.

Commit early, and describe what you were **doing** rather than what changed. The
diff already says what changed. A message that says why is a handoff note that
survives the tool disappearing entirely.

This is what pays off in the third kind of handoff. The colleague inheriting the
branch cannot read your conversation and was never in your session. The commit
log is what they have.

## The honest shape of unavailability

People picture an outage. The rare case *is* an outage. The common case is a
usage limit, hit mid task, in the afternoon, by you.

Same problem in ordinary clothes, and the cost is identical: work stops unless
the state is somewhere else.

Two things change your exposure. How your organisation routes requests, because
a gateway or a cloud provider fails differently from a direct plan and several
features are simply unavailable on some of them. And whether the task you are
halfway through could be described to somebody else in a paragraph.

## The thirty second test

On your own project, right now:

```text
If this tool disappeared for a day,
what would I have to reconstruct from memory?

Not what would be inconvenient.
What would I genuinely rebuild out of my own head.
```

The answer is a list. Every item on it belongs in a file before you need it.

## The split, and it is about timing rather than knowledge

A junior handles a handoff when a handoff is needed, which is the one moment it
cannot be done well, because the context has already gone.

A senior sets it up at the start, when it costs almost nothing. Label the
conversation when you clear it. Write the spec to a file. Put the constraint in
`CLAUDE.md`. Commit with a message that says why.

None of that is extra work. It is the same work, written down instead of
remembered.
