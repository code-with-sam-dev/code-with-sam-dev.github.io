---
title: 'Server-Sent Events in NestJS, for Spring Developers: 33 Updates Sent Again'
cover: '/covers/sn-sse.jpg'
description: 'A browser on a Spring Boot SSE stream received 33 updates more than once in 70 seconds. Measured on both stacks: how long a stream lives, Last-Event-ID on reconnect, and what a real EventSource does with both.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-30-sse.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'sse']
series: 'Spring Boot to NestJS'
episode: 31
duration: '3:38'
youtube: 'pO49v6J_p8U'
draft: false
---

A browser subscribed to a payment status stream for 70 seconds and received 33 of those updates more
than once, with no error anywhere. That was Spring Boot with an `SseEmitter`, measured on 1 October
2026. A stream needs a lifetime and a resume point: the client remembers where it was, and the
server still has to honor that cursor.

## How long a stream lives

In our Spring Boot and Tomcat setup, an emitter created with no timeout argument ended at about 30
seconds and reported a timeout: Spring Boot leaves the async request timeout unset, so Tomcat's
default of 30 seconds applies. Nest imposed no timeout in our 70 second test.

## The reconnect

After ids 1, 2 and 3, a client reconnected with `Last-Event-ID: 3`, as every browser does. Neither
stack read the header unless asked, so both started again at 1. Reading it, both resumed at 4.

## Together

A real EventSource on Spring for 70 seconds reconnected after each timeout, three connections, and
33 ids arrived more than once. Reading the header, the same three connections delivered none twice.
On Nest, one connection and no repeats. Either way, the resume code is what makes a reconnect safe.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
