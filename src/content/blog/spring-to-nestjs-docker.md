---
title: 'Docker for Spring and NestJS: 385 MB to Change One Line'
cover: '/covers/sn-docker.jpg'
description: 'Our own NestJS Dockerfile handed the builder 385 MB of context and put macOS packages in a Linux build. Measured on both stacks: .dockerignore, multi-stage builds, what one changed line rebuilds, and the root user both images started with.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-34-docker.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'docker']
series: 'Spring Boot to NestJS'
episode: 35
duration: '4:28'
draft: true
---

Change one line in a NestJS service and build the image. Our own course Dockerfile handed the builder
385 MB of context to do it, and five packages compiled for macOS landed inside the Linux build.
Measured on 1 October 2026 with real builds. An image is a build artifact with defaults of its own.

## What enters the build

The Nest folder had no `.dockerignore`. With one listing `node_modules`, 40 MB were still there,
because that line only matches the top level and a probe folder had its own. With `**/node_modules`,
2 MB. Spring's context was 1 MB, because Maven downloads inside the image.

## What reaches production, and what rebuilds

One stage on the full image: Nest 1642 MB with TypeScript and Vitest inside, Spring 707 MB.
Multi-stage: 379 MB and 283 MB. One changed line: copying everything before `npm ci` reinstalled the
dependencies, 73 s; the package files first, 13 s. A Spring fat jar replaced a 58.5 MB layer;
extracted into Spring Boot's layers, the changed layer was 30.2 kB.

## Who runs it

Both course images ran as uid 0. `USER node` on Nest, and a created user on Spring: uid 1000 and 100,
and both still answered `/health` with 200. The fixed Dockerfiles are in the repository.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
