/**
 * Opus 5.5, tested in Claude Code: the design sheet.
 *
 * EVERY NUMBER comes from github.com/code-with-sam-dev/claude-code-opus-test,
 * results/speed/SUMMARY.md and results/tasks/SUMMARY.md, run on 2026-09-27.
 * The code is copied out of that repository, not retyped.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const SRC = {
  RUN: 'Run in Claude Code on 2026-09-27. Reproduce it with the harness in the repository.',
  LAUNCH: 'Introducing Claude Opus 5.5, Anthropic, 22 September 2026, read 27 September 2026',
  PRICING: 'Anthropic pricing page, read 27 September 2026',
};

const PERISHABLE =
  'Models, prices and defaults change. Everything on this sheet was true on ' +
  '27 September 2026. The method is the durable part: fix the tasks, hide the ' +
  'tests, count tokens by category, and rerun it on the day you decide.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '18% Faster. 3.6× Sooner.',
  subtitle: 'Opus 5.5, tested in Claude Code',
  kicker: 'For Claude Code users',
  strapline: 'The raw speed gain was modest. The big difference appeared once the model became an agent.',
  verifiedOn: '2026-09-27',

  intro: [
    'Three claims from the launch page, tested with a harness anyone can rerun: a generation test with no tools, and three real coding jobs graded by tests the models never saw.',
    'Opus 5.5 against Opus 5 on everything, and against Fable 5.1 on the coding jobs. Claude Code, headless, effort never set.',
    PERISHABLE,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Generation speed on one fixed prompt, ten runs per model',
      'Three backend coding jobs, three runs per model, held-out tests',
      'Tokens by category, priced at published API rates',
    ],
    outTitle: 'Out of scope',
    out: [
      'Anthropic\'s "typical workloads" mix, which was not reproduced',
      'Quality beyond pass or fail: every model passed every check',
    ],
    note: 'Three runs per job show the spread, not statistical significance. Every run is in the repository.',
  },

  scale: {
    title: 'The findings, in one table',
    note: 'Generation, agentic jobs and quality checks are separate measurements.',
    rows: [
      ['GENERATION: text tokens per second', 'Opus 5.5 159.9, Opus 5 136.0: +18%'],
      ['GENERATION: thinking included', '161.4 against 127.8: +26%'],
      ['GENERATION: time to first text', '3.45 s against 11.12 s'],
      ['AGENTIC JOBS: total wall time, 9 runs', 'Opus 5.5 1,341 s, Opus 5 4,823 s, Fable 5.1 2,991 s'],
      ['AGENTIC JOBS: API list price equivalent', '$4.91, $16.47, $20.18: 70% below Opus 5'],
      ['QUALITY CHECKS: every check passed', '9 of 9 for all three models: a ceiling'],
    ],
  },

  sections: [
    {
      id: 'claims',
      title: 'The claims, verbatim',
      body: ['"generates output more than 30% faster than Opus 5". "at default settings it will cost 40% less than Opus 5 on typical workloads". "performs at the level of Claude Fable 5.1 on most work".',
        'Prices per million tokens at the time of recording: Opus 5.5 $4 in, $20 out, $0.20 cache read; Opus 5 $5, $25, $0.50; Fable 5.1 $10, $50, $0.25.'],
      code: [],
      claims: [{text: 'The three claims, as quoted.', source: SRC.LAUNCH}, {text: 'The per-million rates.', source: SRC.PRICING}],
    },
    {
      id: 'cache',
      title: 'Why 40% is not 20%',
      body: ['The list price drops 20%, but an agent sends the conversation back every turn, and most of it is a cache read, which drops 60%. So the saving is never guessed from the price table: every token is counted by category and priced on its own.'],
      code: [
        {caption: 'harness/run_tasks.py: the cost of one run', lines: [
          'def price(model_id: str, uncached: int, w5m: int, w1h: int, read: int, out: int) -> float | None:',
          '    r = rates_for(model_id)',
          '    if r is None:',
          '        return None',
          '    return (uncached * r["in"] + w5m * r["w5m"] + w1h * r["w1h"] + read * r["read"] + out * r["out"]) / 1e6']},
        {caption: 'One real run: Opus 5.5, Kafka job, run 1', lines: [
          'uncached input      26 x $4',
          'cache writes    34,299 x $8',
          'cache reads    276,575 x $0.20',
          'output          18,087 x $20',
          '                         per million = $0.69']},
      ],
      claims: [{text: 'The calculated cost matched Claude Code\'s own total_cost_usd to the cent on all 27 runs.', source: SRC.RUN}],
    },
    {
      id: 'fair',
      title: 'Making the comparison fair',
      body: ['Each job comes from a frozen commit of a public repository, renamed so no model can recall the published code. The same prompt, the same Bash allowlist and the same checks for every model; who goes first rotates; effort is never set. The checks run after the model has finished, on a copy it never saw, and each discriminating check was proven to fail on a deliberately wrong solution first.'],
      code: [
        {caption: 'T2: every statement prepared on a JDBC connection is counted', lines: [
          '    int statements(Runnable r) {',
          '        STATEMENTS.set(0);',
          '        COUNTING.set(true);',
          '        try {',
          '            r.run();',
          '        } finally {',
          '            COUNTING.set(false);',
          '        }',
          '        return STATEMENTS.get();',
          '    }']},
      ],
      claims: [{text: 'A one-query-per-customer count ran 34 statements against a limit of 3; Spring\'s default Kafka error handler made 10 attempts where 4 and 1 were required. Both failed exactly the check meant to catch them.', source: SRC.RUN}],
    },
    {
      id: 'checker',
      title: 'The one correction',
      body: ['One run first graded 7 of 8: the SQL check rejected any use of Sprintf, even where it only numbered a placeholder and the value was still bound. The check was corrected once and every saved solution was re-graded. Only that grade changed.'],
      code: [
        {caption: 'tasks/T1/checks/param_check.py: the corrected rule', lines: [
          'def ok(body: str) -> bool:',
          '    m = re.search(r"func \\(s \\*Store\\) List\\(\\s*\\w+ [\\w.]+,\\s*(\\w+) string", body)',
          '    if not m or "$1" not in body:',
          '        return False',
          '    v = m.group(1)',
          '    code = re.sub(r\'`[^`]*`\', \'``\', body, flags=re.S)',
          '    code = re.sub(r\'"(\\\\.|[^"\\\\])*"\', \'""\', code)',
          '    code = re.sub(r"//[^\\n]*", "", code)',
          '    for call in re.finditer(r"Sprintf\\(", code):',
          '        depth, i = 1, call.end()',
          '        while i < len(code) and depth:',
          '            depth += {"(": 1, ")": -1}.get(code[i], 0); i += 1',
          '        if re.search(rf"\\b{v}\\b", code[call.end():i]):',
          '            return False',
          '    return not re.search(rf"\\+\\s*{v}\\b|\\b{v}\\s*\\+", code)']},
      ],
      claims: [],
    },
    {
      id: 'refuse',
      title: 'What this does not show',
      body: ['It does not show the 30% claim is false: Anthropic does not publish its method. It does not verify the 40%: that is a typical mix, and these are three backend jobs. It does not verify Fable level quality: the tests hit a ceiling. Opus 5.5 is not always 70% cheaper or 3.6 times faster, and none of this says Fable is not worth it.'],
      code: [],
      claims: [],
    },
    {
      id: 'interview',
      title: 'The questions this answers',
      body: ['Why can a model be 18% faster at generating and 3.6 times faster at finishing a job?', 'Why is an agent\'s bill mostly cache reads?', 'What does a test prove when every model passes it?', 'Why time the first word separately from tokens per second?', 'How do you keep a model from fitting its answer to your tests?'],
      code: [],
      claims: [],
    },
  ],

  scaleNote: 'Claude Code 2.1.283, Opus 5.5, Opus 5 and Fable 5.1, on 27 September 2026.',

  checklist: {
    title: 'Before you trust a model comparison',
    items: [
      'The tasks are fixed, and the model cannot have seen the solutions',
      'The tests are hidden from the model and proven to fail on a wrong answer',
      'Generation speed, finished-job time and quality are measured separately',
      'Cost is counted by token category, not guessed from the list price',
      'Every run is kept, and the spread is shown, not only the median',
      'Any correction to a checker is disclosed and applied to every run',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'The test harness and every raw run', url: 'https://github.com/code-with-sam-dev/claude-code-opus-test'},
    {label: 'Anthropic pricing', url: 'https://platform.claude.com/docs/en/about-claude/pricing'},
  ],
  trademarks:
    'Claude, Claude Code, Opus and Fable are trademarks of Anthropic. Go is a ' +
    'trademark of Google LLC. Spring is a trademark of Broadcom. This is an ' +
    'independent, unofficial test produced by Code with Sam, not affiliated with ' +
    'or endorsed by any of them, and no third party artwork is reproduced here.',
  closing: CLOSING,
};
