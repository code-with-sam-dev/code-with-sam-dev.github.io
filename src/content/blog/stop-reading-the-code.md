---
title: "Stop Reading the Code? Uncle Bob's Rule, Tested on a Real Agent"
youtube: 'd0PoeWQ3g3o'
duration: '8:10'
cover: '/covers/stop-reading-the-code.jpg'
description: 'Robert Martin stopped reading the code his agents write and measures it instead. We built his gates, gave an agent a real refund feature, and attacked the green build to see what got through.'
pubDate: 2026-09-29
sheet: '/downloads/stop-reading-the-code.pdf'
repo: 'https://github.com/code-with-sam-dev/stop-reading-the-code'
video: 'https://youtu.be/d0PoeWQ3g3o'
tags: ['ai-agents', 'code-review', 'testing', 'spring-boot']
draft: false
---

In April, Robert Martin, the author of Clean Code, wrote that he no longer reviews
code written by agents. He measures test coverage, dependency structure, cyclomatic
complexity, module sizes and mutation testing, and leaves the code itself to the AI.

So we built exactly that, and tested it.

## The setup

A small Spring Boot payments service, and a written spec for refunds: cards can be
refunded for 14 days, bank transfers for 30; money moves once per refund even if two
staff approve at the same moment; a customer only sees their own refunds.

Nine gates: the tests, coverage (JaCoCo), mutation testing (PIT), complexity and size
(PMD), architecture rules (ArchUnit), a security scan (Semgrep), a dependency scan
(osv-scanner), and two the agent never saw: acceptance tests written from the spec, and
a database query budget.

## What happened

| | Result |
| --- | --- |
| **The agent** | 7.4 minutes, 614 lines of code and tests. Every visible gate passed first time; 12 of 12 hidden acceptance tests; query budget passed |
| **Calibration** | Coverage, complexity, architecture and dependency gates each caught their planted problem |
| **Mutation testing** | A test with no assertions passed: the build scored 82% against an 80% bar while that class killed 0 of 2 mutants |
| **Security scan** | A real SQL injection was flagged in one method and missed one call away. Semgrep's free edition analyses a single function by design |
| **Reading the code** | The provider is called inside the database transaction. Reproduced: a failed commit after payout leads to a second payout |
| **Attacks on the green build** | Four of five were stopped by independently written checks. A retired legacy path passed all nine gates |

The climax: change the card window from 14 days to 30 and the tests to agree, and the
tests, coverage, mutation testing and every scanner stay green. Only acceptance tests
written separately from the implementation, directly from the spec, caught it.

## Where the knowledge lives

A gate can only catch what its tests, rules, thresholds or analysis know how to
recognise. The question is not whether to verify agent code. Both sides of this debate
verify it. The question is where the knowledge lives: in a spec, a test, an invariant, a
tool's rule set, or in the context somebody brings to the code.

Review the agent's change blind before reading the findings: the repository has the
spec, the gates, the agent's full transcript, its code and every attack, with one script
that reruns the lot. The free design sheet above has the gates and the key code.

Versions at the time of writing (September 2026): Spring Boot 4.1.1, Java 25, JaCoCo
0.8.15, PIT 1.30.0, ArchUnit 1.5.1, Semgrep 1.175.0, osv-scanner 2.5.1.
