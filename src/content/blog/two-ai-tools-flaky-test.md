---
title: 'Stop Using One AI for Everything: The Bug You Cannot Reproduce'
description: 'A test that passes forty times locally and fails one run in twelve in CI. The fix is four lines. Getting to those four lines is a role problem, not a capability problem, and the step most people get wrong is the review.'
pubDate: 2026-09-15
youtube: 'UcoEisshMWE'
tags: ['debugging', 'ai', 'testing', 'ci', 'interviews']
series: 'The Lazy Software Engineer'
episode: 1
cover: '/covers/lazy-engineer.jpg'
duration: '10:48'
sheet: '/downloads/two-ai-tools-design-sheet.pdf'
draft: false
---

The test passes on your machine. Every time. You have run it forty times and it
is green forty times. Then you push, and CI fails. Not every run. About one in
twelve.

So you hit retry, it goes green, the pull request merges, and you tell yourself
you will look at it properly later. You are now afraid of your own test suite.

This is that bug, fixed. There is one step in the middle where the obvious move
is the wrong move, and it decides whether you actually fixed the bug or just
moved it.

## The instinct that fails

You paste the failure into one assistant. It gives you a confident theory. You
ask it to check its own theory, and it agrees with itself.

Of course it agrees. You asked the author to be the judge.

State it plainly, because everything else is this sentence applied: **do not
make one agent both the author and the judge.** Give different jobs to tools
with different context and different failure modes.

## It is not about capability

The myth is that one of these has the internet and the other has your terminal.
That is out of date. At the time of writing, in September 2026, Claude Code
ships web search and web fetch as built in tools, and ChatGPT has Codex, which
works in your repository and runs commands. The capabilities overlap, and they
overlap more every month.

So the split that matters is not capability. It is **role**. One proposes. The
other executes and verifies. Then they swap, so the thing that wrote the fix is
never the thing that approves it.

## Step one: ask for the search space, not the answer

You are not asking for the answer. You are asking for the SEARCH SPACE, and
that distinction is most of the skill.

The prompt asks for **ranked hypotheses**, and for each one **the cheapest test
that would disprove it**, and it explicitly says: do not give me the fix.

Ask for the fix and you get one confident answer and you stop thinking. Ask for
five ranked hypotheses with disproof steps and you get a plan you can run.

## Step two: hand over the part you have been avoiding

Somebody has to run that test two hundred times, capture every failure, and
find what the failing runs have in common. That is the job you have been
putting off for three days, and it is the job a tool with a terminal is for.

The prompt fixes the number of runs. It demands the failures be **saved, not
summarised**. And it ends with one question: which hypothesis survived.

You are not asking for an opinion. You are asking for evidence, from the tool
that can actually produce it.

## The culprit

The fix is four lines, and that is the insult in the whole story. Three days of
retrying pipelines for four lines.

The health check was asking: is the process up. What it needed to ask was: is
the schema at the expected version. Same wait, different question.

This was never a hard problem. It was an expensive problem, and the expense was
entirely in the two hundred runs nobody wanted to sit through.

## Step three: send the fix to the other one, cold

You have a fix. Four lines. Two hundred runs, two hundred green.

The obvious move is to ask the tool that did all that work whether the fix is
any good. Do not. It watched itself reason its way here. It is invested. It
will tell you what it already believes, in a very calm voice.

Send the artefact to the other tool, and send it **cold**: the diff, not the
reasoning that produced it.

## The disagreement is the product

They disagree. The reviewer accepts that the race is real and the fix addresses
it, then points out the wait has no upper bound, so a migration that never
completes turns a flaky test into a pipeline that hangs until the job times
out.

That is a good catch, and it is a catch the first tool was never going to make,
because it was busy being pleased the tests went green.

The disagreement is not a failure of the workflow. It is the product.

## The four rules

All four are about protecting the second opinion from being contaminated by the
first.

1. **Different jobs, not different brands.** Somebody proposes, somebody
   verifies.
2. **Never let the reviewer see the reasoning.** Give it the artefact, not the
   argument.
3. **Whenever a claim can be settled by running something, run it.** Measured
   beats argued, always.
4. **You read the diff.** Not because the tools are bad, but because you are
   the only participant who is accountable on Monday.

## When not to bother

When the task is small, because moving artefacts between two windows for a one
line change costs more than it saves.

When you cannot say what verifying would even mean, because then you do not
have a review, you have a second opinion about a vibe.

And above all, when a test could answer the question. If a failing assertion
settles it in nine seconds, do not pay an AI to have an opinion. Where evidence
is cheap, go and get the evidence.
