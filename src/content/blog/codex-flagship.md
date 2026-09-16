---
title: 'ChatGPT + Codex: Everything a Software Engineer Needs to Know'
description: 'An agent reviewed three pieces of Java. Two reviews were right. One was wrong, and it was the most convincing of the three. The setup, the permissions, and how you judge what comes back.'
pubDate: 2026-09-14
youtube: '7HHGbN1GJn4'
tags: ['ai', 'chatgpt', 'codex', 'interviews']
series: 'AI Engineering Agents'
episode: 1
cover: '/covers/codex-flagship.jpg'
duration: '14:42'
sheet: '/downloads/codex-flagship-design-sheet.pdf'
draft: false
terminal:
  path: 'payments-service / review'
  lines:
    - '@Transactional'
    - 'void place(Order order) {'
    - '    orders.save(order);'
    - '    provider.charge(order.total());'
    - '    orders.markPaid(order);'
    - '}'
    - ''
    - '  REVIEW PASSED  "correctly transactional"'
---

An agent reviewed three pieces of Java for me. Confidently, in seconds. Two of
those reviews were right. One was wrong, and it was the most convincing of the
three.

That is the whole problem with this way of working, and it is why this is not an
article about prompts.

## Three modes, one window

The thing almost everyone gets wrong on day one is that the desktop app holds
three genuinely different tools. Chat is for questions and search. Work is the
agent for longer jobs that end in a deliverable. Codex is for software: local
files, repositories, terminals, developer tools.

You switch between ChatGPT and Codex from the top left menu, and between Chat
and Work from the toggle at the top of the page.

![The mode selector, with ChatGPT described as everyday questions and Codex as a coding focused workspace](/figures/codex-mode-selector.jpg)

If you are asking Chat to refactor your service layer, you are using the wrong
one.

## The dialog most people click through

![The Codex permissions dialog: folder access, terminal and command access, browser use and developer tools, each with deny and allow](/figures/codex-permissions-dialog.jpg)

Read the line underneath those toggles, because it is the best advice in the
product: **only allow what the task needs.**

An agent with terminal access can run anything you can run. An agent with
browser access is signed in as you. There is no undo button on a shell command.

The defaults are better than people assume. At the time of writing, in September
2026, the agent runs with **network access turned off by default**. In workspace
mode it can write your working directory, but `.git`, `.agents` and `.codex`
stay protected, so it cannot rewrite your history by accident. And for a folder
that is not under version control at all, read only is the recommended default,
because no git history means no undo.

## The caveat an advertisement would leave out

Above the sandbox sits the approval policy: ask on request, never, or a granular
policy you set category by category.

Full access removes the sandbox boundary that automatic review depends on. Set
the policy to `never`, or run with `danger-full-access`, and a sensitive action
may never produce an approval request for you to see. Organisations can block
those options outright for exactly that reason.

The safety here is real, and it is real **because of the boundary**. Turn the
boundary off and you have turned the safety off with it.

## AGENTS.md is the highest leverage file in your repository

If you take one practical thing from this, take this one. It loads into context
automatically, every session, with nobody remembering to paste anything.

```markdown
# Payments service

## Commands
./gradlew build            compile and unit test
./gradlew integrationTest  needs docker compose up

## Constraints
Never call a payment provider inside a transaction.
Every consumer must be idempotent on the payment id.

## Done means
Tests pass, the diff touches only the files named above.
```

Every engineer on your team is currently re-explaining the same project context
by hand, several times a day, and the explanations disagree with each other.
Write it down once.

## The review that was wrong

Here is the prompt that produced it:

```text
Review this service for correctness under failure. Be specific.
```

And the answer that came back:

> The method is correctly transactional. Consider raising the transaction
> timeout so the payment call has room to complete.

It sounds authoritative. It is wrong, and it is wrong in the most expensive
direction available. A remote call inside a transaction holds a database
connection open for the length of somebody else's network, and when that call
fails your database rolls back while the customer's card stays charged. Raising
the timeout makes it worse.

The fix is to **shorten** the transaction, not lengthen it. Write the order and
an outbox row, commit, then call the provider outside the transaction using
their own idempotency key so a retry cannot charge twice.

If you watched the Kafka series, that is exactly where Episode 5 landed. Local
transactions cannot roll back a remote effect, and no annotation has ever
changed that.

## What to take from it

Invented APIs. Confident wrong assumptions. Abstractions nobody asked for. Code
that compiles perfectly and breaks a business rule. None of them look like
errors. They look like good work, and that is what makes them expensive.

Judge the diff and the test results, never how convincing the explanation
sounded.

Every product claim here was checked against OpenAI's own documentation on 14
September 2026, and every version claim is dated, because this is product
surface that moves in months.
