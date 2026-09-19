---
title: 'Java to TypeScript: The Setup Nobody Shows You'
cover: '/covers/sn-install.jpg'
description: 'Every TypeScript tutorial starts at minute three, on a machine that already has everything installed. This is the part before that, run on a real machine, for Spring Boot developers who have never touched the Node ecosystem.'
pubDate: 2026-09-19
sheet: '/downloads/spring-to-node-00-install.pdf'
tags: ['typescript', 'nodejs', 'nestjs', 'java', 'spring-boot']
series: 'Spring Boot to TypeScript'
episode: 0
duration: '16:07'
draft: true
---

Every TypeScript tutorial starts at minute three. A framework is already
installed, Node is already on the path, and the author already knows which of
the four things on screen is which.

This is the part before that, and it is written for someone who has shipped
Spring Boot for years and has never run `npm` in anger.

Everything below was run on a real machine on 19 September 2026, and the output
is what actually came back. That matters more than it sounds, because **nine
things contradicted what a guide written from memory would have said.**

## Four separate things, and people conflate them

You already know this shape:

| Java | TypeScript |
|---|---|
| You write Java | You write TypeScript |
| `javac` compiles it | `tsc` compiles it |
| to bytecode | to JavaScript |
| the JVM runs the bytecode | Node runs the JavaScript |
| Spring Boot sits on top | NestJS sits on top |

Say the negative version out loud, because this is the single biggest source of
confusion arriving from Java. Node is not TypeScript. Node is not NestJS.
TypeScript is not Node. NestJS is not Node.

You install them separately, in that order.

## Check the version. Do not copy it.

The current long term support release of Node, on the day this was recorded,
was **24.21.0**, and installing it brought **npm 11.19.0** with it. Most
tutorials still say 18 or 20.

TypeScript is on **7.0.2**. Most material online assumes 5.x.

Install Node through a version manager rather than a system installer, because
eventually one project needs a different version from another. If SDKMAN is
your instinct from Java, that instinct is right, though the tools are not
equivalent.

## The four second demonstration

This is the part worth the whole article.

Write a file with a type in it: a `Payment` with an id, an amount that is a
number, a currency. Compile it. Now open the JavaScript that came out.

The type is gone.

Not renamed. Not compiled into a class. Not stored somewhere else. There is no
`Payment` type in that file, because there is no such thing at runtime. What is
left is the object and the line that prints it.

Then break it on purpose. Put a string where the number belongs:

```
src/index.ts(9,3): error TS2322: Type 'string' is not assignable to type 'number'.
```

Fix it, compile again, and the generated JavaScript is identical to what it was
before. The types did work, and then they vanished.

**Which leads somewhere uncomfortable.** If data arrives from an HTTP request
while your program is running, TypeScript cannot check it, because TypeScript is
not there any more. Your annotations are not a runtime guard. Validation at the
edges is separate code that you have to write, and treating type annotations as
though they were validation is the most expensive mistake in this ecosystem.

## Four things that will make you think you broke something

**`npm init -y` renames your package.** Run it in a directory called
`node-basics` and the package is called `basics`. npm strips the `node-` prefix.

**`tsc --init` does not set an output directory.** The generated config has no
root directory and no output directory at all, so the compiler has no idea where
your source is or where to put the JavaScript until you tell it.

**A fresh NestJS project generates vitest, not jest.** And oxlint, not eslint.
Every tutorial describing `jest.config` for a new Nest project is not wrong, it
is old. If a file an article mentions does not exist, you are not lost.

**Spring Initializr refuses Boot 3.5.6.** It answers plainly: the compatibility
range is 4.0.0 and above. Spring Boot is on 4.x now, and Boot 4 also moved
`@WebMvcTest`, so a test class copied from a Boot 3 project does not compile.

## Ten thousand six hundred and seventy five, against forty six

`node_modules` is generated, enormous, and rebuildable from one command, so it
never goes into version control.

That is the principle. Here is the number, measured on the repository for this
course rather than asserted: without a `.gitignore`, git offered to track
**10,675 files**. With one, **46**.

The lock file is the opposite case. It records the exact versions that were
installed, and it is what makes a clone reproducible on someone else's machine.
Ignore the folder, commit the lock.

## Where you finish

Two applications in one repository, answering the same endpoint:

```
Spring Boot 4.1.1, Java 21   GET /health -> {"status":"UP"}
NestJS on Node 24.21.0       GET /health -> {"status":"UP"}
```

Both hand written rather than pulled from a health library, so the same
conceptual thing can be read in two stacks side by side. A fresh clone runs
`./mvnw test` and `npm ci && npm test` and both pass.

That is the ground floor. Everything after this is a framework standing on it.
