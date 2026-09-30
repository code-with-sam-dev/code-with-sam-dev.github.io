---
title: 'Spring to NestJS CORS, Cookies and Sessions: 10,000 Sessions, No Expiry'
youtube: '6qc1iRXhFLc'
cover: '/covers/sn-sessions.jpg'
description: 'A session is the same idea on both stacks: a cookie with an identifier, and state on the server. In NestJS you install that server side yourself, and inherit express-session defaults: a MemoryStore and no expiry. Measured, along with the two browser paths CORS actually takes.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-11-sessions.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 12
duration: '5:04'
draft: false
---

The same NestJS server with express-session, started twice. With `NODE_ENV=development` it
prints nothing. With `NODE_ENV=production` it warns that its MemoryStore is not designed
for production. If a deployment never sets `NODE_ENV=production`, the warning never
appears. Measured on 30 September 2026 on Node 22, Express 5.2.1, express-session 1.19.0,
NestJS 12 and Spring Boot 4.1.1.

## The model transfers

The first request gets a cookie, the second sends it back, and the visit count goes from
one to two. The cookie carries the session identifier; the count lives on the server.
Spring's servlet container provides that server side. In NestJS, `req.session` is
undefined until you register express-session:

```ts
app.use(session({ secret: 'demo-only', resave: false, saveUninitialized: false }));
```

## The defaults do not

Both cookies, as sent: `JSESSIONID` and `connect.sid`, both `Path=/` and `HttpOnly`,
neither `Secure`, `SameSite` nor `Max-Age`. Spring reports a 30 minute inactivity timeout
by default; express-session's cookie has no maxAge at all.

Ten thousand one-time visitors produced ten thousand sessions, still held two seconds
later, each with `maxAge` and `expires` of null. The package itself calls MemoryStore a
leak risk; what this measured is retention with nothing to expire it. Spring's default
store is in memory too; the difference measured is the timeout.

## CORS takes two paths

For a simple cross-origin GET the browser sends the real request: the handler ran once in
every configuration, counted, and CORS only decided whether the page could read the answer.
For a PUT with a JSON body the browser sends an OPTIONS preflight first; with nothing
configured, or with a listed origin, it fails and the real PUT is never sent. CORS is
browser enforcement, not server-side authorization.

With credentials, `origin: true` reflects any origin back, and so does Spring's
`allowedOriginPatterns("*")`. Spring refuses a literal `"*"` with credentials at startup;
no framework can decide which origins you trust. CSRF protection is a separate subject.

The full code for every measurement is in the repository, and the free design sheet above
has the setup and the checklist on one page.
