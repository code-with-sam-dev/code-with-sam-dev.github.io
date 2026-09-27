---
title: 'Opus 5.5, Tested in Claude Code: 27 Real Runs'
youtube: 'ut6PSjCW6GQ'
duration: '7:17'
cover: '/covers/opus-test.jpg'
description: 'Anthropic says Opus 5.5 is over 30% faster, 40% cheaper and Fable level. Three real coding jobs, hidden tests and every run kept: the raw speed gain was modest, the big difference appeared once the model became an agent.'
pubDate: 2026-09-27
sheet: '/downloads/opus-5-5-tested.pdf'
repo: 'https://github.com/code-with-sam-dev/claude-code-opus-test'
video: 'https://youtu.be/ut6PSjCW6GQ'
tags: ['claude-code', 'opus', 'benchmarks', 'ai-coding']
draft: false
---

Anthropic says Opus 5.5 "generates output more than 30% faster than Opus 5",
costs "40% less than Opus 5 on typical workloads" and "performs at the level of
Claude Fable 5.1 on most work". I built a test anyone can rerun and put three
models through it in Claude Code on 27 September 2026.

## What was measured

Three separate measurements, and the numbers never move between them.

| | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| **Generation**: text tokens per second, median | 159.9 | 136.0 | not run |
| **Generation**: time to first text, median | 3.45 s | 11.12 s | not run |
| **Agentic jobs**: total wall time, 9 runs | 1,341 s | 4,823 s | 2,991 s |
| **Agentic jobs**: API list price equivalent | $4.91 | $16.47 | $20.18 |
| **Quality checks**: runs with every check passed | 9 of 9 | 9 of 9 | 9 of 9 |

Generation came out 18% faster on visible text, 26% counting thinking tokens.
The three coding jobs finished about 3.6 times sooner end to end, at 70% lower
cost, because the sessions were smaller: on the Kafka job, a median of 19 tool
calls against 66.

## What it does not show

It does not show the 30% claim is false, because Anthropic does not publish its
method. It does not verify the 40%, which is a typical mix of work. And it does
not verify Fable level quality: every model passed every check, so the tests
could not tell them apart.

The harness, the tasks, the hidden tests and every raw run are in the
repository, and the free design sheet above has the method and the code.
