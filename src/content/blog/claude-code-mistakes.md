---
title: "The Mistakes Claude Code Often Makes, and What Guards Against Them"
duration: '23:53'
cover: '/covers/claude-code-mistakes.jpg'
description: 'Every mistake collected from real engineering work, in eight groups, each with what it looked like, why it got through and what to do. Only one fix is tested; the rest are labelled honestly.'
pubDate: 2026-09-29
sheet: '/downloads/claude-code-mistakes.pdf'
repo: 'https://github.com/code-with-sam-dev/claude-code-guardrails'
tags: ['claude-code', 'ai-agents', 'testing']
draft: true
---

Claude Code can say the task is done, and that the tests pass, when the tests never ran.
This is not a piece about a broken tool. It is every mistake collected from real
engineering work, described without names, and what to do about each.

Every fix is labelled. **Tested** means it was run and watched working. **A practice**
makes the mistake less likely and guarantees nothing. **No fix** means none is known yet.

## The one tested fix

A Stop hook. When Claude tries to finish, it runs the tests; exit code 2 blocks the stop
and the failure goes back to Claude as the reason. On a real run, asked to change a refund
window and not run the tests, it said the edit was in place but untested, tried to stop,
the hook ran the tests, one failed, and it went back and fixed it.

What it cannot do: it stops Claude finishing while tests fail. It cannot tell you the
tests encode the right rule. In that run it fixed the failure by updating the test.

## The eight groups

| | What it looks like |
| --- | --- |
| **Done, without evidence** | Claimed done with no test run; side effects never read back; edits in the wrong order; stale documents; overclaims; long work that stops after one step |
| **Passing its own tests** | A value checked for presence, not correctness; the right field from the wrong source; fake values standing where the gap was; tests that confirm the design; tidy data; nobody walked the screen |
| **Trusting one tool, or one source** | A garbled extract read as a real bug; a warning treated as a failure; "never raised", when it was in the archive |
| **Notes that drift** | "Write it in our own words" saved as "credit the source"; notes treated as the source; a parked question that was never asked |
| **The first plausible explanation** | A scanner blamed when it was right; a correct bug report doubted |
| **Memory, instead of a lookup** | Versions, defaults, dates, quotes and remedies given from recall |
| **Getting stuck quietly** | Seven retries in an hour instead of saying so; a missed demo |
| **Writing for itself** | "The seven accounts are complete": which, and where? |

The sharpest of them, and the easiest to copy: when a value has a tempting source and a
right one, write one test where they **disagree**. The application says one product, the
loan says another, and the loan must win.

Two have no fix I know of yet: long work that stops after a step and waits for you, and
stray slips with no pattern. Check on long work yourself.

The CLAUDE.md, the Stop hook, the recorded run and the full checklist are in the
repository. The free design sheet above has the hook, the rules and the checklist on one
page.

Documentation quoted was read on code.claude.com on 29 September 2026.
