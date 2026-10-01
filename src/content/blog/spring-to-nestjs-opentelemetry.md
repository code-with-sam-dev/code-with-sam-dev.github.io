---
title: 'OpenTelemetry for Spring and NestJS: 100 Payments, 11 Traces'
cover: '/covers/sn-otel.jpg'
description: 'A hundred payments through Spring Boot, each calling a NestJS ledger that traces everything: Jaeger showed eleven ledger traces. Measured on both stacks: sampling defaults, propagation, and the root decision that travels downstream.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-36-opentelemetry.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'opentelemetry']
series: 'Spring Boot to NestJS'
episode: 37
duration: '3:43'
draft: true
---

A hundred payments go through a Spring Boot service, and every one calls a NestJS ledger that traces
every request it receives. Jaeger showed eleven ledger traces. Measured on 1 October 2026 with real
processes and a real Jaeger. A trace is usually a decision made at the root and propagated downstream.

## Sampling

Nothing configured, 100 root requests each: Spring Boot's OpenTelemetry starter produced 9 traces,
because its default sampling probability is 0.1. The Node SDK under Nest sampled all 100.

## Propagation

With Spring sampling everything, a `RestClient` built from the injected `RestClient.Builder` carried
the trace into the Nest ledger: one trace, both services. `RestClient.create()` did not: it sits
outside the instrumented builder path. From Nest, a plain `fetch` carried the trace into Spring.

## The root decides

At Spring's default, the sampling decision travelled downstream in the `traceparent` header and Nest
followed it: 11 ledger traces out of 100. With Spring at 1.0, all 100.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
