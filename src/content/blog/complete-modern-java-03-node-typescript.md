---
title: 'Install Node.js and TypeScript on a Mac (Complete Beginner)'
description: 'Episode 3 of Complete Modern Java. Node, npm and TypeScript installed with no admin password, the .zshrc a new Mac does not have, TypeScript installed in the project, the grocery receipt rebuilt in TypeScript, and a TypeScript program that is wrong and runs anyway.'
pubDate: 2026-10-26
cover: '/covers/complete-modern-java-03-node-typescript.jpg'
sheet: '/downloads/complete-modern-java-03-node-typescript.pdf'
repo: 'https://github.com/code-with-sam-dev/complete-modern-java'
tags: ['typescript', 'node', 'beginners']
series: 'Complete Modern Java'
episode: 3
duration: '11:30'
draft: false
youtube: 'uZ6gK3Hifls'
---

On this Mac, the terminal answers `node -v` with `command not found`. No Node, so no
TypeScript either. This episode installs both, with no admin password, and builds the
grocery receipt from Episode 2 again, in TypeScript.

## What we install

Four names, one job each. **Node** is the runtime: it runs JavaScript, the way the
JVM runs Java. **npm** comes with Node and downloads packages into your project.
**tsc** is the TypeScript compiler: like `javac` it checks your code, but it writes
JavaScript, and Node runs that. **nvm** installs Node for you, inside your home
folder, which is why no admin password is needed.

## Two checks first

nvm needs Apple's command line developer tools. `xcode-select -p` prints a folder if
you have them. If it prints an error, `xcode-select --install` is Apple's installer,
and it may ask for an administrator password: that step is Apple's, not ours.

nvm adds itself to `~/.zshrc`, the settings file the terminal reads when it opens. A
new Mac does not have one:

```sh
ls ~/.zshrc       # No such file or directory
touch ~/.zshrc
```

Skip that and the installer prints "Profile not found", and a new terminal says
`nvm: command not found`.

## nvm, then Node

Take the commands from Node's own download page (macOS, nvm), not from a video. The
first one downloads nvm's install script and pipes it to `bash`, which runs it: only
do that with a command the tool's official site gives you.

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
# open a new terminal tab
nvm install 24
node -v           # v24.22.1
npm -v            # 11.19.1
which node        # ~/.nvm/versions/node/v24.22.1/bin/node
```

At the time of recording, Node 24 is the long term support version. Your last digits
may differ, and that is fine.

## TypeScript in the project

In IntelliJ: New Project, **Empty Project**, name `grocery-receipt-ts`. Then, in its
terminal:

```sh
npm init -y
npm install --save-dev typescript
npx tsc -v        # Version 7.0.2
```

TypeScript goes into this project's `node_modules`, so each project keeps the version
it was written with. `package.json` records `"typescript": "^7.0.2"`, and
`package-lock.json` records the exact version installed. `npx` runs the project's own
copy, and if a tool is not installed it can download one, so read what you `npx`.

IntelliJ may say "Node.js is required": it was opened before Node was installed. In
Settings, JavaScript Runtime, choose the Node in `~/.nvm`.

## The receipt, in TypeScript

```ts
const bread: number = 2;
const milk: number = 1;
const breadPrice: number = 1.50;
const milkPrice: number = 0.99;

const total: number = bread * breadPrice + milk * milkPrice;

console.log("Sarah's groceries");
console.log("Items: " + (bread + milk));
console.log("Total: $" + total);
```

```sh
npx tsc groceryReceipt.ts   # no output: no errors
node groceryReceipt.js      # Sarah's groceries / Items: 3 / Total: $3.99
node groceryReceipt.ts      # the same receipt
```

Open `groceryReceipt.js` and it is the same program with every type removed.

## Wrong, and it runs anyway

Change `milk` to the text `"2"`. `node groceryReceipt.ts` still runs: `Items: 22`,
because `+` joins text, and `Total: $4.98`, because `*` turns the text back into a
number. Node removes the types and runs what is left; it never checks them. The
compiler does:

```sh
npx tsc --noEmit groceryReceipt.ts
# error TS2322: Type 'string' is not assignable to type 'number'.
```

Node can run many TypeScript files directly, though not every TypeScript feature, and
it never checks your types. Reading errors properly is the next episode.

A challenge: Sarah buys a third loaf. Set `bread` to `3` and predict both lines before
you run it.

Using Windows? It gets its own episode. The full steps are in the repository README,
and the one page sheet is linked at the top of this page.
