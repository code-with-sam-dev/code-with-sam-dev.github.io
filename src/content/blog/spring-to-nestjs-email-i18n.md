---
title: 'Email and Translations in NestJS, for Spring Developers: The German Receipt'
cover: '/covers/sn-email-i18n.jpg'
description: 'A French customer got a German receipt from Spring Boot. Measured against the new first-party @nestjs/i18n and nodemailer: locale fallback, missing keys, a mail server that never answers, and a send that ended a process.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-38-email-i18n.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'i18n']
series: 'Spring Boot to NestJS'
episode: 39
duration: '4:01'
youtube: 'wY1a2mXQa2M'
draft: false
---

A customer in Paris pays, and the receipt comes back in German: no French translation, and a server
running with a German locale. That was Spring Boot with its defaults, measured on 1 October 2026. Email
and translations both have fallback policies you can miss in development.

## Which language wins

Spring's `MessageSource` falls back to the server's own locale by default, so a French request got
German. With `spring.messages.fallback-to-system-locale=false`, English. The new first-party
`@nestjs/i18n` (0.0.1, published 29 September 2026) fell back to its default locale, English. A key in
no catalog: Spring answered 500; Nest answered 200 with the raw key `payment.refund`.

## A mail server that never answers

With the SMTP timeouts at their defaults, Spring's mail sender was still blocked after 60 seconds;
Spring Boot's own docs warn some of those defaults are infinite. With 5 second timeouts it failed after
5. Nodemailer gave up after 30, its default greeting timeout.

## Send and forget

Both answered "payment accepted" before the mail outcome was known. Spring's `@Async` send failed off
the request; our Nest handler did not await the send, and the unobserved rejection ended the process
with code 1. A 200 means the request stopped waiting, not that the email was sent.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
