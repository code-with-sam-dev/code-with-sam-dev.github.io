---
title: 'Spring to NestJS File Uploads and Downloads: Nest Took 50 MB'
youtube: 'j09W9OAR9iM'
cover: '/covers/sn-uploads.jpg'
description: 'Spring Boot refuses a 2 MB multipart file by default. NestJS on Express with Multer accepts 50 MB and keeps it in memory, where heapUsed barely notices. Measured on both stacks: the defaults, the counter that sees the upload, the two-decision fix, and what four concurrent downloads cost buffered and streamed.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-10-uploads.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 11
duration: '4:47'
draft: false
---

The same upload endpoint on both stacks, nothing configured on either side. Spring Boot
accepts a half megabyte file and refuses a 2 MB one with a 413. NestJS on its default
Express platform accepts 2 MB with a 201, and 50 MB with a 201 again, and every time the
file is held in memory. Measured on 30 September 2026, on Node 22, NestJS 12, Multer 2.4.0
and Spring Boot 4.1.1.

## The defaults

Spring Boot's multipart defaults are `max-file-size=1MB`, `max-request-size=10MB` and
`file-size-threshold=0B`, so a file over the threshold is written to disk. NestJS's
`FileInterceptor` is Multer, and Multer's `fileSize` limit defaults to Infinity; with no
storage configured it keeps the whole file in a Buffer. On the Fastify platform NestJS
behaves differently: its file size cap defaults to Fastify's 1 MiB body limit.

## Which counter sees the upload

One 50 MB upload into a fresh server: `heapUsed` went from 15.8 to 16.7 MB.
`arrayBuffers`, which includes every Node Buffer, went from 0.1 to 100.1 MB, and `rss` from
99.9 to 197.4 MB. If you watch only `heapUsed`, you miss almost all of it.

Why 100 MB for 50? Multer's memory storage pushes every chunk onto a list and then joins
them with `Buffer.concat`, so for a moment the chunks and the joined copy both exist. The
measurement is consistent with that.

## The fix is two decisions

```ts
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ destination: uploadDir }),
  limits: { fileSize: 1024 * 1024 },
}))
```

`limits.fileSize` is the bound; it is what Spring gave you for free. `diskStorage` decides
where an accepted file goes, and on its own it is not a limit. With both, the half megabyte
upload arrives as a path on disk rather than a buffer, and the 50 MB one gets a 413.

## Four users, one 200 MB report

Four concurrent downloads, buffered with `readFile`: the peak was 800.3 MB, a whole file per
response. Streamed with `createReadStream`: about 33 MB. With a full collection forced
every 20 ms and the client slowed to 40 MB/s, buffered still peaked at 800.1 MB, because
every response still held its file, while streamed fell to 6.2 to 7.7 MB across six runs.
Most of the streamed peak was spent chunks waiting for the collector. One machine, one
local client: these show direction and scale, not constants.

The full code for every measurement is in the repository, and the free design sheet above
has the route, the defaults and the checklist on one page.
