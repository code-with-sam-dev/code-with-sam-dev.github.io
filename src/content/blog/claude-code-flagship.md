---
title: 'Claude Code: Everything a Software Engineer Needs to Know'
description: 'Forty files edited, then escape twice and all of it gone. The undo that makes agents reasonable, the gap in it that is narrower than you think, and the failure that costs the most and gets talked about least.'
pubDate: 2026-09-14
youtube: 'E7Wt3i29QtA'
tags: ['ai', 'claude-code', 'interviews']
series: 'AI Engineering Agents'
episode: 2
cover: '/covers/claude-code-flagship.jpg'
duration: '23:53'
draft: false
terminal:
  path: '~/projects/payments-service'
  lines:
    - 'Rewind to a previous state'
    - ''
    - '  > add the outbox relay         2:41pm'
    - '    fix the failing mapper test  3:02pm'
    - '    rename OrderService          3:18pm'
    - ''
    - '  1. Restore code and conversation'
    - '  2. Restore conversation'
---

I let an agent edit forty files in one session. Then I pressed escape twice, and
all of it was gone. Not reverted with git. **Rewound**, to a state I never
committed.

That safety net is the single reason it is reasonable to let something else edit
your code at all. It also has a gap in it, and the gap is narrower than most
people assume.

## It is a harness, not a chatbot

If you think of it as a chat window that knows code, you paste code in and paste
answers back out, and you get a slightly faster autocomplete. If you think of it
as a harness, you give it access, a task, and a way to check its own work, and
it closes the loop without you.

Code generation is old and was never the bottleneck. **The loop is the new
thing**: run, read the failure, change approach, run again.

## The safety net, and where it leaks

Before each prompt that starts a turn, it captures the state of your code. Run
`/rewind`, or press escape twice on an empty input, and you can restore the
code, the conversation, or both. No commit required, and it is saved with the
conversation, so you can resume tomorrow and still rewind yesterday.

Now the gap. Checkpointing **only tracks changes made through its own file
editing tools**:

| Change made by | Tracked | Recover with |
| --- | --- | --- |
| its own file edit tools | yes | `/rewind` |
| a bash command | **no** | git |
| a background subagent | usually not | git |
| symlinked or hard linked paths | skipped on restore | by hand |

Snapshots are also swept after about thirty days. This is session level
recovery. The documentation is blunt about what follows and so am I: it is not a
replacement for version control.

## How sessions actually communicate

This is the part nobody explains well, and it is the reason a large codebase
does not drown your context.

![A parent session at twelve percent context dispatching three subagents, each with its own isolated context, returning only summaries](/figures/claude-sessions-communicate.jpg)

The expensive part of searching a big codebase is not the searching. It is the
thousands of lines of file content that land in your context afterwards and stay
there. So do not do it in your own window:

```text
use a subagent to find where payment retries are handled
```

The subagent gets its own isolated context window, reads the forty files there,
and returns a conclusion. What comes back is the answer, not the pile of
evidence.

## Working as a team

Three files decide whether this scales past one person:

| File | Committed? | What the team gets |
| --- | --- | --- |
| `CLAUDE.md` | yes | the same project context on first run |
| `.claude/settings.json` | yes | agreed safe commands, already approved |
| `.claude/skills/` | yes | your review checklist, with the clone |
| `.claude/settings.local.json` | **no** | personal. put it in `.gitignore` |

You are sharing the standards, not the conversation.

## Skills are just a file

Create a `SKILL.md` with instructions in it and it is added to the toolkit. No
framework, no registration, nothing to compile.

```markdown
---
name: grill-me
description: A relentless interview to sharpen a plan or design.
---

Attack the plan. Find the assumption it rests on.
```

Invoke it by name, and it does this:

```text
> /grill-me

What happens to the outbox relay if the DB is up but slow?
You said "idempotent". On which key, exactly?
Name the failure this design does NOT handle.
```

The useful ones are boring and specific: your code review checklist, your
release steps, how this team writes tests.

## The failure that costs the most

You give it a standing instruction. Work through this list. Do not stop. If
something is blocked, skip it and carry on.

It does three items. The fourth needs a human for one click. And it stops. Not
that item, **the whole run**. Then it writes a summary and apologises, while
seven items that needed nothing from you sit untouched.

What is happening underneath: it collapses one blocked item into a blocked run,
and treats writing a report as a finishing move. **The apology is the tell**,
because an apology fills the space where the next action should be.

Three things help. Put the skip rule in `CLAUDE.md`, not just in the message, so
it survives every session. Ask for the next action rather than a status update.
And check real output, not what it tells you it did.

The general lesson is worth more than the workaround: an agent that stops safely
is not the same as an agent that does the work, and autonomy is a property you
have to test for rather than assume.

## What this leaves out

Hooks, output styles and the status line, agent teams, plugins and the plugin
marketplace, routines and channels, and the enterprise controls. Each earns its
own piece rather than ninety seconds here.

Every product claim was checked against Anthropic's own documentation on 14
September 2026. Two claims from an earlier draft did not survive that check and
were corrected before recording, which is the argument of the whole piece in
miniature.
