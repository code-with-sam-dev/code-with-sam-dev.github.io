/**
 * The hero terminal's script.
 *
 * The terminal used to print a fixed block of text. It now types itself, the
 * way the session actually happened: commands appear character by character,
 * output arrives in a block after a beat, and when a session finishes the
 * screen clears and the next one begins.
 *
 * The timing lives here, separate from the DOM, so it can be tested. Animation
 * code that can only be checked by watching it is animation code nobody checks.
 */

export type TerminalSession = {
  /** Shown in the window's title bar. */
  path: string;
  lines: string[];
};

export type Step =
  | {kind: 'type'; line: number; text: string; delayMs: number}
  | {kind: 'print'; line: number; text: string; delayMs: number}
  | {kind: 'hold'; delayMs: number}
  | {kind: 'clear'; delayMs: number};

/** A line the user typed, rather than output the machine produced. */
export const isCommand = (line: string): boolean => line.startsWith('$ ');

export const TIMING = {
  /** Per character, for lines the user types. */
  keyMs: 38,
  /** A beat between finishing a command and its output appearing. */
  thinkMs: 420,
  /** Output lines land as whole lines, because a machine does not type. */
  printMs: 90,
  /** How long a finished session stays on screen before the next one. */
  holdMs: 4200,
  /** The blank moment between sessions. */
  clearMs: 600,
} as const;

/**
 * Turn a session into the steps that play it.
 *
 * Commands are typed a character at a time. Everything else is printed whole:
 * output does not arrive letter by letter, and pretending otherwise looks like
 * a screensaver rather than a terminal.
 */
export const stepsFor = (session: TerminalSession): Step[] => {
  const steps: Step[] = [];

  session.lines.forEach((line, index) => {
    if (isCommand(line)) {
      // The prompt appears at once, then the command is typed after it.
      steps.push({kind: 'type', line: index, text: line, delayMs: TIMING.keyMs});
      steps.push({kind: 'hold', delayMs: TIMING.thinkMs});
      return;
    }
    steps.push({kind: 'print', line: index, text: line, delayMs: TIMING.printMs});
  });

  steps.push({kind: 'hold', delayMs: TIMING.holdMs});
  steps.push({kind: 'clear', delayMs: TIMING.clearMs});
  return steps;
};

/** Roughly how long one session takes, used to check a loop is not too slow. */
export const durationMs = (session: TerminalSession): number =>
  stepsFor(session).reduce((total, step) => {
    if (step.kind === 'type') return total + step.text.length * step.delayMs;
    return total + step.delayMs;
  }, 0);

/** What the terminal shows at a given moment in a session. */
export type Frame = {
  lines: string[];
  /** True while a command is mid-word, so the caret can sit at the end of it. */
  typing: boolean;
};

/**
 * The screen at `elapsedMs` into a session.
 *
 * A pure function of time rather than a chain of timers. That matters for two
 * reasons: it can be tested at any instant without waiting for it, and a tab
 * that was backgrounded resumes at the right place instead of drifting behind.
 */
export const frameAt = (session: TerminalSession, elapsedMs: number): Frame => {
  const lines: string[] = [];
  let at = 0;

  for (const step of stepsFor(session)) {
    if (step.kind === 'type') {
      const span = step.text.length * step.delayMs;
      if (elapsedMs < at + span) {
        const typed = step.text.slice(0, Math.floor((elapsedMs - at) / step.delayMs));
        if (typed.length > 0) lines.push(typed);
        return {lines, typing: true};
      }
      lines.push(step.text);
      at += span;
      continue;
    }

    if (step.kind === 'print') {
      // The line lands at the END of its step, so it is never half written.
      if (elapsedMs < at + step.delayMs) return {lines, typing: false};
      lines.push(step.text);
      at += step.delayMs;
      continue;
    }

    if (step.kind === 'clear') {
      if (elapsedMs < at + step.delayMs) return {lines: [], typing: false};
      at += step.delayMs;
      continue;
    }

    if (elapsedMs < at + step.delayMs) return {lines, typing: false};
    at += step.delayMs;
  }

  return {lines: [], typing: false};
};

/** Which session is playing at `elapsedMs`, and how far into it we are. */
export const cycleAt = (
  sessions: TerminalSession[],
  elapsedMs: number,
): {index: number; elapsed: number} => {
  const total = sessions.reduce((sum, s) => sum + durationMs(s), 0);
  if (total <= 0) return {index: 0, elapsed: 0};

  // Modulo, so the loop runs forever instead of stopping on the last session.
  let t = ((elapsedMs % total) + total) % total;

  for (let index = 0; index < sessions.length; index += 1) {
    const span = durationMs(sessions[index]);
    if (t < span) return {index, elapsed: t};
    t -= span;
  }
  return {index: sessions.length - 1, elapsed: 0};
};
