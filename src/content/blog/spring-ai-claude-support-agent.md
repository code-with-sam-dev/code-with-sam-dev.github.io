---
title: 'Spring AI and Claude: An MCP Support Agent Where Java Decides'
youtube: '7rWOtB4-Kdw'
duration: '8:47'
cover: '/covers/sa-flagship.jpg'
description: 'A Spring AI MCP server gives Claude payment tools. The model can look things up and ask for a refund; it cannot choose the customer, see a card number, approve a refund or move money. Four boundaries, each measured, and 12 tests that need no model.'
pubDate: 2026-09-28
sheet: '/downloads/spring-ai-claude-support-agent.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-ai-support-agent'
video: 'https://youtu.be/7rWOtB4-Kdw'
tags: ['spring-ai', 'spring-boot', 'mcp', 'claude-code']
draft: false
---

A customer writes: charged twice for order 1043, please refund the duplicate.
Claude finds the two payments forty seconds apart, checks the policy, and asks
our payment system for a refund. The refund is there, pending. The table of
money that actually moved is empty.

Claude asked. Java decided. This build shows where that line sits and why it
has to be in the code, not in the prompt.

## The shape

Claude is not inside the Spring app, and there is no API key in it. Claude Code
runs outside, on a subscription, and the Spring Boot service is an MCP server
built by Spring AI 2.0.1 (at the time of recording, September 2026) from a
starter and a handful of `@McpTool` methods.

One property matters more than it looks. Left unset, the WebMVC server served
the older SSE transport and `/mcp` answered 404. Set to `STREAMABLE`, it answered
200. Set it, then check the endpoint.

## Four boundaries

| Boundary | What the code does | What was measured |
| --- | --- | --- |
| **See** | The customer comes from the signed token; no tool takes a customer id; the view has no card number field | Another customer's payment: "No payment on this ticket". Cards come back as `**** 4242` |
| **Do** | `request_refund` creates a pending refund only, capped at what is left to refund; approval is HTTP with a lead's scope; approving is one conditional update | 3 of 3 legitimate runs: pending, nothing paid. Approved twice, and racing: one payout |
| **Say** | `search_policy` over pgvector returns passages with source ids | Without it: 4 supported, 9 declined, 11 unsupported. With it: 17, 0, 7 |
| **Cost** | Claude Code's own token totals | About 3 to 4 cents a run at API list prices; subscription runs, not a bill |

Twelve injection attempts, in the customer's message, in a merchant name a tool
returned, and in a planted policy passage, produced no refund request with this
client and configuration. That is model behaviour, and it is measured.
Pending-only refunds are an application invariant, and they are enforced.

Retrieval gave the model evidence. It also gave it confidence: with the search
tool, it stopped declining questions the policy does not cover and stretched a
nearby rule to fit them instead. In every one of those answers, the right
passage had come back, so a similarity threshold would not fix it.

## What we can prove without a model

Twelve boundary tests speak MCP over HTTP to the real server against a real
Postgres, exactly as Claude does. They cost nothing and give the same answer
every run. Unit test permissions without AI; evaluate decisions with AI.

Not proved here: resistance to prompt injection in general, production identity
(the JWT is a local test credential), exactly once settlement with a real card
network, and that retrieval grounds every answer.

The whole server, the tests, the experiments and every answer with its verdict
are in the repository, with one script that reruns it: `scripts/verify.sh`. The
free design sheet above has the code for each boundary.
