/**
 * The TDD for Java design sheet.
 *
 * THE PAGE THAT EARNS THE SHEET is the evidence table, because it prints both
 * halves. Every other TDD one-pager in existence quotes "40 to 90 percent
 * fewer defects" and stops. The same paper reports the teams taking 15 to 35
 * percent longer, and a sheet that omits that has chosen a side.
 *
 * THE SECOND THING TO PROTECT IN ANY EDIT is the folklore section. Naming what
 * this sheet refuses to defend, before it defends anything, is what buys the
 * right to be believed later.
 */
import {CHANNEL_LINKS, repoLink, ORACLE_TRADEMARK, CLOSING, SRC} from './java-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'TDD For Java',
  subtitle: 'The step everyone skips',
  kicker: 'For software engineers: the cycle, on real money',
  strapline: 'A test that has never failed has never proved anything. It has only agreed with you.',
  verifiedOn: '2026-09-15',

  intro: [
    'You already write tests. You write them after the code, they pass on the first run, and that feels like the system working.',
    'This sheet is the cycle on a refund rule rather than a calculator, the evidence with both halves attached, and the objection a sceptic raises at minute three answered honestly, including the part where they are right.',
    'Every figure here was read at the primary source in September 2026 and is quoted with its limitations.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'The red step that proves something, and the one that proves nothing',
      'Writing the refusals rather than the happy path',
      'Invariants that depend on history rather than on the request',
      'What the evidence says, including the cost',
      'The honest difference between test-first and test-after',
    ],
    outTitle: 'Out of scope',
    out: [
      'Allegiance to TDD doctrine. Four rules are given up on page one',
      'Mocking frameworks, which are a different argument',
      'Coverage targets. Coverage says what ran, not what was checked',
      'Any claim that an agent writing your tests is the same as a specification',
    ],
    note: 'If you read one section, read the one on what a regression run actually tells you. That is where the method stops being a ritual.',
  },

  scale: {
    title: 'What the evidence says, both halves, checked September 2026',
    note: 'The four industrial teams are observational case studies, not a controlled experiment, and the cost sits in the same paper as the benefit.',
    rows: [
      ['Meta-analysis, 27 studies, external quality', 'small positive effect'],
      ['Meta-analysis, 27 studies, productivity', 'little to no discernible effect'],
      ['Industrial subgroup', 'larger quality gain AND larger productivity drop'],
      ['4 teams, 3 Microsoft + 1 IBM, defect density', '40% to 90% lower'],
      ['The same four teams, time to complete', '15% to 35% longer'],
      ['What that licenses', 'real, modest, and it costs you time'],
      ['What it does NOT license', '"TDD reduces defects by X percent"'],
    ],
  },

  sections: [
    {
      id: 'folklore',
      title: 'Four things this sheet will not defend',
      body: [
        '"EVERY PRODUCTION LINE NEEDS A FAILING TEST FIRST." Too rigid. Infrastructure wiring, spikes, generated code and trivial mappings are poor candidates and everybody knows it.',
        '"THE CYCLES MUST ALWAYS BE TINY." Small feedback loops are useful. Writing the smallest imaginable assertion is not virtuous by itself.',
        '"ONE HUNDRED PERCENT COVERAGE." Coverage tells you what executed, not whether meaningful behaviour was verified. Mutation testing exists partly because covered code can still be badly tested.',
        '"ONE ASSERTION PER TEST." One BEHAVIOUR per test is the better heuristic, and one behaviour can legitimately need several assertions.',
      ],
      claims: [
        {
          text: 'Pretending the method has no cost is how it lost the room. Naming the cost first is what earns the rest of the page.',
          source: 'Editorial judgement, stated as such',
        },
      ],
    },
    {
      id: 'the-spec',
      title: 'Write the refusals. More of them than feels reasonable',
      body: [
        'Seven tests against a refund rule. ONE says what must be allowed. SIX say what must be refused.',
        'That ratio is the most transferable thing here. The happy path is already in your head and you do not need a test to remember it. The refusals are the cases that become incidents, and they are the ones that will not occur to you once you are looking at working code.',
        'AND THREE OF THEM DO NOT LOOK AT THE REQUEST AT ALL. A refund is refused if it exceeds what is LEFT rather than what was captured. A FAILED attempt consumes none of the balance, so a later refund still goes through. The same idempotency key refunds once. Those describe what the balance MEANS given a history. That is the domain, not validation.',
      ],
      claims: [
        {
          text: 'A suite that only proves the happy path is a suite that agrees with whoever wrote the code.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'the-red',
      title: 'Red, for the right reason',
      body: [
        'Run the suite BEFORE the implementation exists, against a skeleton that throws "not implemented yet". Seven run, four fail, three error.',
        'Now look at WHY they failed. Not "class not found". Not "did not compile". Every test compiled, ran, reached the method under test, and failed on the thing you put there deliberately.',
        'THAT IS WHAT THE RED STEP IS FOR. It proves each test runs, reaches the code, and is checking something. A red step that only proves you have not written the class yet has proved nothing about your test, and skipping this is what turns the cycle into a ritual.',
      ],
      claims: [
        {
          text: 'Seven tests, four failures and three errors, every one of them failing on a deliberate UnsupportedOperationException rather than on a missing class.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'the-regression',
      title: 'The run that makes the case',
      body: [
        'One plausible simplification, exactly the kind that passes review. The refundable balance is computed from the refund history, somebody decides that is a needless indirection, and compares against what was CAPTURED instead.',
        'SIX TESTS STAY GREEN. One does not, and it names the case and the line: refuses a second refund beyond what is left. Ten thousand captured, six thousand already refunded, and a five thousand refund goes through.',
        'SIT WITH THE SHAPE OF THAT RESULT, because the shape is the argument. Six tests agreed with the change. They were not wrong, they were not looking at that. One disagreed, by name, in 41 milliseconds, before review and before a customer.',
        'THAT IS WHAT "THE TESTS ARE A SPECIFICATION" MEANS. Not that they document the code. That when somebody changes the code, the specification is the thing that objects.',
      ],
      claims: [
        {
          text: 'Six of seven tests pass under the regression. The failure names refusesSecondRefundBeyondRemaining and the line number.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'before-or-after',
      title: 'The objection at minute three, answered honestly',
      body: [
        'It is not "this is slow". It is: why does it matter whether I write the exact same good test five minutes before the code or five minutes after it?',
        'THE DISHONEST ANSWER is "because that is the discipline". It loses, and it deserves to.',
        'THE HONEST ONE: sometimes it genuinely does not matter. If you understand the requirement, implement it correctly, and then independently write a suite capable of catching realistic faults, test-after gives you the same confidence. Test-after tests are not inherently inferior.',
        'The advantage is narrower and it is about YOU. Once you have implemented it, you know how it works, and that knowledge changes which tests occur to you. You will naturally confirm the structure you just built. Test-first asks a different question: before I know how this will work, what behaviour must be true?',
      ],
      claims: [
        {
          text: 'The advantage of test-first is not test quality in the abstract. It is that after implementing, you are no longer a neutral party.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'the-ai-claim',
      title: 'The AI argument, and why the obvious version is wrong',
      body: [
        'THE OBVIOUS VERSION: an agent implements in nine seconds, so the test is what is left, so test first matters more. That does not follow.',
        'THE OBJECTION THAT KILLS IT: if the same tool writes your test AND your implementation from one prompt, you do not have an independent specification. You have the same reasoner marking its own exam, and ten green tests do not help if all ten encode the same misunderstanding.',
        'WHAT SURVIVES, and it is the useful version: this does not make test driven development more valuable. It makes INDEPENDENT SPECIFICATION more valuable, and writing the test first is one way of forcing that separation.',
        'Generating code got cheaper much faster than deciding what the code should do. Nobody can tell you whether a second refund of fifty after a sixty refund of a hundred capture should fail. That is not a coding question.',
      ],
      claims: [
        {
          text: 'Never let the system that produced the work be your only source of evidence that the work is correct.',
          source: 'The same principle as the verification episode on this channel',
        },
      ],
    },
    {
      id: 'when-not-to',
      title: 'When not to bother',
      body: [
        'A SPIKE, where you are writing code to find out what you are building. Specifying the answer before you have found it is theatre.',
        'A TRIVIAL MAPPING, or generated code, where the test restates the code in a second language.',
        'WIRING ONE FRAMEWORK TO ANOTHER, where you end up testing somebody else\'s library badly.',
        'AND WHEN YOU CANNOT SAY what observable behaviour you expect. At that point you do not have a missing test. You have a design question you have not finished.',
      ],
      claims: [
        {
          text: 'Where the expected behaviour is obvious to everyone, the test is documentation rather than a discovery.',
          source: 'Operational practice, not vendor documentation',
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you call a suite a specification',
    items: [
      'How many of these tests say what must be REFUSED?',
      'Did I watch it fail before I made it pass?',
      'Did it fail for the right reason, or just because the class was missing?',
      'Is there an invariant here that depends on history rather than on the request?',
      'If somebody makes a plausible simplification, which test objects?',
      'Would that test name the case, or just go red?',
      'Were these tests written by the same thing that wrote the implementation?',
      'What does this suite cost us on every change, and is it worth that?',
      'Which of these tests has never failed, not even once?',
      'What behaviour is true in production that no test here describes?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('tdd-demos')].filter(Boolean),
  trademarks: ORACLE_TRADEMARK,
  closing: CLOSING,
};
