import {test} from 'node:test';
import assert from 'node:assert/strict';

import {stepsFor, durationMs, isCommand, frameAt, cycleAt, TIMING} from '../src/lib/terminal.ts';

const session = {
  path: 'digital-wallet / demo',
  lines: [
    '$ docker compose up --build',
    '$ curl -X POST localhost:8080/demo/lost-update',
    '',
    '  transfersAccepted     2',
    '# Two transfers succeeded.',
  ],
};

test('a line starting with a prompt is something the user typed', () => {
  assert.equal(isCommand('$ docker compose up'), true);
  assert.equal(isCommand('  transfersAccepted     2'), false);
  assert.equal(isCommand(''), false);
});

test('commands are typed and output is printed whole', () => {
  const steps = stepsFor(session);
  const typed = steps.filter((s) => s.kind === 'type').map((s) => s.text);
  const printed = steps.filter((s) => s.kind === 'print').map((s) => s.text);

  assert.deepEqual(typed, [
    '$ docker compose up --build',
    '$ curl -X POST localhost:8080/demo/lost-update',
  ]);
  // A machine does not type its output one character at a time.
  assert.ok(printed.includes('  transfersAccepted     2'));
});

test('every line of the session is played, in order, none skipped', () => {
  const steps = stepsFor(session);
  const played = steps
    .filter((s) => s.kind === 'type' || s.kind === 'print')
    .map((s) => s.line);
  assert.deepEqual(played, [0, 1, 2, 3, 4]);
});

test('a command is followed by a beat before its output', () => {
  const steps = stepsFor(session);
  const first = steps.findIndex((s) => s.kind === 'type');
  assert.equal(steps[first + 1].kind, 'hold');
  assert.equal(steps[first + 1].delayMs, TIMING.thinkMs);
});

test('the session holds before it clears, so the last line can be read', () => {
  const steps = stepsFor(session);
  assert.equal(steps.at(-1).kind, 'clear');
  assert.equal(steps.at(-2).kind, 'hold');
  assert.ok(steps.at(-2).delayMs >= 3000, 'the payoff line needs time to be read');
});

test('a session is long enough to follow and short enough to sit through', () => {
  const ms = durationMs(session);
  assert.ok(ms > 4000, `too fast to read at ${ms}ms`);
  assert.ok(ms < 45000, `nobody waits ${Math.round(ms / 1000)}s for a loop`);
});

test('an empty session does not hang the loop', () => {
  const steps = stepsFor({path: 'empty', lines: []});
  assert.equal(steps.at(-1).kind, 'clear');
});

// The screen at a given moment. Making this a pure function of elapsed time is
// what lets the animation be tested at all: the DOM layer only has to render
// whatever frameAt returns, and cannot drift out of step with the timing.

test('nothing is on screen at the very start', () => {
  const {lines} = frameAt(session, 0);
  assert.deepEqual(lines, []);
});

test('a command arrives character by character, never all at once', () => {
  const first = session.lines[0];
  const partial = frameAt(session, TIMING.keyMs * 5).lines[0];

  assert.ok(partial.length > 0, 'something should be typed by now');
  assert.ok(partial.length < first.length, 'it should not be finished yet');
  assert.ok(first.startsWith(partial), 'it types the real command, not noise');
});

test('output is never shown before the command that produced it', () => {
  // Half way through typing the first command, no output can exist.
  const half = frameAt(session, (first_len => first_len / 2)(session.lines[0].length * TIMING.keyMs));
  assert.equal(half.lines.length, 1);
});

test('the whole session is on screen by the time it has played', () => {
  const {lines} = frameAt(session, durationMs(session) - TIMING.clearMs - 1);
  assert.deepEqual(lines, session.lines);
});

test('an output line appears whole, never half written', () => {
  const output = session.lines.find((l) => !isCommand(l) && l.trim() !== '');
  const total = durationMs(session);

  for (let ms = 0; ms < total; ms += 25) {
    const shown = frameAt(session, ms).lines;
    const match = shown.find((l) => output.startsWith(l) && l !== '' && l !== output);
    assert.equal(match, undefined, `output was half written at ${ms}ms: "${match}"`);
  }
});

test('the screen clears at the end so the next session starts blank', () => {
  const {lines} = frameAt(session, durationMs(session) - 1);
  assert.deepEqual(lines, [], 'the last moment of a session is a blank screen');
});

// Cycling. Sam asked for it to keep changing, so one session must hand over to
// the next and the set must loop forever rather than stopping on the last one.

const sessions = [
  session,
  {path: 'kafka-payments / ep-02', lines: ['$ docker compose up', '  three partitions']},
];

test('the first session plays first', () => {
  assert.equal(cycleAt(sessions, 0).index, 0);
});

test('the second session takes over when the first has finished', () => {
  const {index} = cycleAt(sessions, durationMs(session) + 10);
  assert.equal(index, 1);
});

test('the cycle loops back to the start rather than ending', () => {
  const total = sessions.reduce((sum, s) => sum + durationMs(s), 0);
  assert.equal(cycleAt(sessions, total + 10).index, 0);
  // And far into the future, it is still playing.
  assert.equal(cycleAt(sessions, total * 97 + 10).index, 0);
});

test('the elapsed time handed to a session restarts at zero for that session', () => {
  const {elapsed} = cycleAt(sessions, durationMs(session) + 500);
  assert.ok(elapsed < 600, `expected a fresh session clock, got ${elapsed}ms`);
});

test('a single session still cycles, rather than dividing by zero', () => {
  assert.equal(cycleAt([session], durationMs(session) * 3 + 5).index, 0);
});

test('a session is long enough to read but short enough to keep moving', () => {
  for (const s of sessions) {
    const ms = durationMs(s);
    assert.ok(ms > 3000, `${s.path} is over too quickly at ${ms}ms`);
    assert.ok(ms < 30000, `${s.path} outstays its welcome at ${ms}ms`);
  }
});
