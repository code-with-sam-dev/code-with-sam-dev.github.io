/**
 * Plays the hero terminal.
 *
 * All the timing lives in lib/terminal.ts and is tested there. This file does
 * nothing but ask what the screen should look like right now and draw it, which
 * is why there is no logic here worth testing and none hidden here either.
 */
import {cycleAt, frameAt, type TerminalSession} from './terminal.ts';

const CARET = '█';

const play = (root: HTMLElement): void => {
  const body = root.querySelector<HTMLElement>('[data-terminal-body]');
  const path = root.querySelector<HTMLElement>('[data-terminal-path]');
  const raw = root.dataset.sessions;
  if (!body || !path || !raw) return;

  let sessions: TerminalSession[];
  try {
    sessions = JSON.parse(raw);
  } catch {
    return; // Leave the server rendered session on screen rather than blanking it.
  }
  if (sessions.length === 0) return;

  // Someone who has asked for less motion gets the panel as a still, not a
  // slower version of the same movement.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Hold the tallest session's height from the start, so the page does not
  // jolt every time a session with more lines takes over.
  const tallest = Math.max(...sessions.map((s) => s.lines.length));
  body.style.minHeight = `${(tallest * 1.6).toFixed(1)}em`;

  let started = performance.now();
  let last = '';

  const draw = (now: number): void => {
    const {index, elapsed} = cycleAt(sessions, now - started);
    const {lines, typing} = frameAt(sessions[index], elapsed);

    const text = typing
      ? [...lines.slice(0, -1), `${lines[lines.length - 1] ?? ''}${CARET}`].join('\n')
      : lines.join('\n');

    // Only touch the DOM when something actually changed. At 60fps most frames
    // show the same characters as the one before.
    if (text !== last) {
      body.textContent = text;
      last = text;
    }
    if (path.textContent !== sessions[index].path) {
      path.textContent = sessions[index].path;
    }
    requestAnimationFrame(draw);
  };

  // A backgrounded tab stops painting. Restart the clock on return rather than
  // fast forwarding through everything that was missed while it was hidden.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) started = performance.now();
  });

  requestAnimationFrame(draw);
};

document.querySelectorAll<HTMLElement>('[data-terminal]').forEach(play);
