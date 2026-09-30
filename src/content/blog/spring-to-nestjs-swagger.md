---
title: 'Spring to NestJS API Docs with Swagger: 3 Fields → {}'
youtube: 'B63jKITBKXQ'
cover: '/covers/sn-swagger.jpg'
description: 'A typed, validated NestJS request class documents nothing in Swagger by default, while Spring documents the same three fields by itself. Measured on both stacks: why, the hand-written fix that drifts, the CLI plugin that derives it, and the file name boundary it has.'
pubDate: 2026-09-30
sheet: '/downloads/spring-to-node-09-swagger.pdf'
repo: 'https://github.com/code-with-sam-dev/spring-to-node'
tags: ['nestjs', 'typescript', 'nodejs', 'java', 'spring-boot']
series: 'Spring Boot to NestJS'
episode: 10
duration: '5:00'
draft: false
---

A NestJS request class with three fields, every one typed and validated. Its Swagger page
shows the request body as `{}`, and the generated schema is
`{"type":"object","properties":{}}`: zero of three. The same three fields as a Spring
record with Bean Validation document themselves: three of three, limits included.
Measured on 30 September 2026, on @nestjs/swagger 12 and Spring Boot 4.1.1 with
springdoc 3.1.1.

## It is not erasure

Runtime reflection still knows the types: `design:type` is Number, String, String for the
three decorated properties. What is missing is Swagger metadata. @nestjs/swagger builds
schemas from its own metadata, and reflection alone cannot tell it which properties a class
has or which are required.

## By hand, and why it drifts

`@ApiProperty` on each field gets three of three. But the limits are now written twice, and
the copies can disagree. With `@Length(3, 3)` and `@ApiProperty({ minLength: 2, maxLength: 2 })`,
the server accepted `"USD"` (201), rejected `"US"` (400), and the document still advertised
two. Nothing failed.

## The plugin, and its boundary

```json
{
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }
}
```

At compile time the plugin reads properties, types and requiredness from the TypeScript
source, and with `classValidatorShim` on it copies the class-validator limits too: three of
three, `minimum 1`, length three, with no `@ApiProperty` anywhere. Turn the shim off and the
fields stay but every limit disappears.

It only reads files ending `.dto.ts` or `.entity.ts` by default. An identical class in
`create-receipt.ts` got nothing, with no warning. Adding `".ts"` as a suffix is refused by
the plugin itself; follow the convention or add a specific suffix.

On the Spring side, two records with the same simple name share one springdoc schema by
default. `springdoc.use-fqn=true` keeps them apart.

The full code for every measurement is in the repository, and the free design sheet above
has the plugin setup, the drift and the checklist on one page.
