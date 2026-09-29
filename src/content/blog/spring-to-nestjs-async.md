---
title: 'Spring to NestJS Async: One Slow Handler, Everyone Waits'
youtube: 'j1oKRZLXN3g'
cover: '/covers/sn-async.jpg'
description: 'One NestJS request ran for a second and a half, and an unrelated ping took 1.4 seconds. In Spring the same ping took 4 ms. What changed, and the one word that fixes it only when what it awaits yields.'
pubDate: 2026-09-29
sheet: '/downloads/spring-to-node-04-async.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 5
duration: '6:18'
draft: false
---

In Spring MVC, Tomcat gives each request a thread from its pool. While the pool has
capacity, a handler that blocks occupies its own thread, and the others carry on.

NestJS is different. In the normal request path, your handlers share one event-loop
thread. The Node.js documentation is precise: a single JavaScript thread is used by
default. Everything below was measured on 29 September 2026, on Node 22, NestJS 12 and
Spring Boot 4.1.1, and one script reproduces all of it.

## The measurement

| | slow handler | an unrelated ping during it |
| --- | --- | --- |
| Spring MVC, blocking handler | 1513 ms | **4 ms** |
| NestJS, synchronous handler | 1500 ms | **1402 ms** |
| NestJS, awaiting a real timer | 1500 ms | **2 ms** |

The Spring handler sleeps and the NestJS one stays busy, so this is not the same
workload. What is compared is what happens to an unrelated request while one handler
cannot make progress.

## The one change

```ts
@Get('slow')
async slow() {
  await new Promise((r) => setTimeout(r, WAIT_MS));
  return { waitedMs: WAIT_MS };
}
```

The handler reaches an await whose promise is still pending and suspends. Control
returns to the event loop, the ping runs, and when the timer fires the handler picks
up where it left off. Awaiting a genuinely asynchronous operation lets a handler stay
pending without occupying the event loop. `await busyLoop()` would still block.

## The benchmark that measured itself

The first version ran the client and the server in one process, and the ping came
back in 4 ms. The client meant to send it at 100 ms and actually sent it at 1513 ms:
its own timer was stuck behind the same busy handler, so it timed an idle server. The
real measurement runs the server in its own process.

## What really blocks

Large JSON parsing and stringifying, complex regular expressions, long loops that
never yield, and synchronous crypto, compression and file system calls. The same
`pbkdf2` derivation held a ping for 1329 ms done synchronously; the asynchronous
version runs on Node's worker pool, and the ping took 1 ms.

NestJS has no Spring-style `@Async` decorator that hands your method to an executor.
For your own CPU-heavy JavaScript, break it into pieces that yield, move it to a
worker thread, or put the job on a queue.

The full code for every measurement is in the repository, and the free design sheet
above has the table, the code and the checklist on one page.
