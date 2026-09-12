import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

/**
 * Twice in one session a source file was written, built against locally, and
 * silently left out of the repository: the machine's global gitignore excludes
 * docs/ and scripts/ everywhere, so `git add` did nothing and `git status`
 * read clean. The site built fine here and would have shipped broken.
 *
 * This test is the check that would have caught it immediately.
 */
test('every source file is actually in the repository', () => {
  const ignored = execFileSync(
    'git',
    ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory', 'src', 'test'],
    {encoding: 'utf8'},
  )
    .split('\n')
    .filter(Boolean);

  assert.deepEqual(
    ignored,
    [],
    `these are ignored and would never be pushed:\n  ${ignored.join('\n  ')}\n` +
      'Move them to a path the global gitignore does not exclude. Do not add a ' +
      'negation pattern: the exclusions are deliberate.',
  );
});
