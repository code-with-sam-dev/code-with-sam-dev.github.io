---
title: 'WebSockets in NestJS, for Spring Developers: One Slow Client, 48 MB'
cover: '/covers/sn-websockets.jpg'
description: 'A client that stops reading: Spring closed it at 512 KB, NestJS queued about 48 MB for it. Measured on both stacks: Socket.IO against plain WebSocket, fan out across two instances, and the slow-client policy you have to choose.'
pubDate: 2026-10-01
sheet: '/downloads/spring-to-node-29-websockets.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot', 'websockets']
series: 'Spring Boot to NestJS'
episode: 30
duration: '4:08'
youtube: 'C1DFZ4keG9U'
draft: false
---

One client stops reading, and the server sends it fifty thousand messages of 1 KB. Spring closed
that session at its 512 KB send buffer limit. NestJS kept it open, with about 48 MB queued for that
one socket. Measured on 1 October 2026 with every server a real process.

A realtime connection is not just a socket. You still have to choose the protocol, how messages
cross instances, and what happens when a client cannot keep up.

## The protocol

A plain WebSocket client could not connect to Nest's default gateway: it speaks Socket.IO, which can
use WebSocket as a transport but is a different application protocol. With `WsAdapter` from
`@nestjs/platform-ws`, the plain client connected. Spring's STOMP endpoint gave a plain JSON client
no reply at all.

## Two instances

One client on each of two instances. Spring's simple broker and Nest's default adapter both reached
one client of two. A STOMP broker relay to RabbitMQ, and the Socket.IO Redis adapter, reached both.

## The slow client

Check `bufferedAmount` before you send. With the same 512 KB policy, the Nest gateway disconnected the
slow client. Disconnecting keeps every message intact and costs the connection; dropping or merging
keeps the connection and costs messages. Choose one on purpose.

The full code for every measurement is in the repository, and the free design sheet above has the
checklist on one page.
