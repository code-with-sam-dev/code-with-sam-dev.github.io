/**
 * JUnit vs AssertJ vs Hamcrest: the design sheet.
 *
 * Built 2026-09-28 for the episode published 2026-09-15, which shipped before
 * the rule that every video ships with its sheet. Every snippet is copied from
 * the episode's test classes by script (motion/src/class-sources.ts), and every
 * failure message is the one the run printed.
 */
import {CHANNEL_LINKS, repoLink, ORACLE_TRADEMARK, CLOSING, SRC} from './java-common.mjs';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'JUnit vs AssertJ vs Hamcrest',
  subtitle: 'What the failure tells you',
  kicker: 'For software engineers: assertions on real refunds',
  strapline: 'The fluent syntax was never the value. The richer vocabulary is.',
  verifiedOn: '2026-09-15',

  intro: [
    'spring-boot-starter-test puts JUnit, AssertJ and Hamcrest on your classpath. All three export assertThat, and most people never chose between them.',
    'Most of the time it does not matter, and this sheet starts by proving that. Then it goes after the cases where it does: collections, failure paths, several observations of one outcome, and coverage.',
    'Hamcrest release dates are stated as at September 2026.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What each library prints when an assertion fails',
      'Asserting on a failure path: type, message and data',
      'Soft assertions, and where they stop being useful',
      'What coverage can and cannot tell you',
    ],
    outTitle: 'Out of scope',
    out: [
      'Rewriting simple JUnit assertions for stylistic purity',
      'Any claim that Hamcrest is dead',
    ],
    note: 'The recommendation is not "use AssertJ everywhere". It is: use the vocabulary that states the invariant.',
  },

  scale: {
    title: 'One failure, three libraries',
    note: 'Real messages from real runs.',
    rows: [
      ['Scalar, expected 4000 got 3500', 'all three print the same thing'],
      ['Collection, JUnit', 'both lists, the diff left to your eyes'],
      ['Collection, Hamcrest', 'names the index: item 2 was "k3"'],
      ['Collection, AssertJ', 'names what was missing and what was not expected'],
      ['assertTrue(...anyMatch...)', 'expected: <true> but was: <false>'],
      ['Coverage, weak test vs precise test', 'the same 9 lines hit, the same 5 missed'],
    ],
  },

  sections: [
    {
      id: 'weak-precise',
      title: 'Make the test say what it checks',
      body: ['A boolean assertion forces the reader to run the lambda in their head, and when it fails it can only say true was false. Extracting a property and stating the exact sequence makes three claims: which property, what order, how many.'],
      code: [
        {caption: "WeakVersusPreciseTest.java: weak", lines: [
          "    @Test",
          "    @DisplayName(\"weak: a boolean that says nothing about what was expected\")",
          "    void weakBooleanAssertion() {",
          "        // The reader has to mentally execute the lambda to know the claim.",
          "        assertTrue(ORDER.attempts().stream()",
          "            .anyMatch(a -> a.amountCents() == 5_000));",
          "    }"
          ]},
        {caption: "WeakVersusPreciseTest.java: precise", lines: [
          "    @Test",
          "    @DisplayName(\"precise: names the property, the order, and the cardinality\")",
          "    void preciseExtractingAssertion() {",
          "        assertThat(ORDER.attempts())",
          "            .extracting(RefundAttempt::amountCents)",
          "            .containsExactly(6_000L, 5_000L, 1_000L);",
          "    }"
          ]},
      ],
      claims: [{text: 'The precise version reports the missing 5000 and the unexpected 2000 separately.', source: SRC.MEASURED}],
    },
    {
      id: 'failure-path',
      title: 'A failure path has three parts of contract',
      body: ['assertThrows is green for any rejection, including the wrong one. Assert the type AND the message a support agent or API client reads, or assert on the throwable itself. The message is the contract when a person reads it; typed data is the contract when a caller branches on it.'],
      code: [
        {caption: "TddAnExceptionTest.java: green for the wrong reason", lines: [
          "    @Test",
          "    @DisplayName(\"weak: green for ANY refund rejection, including the wrong one\")",
          "    void weakExceptionAssertion() {",
          "        // Passes whether the refusal is about the balance, the amount, the",
          "        // capture, or a replay misdiagnosed as any of those.",
          "        assertThrows(RefundRejected.class,",
          "            () -> policy.refund(ORDER, \"k9\", 6_000));",
          "    }"
          ]},
        {caption: "TddAnExceptionTest.java: the type and the message", lines: [
          "    @Test",
          "    @DisplayName(\"precise: the type AND the message the caller actually reads\")",
          "    void preciseExceptionAssertion() {",
          "        assertThatExceptionOfType(RefundRejected.class)",
          "            .isThrownBy(() -> policy.refund(ORDER, \"k9\", 6_000))",
          "            .withMessage(\"refund 6000 exceeds captured 4000 on A-1\");",
          "    }"
          ]},
      ],
      claims: [{text: 'The precise assertion failed with "Expecting message to be exceeds captured, but was exceeds refundable", naming RefundPolicy.java line 35.', source: SRC.MEASURED}],
    },
    {
      id: 'soft',
      title: 'Soft assertions: several observations of ONE outcome',
      body: ['Hard assertions stop at the first failure, so you learn one thing per run. assertSoftly reports every failure in one run, each labelled with as(...). It is for three observations of one refund, not for unrelated requirements sharing a method.'],
      code: [
        {caption: "SoftAssertionsTest.java", lines: [
          "    @Test",
          "    @DisplayName(\"soft: one run, every failure, all three observations of one refund\")",
          "    void softAssertionsReportEverything() {",
          "        RefundResult result = policy.refund(ORDER, \"k2\", 3_000);",
          "",
          "        SoftAssertions.assertSoftly(softly -> {",
          "            softly.assertThat(result.refundedCents())",
          "                .as(\"amount refunded\").isEqualTo(4_000);",
          "            softly.assertThat(result.order().refundableCents())",
          "                .as(\"balance left\").isEqualTo(1_000);",
          "            softly.assertThat(result.order().attempts())",
          "                .as(\"attempt history\").hasSize(3);",
          "        });",
          "    }"
          ]},
      ],
      claims: [],
    },
    {
      id: 'coverage',
      title: 'Coverage says what ran, never what was checked',
      body: ['Both tests execute the same lines of the refund method. One would notice a wrong refund amount; the other would not. The gutter is the same colour for both.'],
      code: [
        {caption: "CoverageSaysWhatRanTest.java", lines: [
          "    @Test",
          "    @DisplayName(\"100% of the lines, 0% of the meaning\")",
          "    void weakAssertionWithFullCoverage() {",
          "        RefundResult result = policy.refund(Order.captured(\"A-1\", 10_000), \"k1\", 3_000);",
          "",
          "        // Exercises every line of the happy path. Checks nothing about refunds.",
          "        assertNotNull(result);",
          "    }",
          "",
          "    @Test",
          "    @DisplayName(\"the same lines, and an assertion that would notice a wrong answer\")",
          "    void preciseAssertionWithTheSameCoverage() {",
          "        RefundResult result = policy.refund(Order.captured(\"A-1\", 10_000), \"k1\", 3_000);",
          "",
          "        assertThat(result.refundedCents()).isEqualTo(3_000);",
          "        assertThat(result.order().refundableCents()).isEqualTo(7_000);",
          "    }"
          ]},
      ],
      claims: [{text: 'Lines 19, 22, 23, 26, 29, 32, 33, 37 and 38 covered, lines 24, 27, 30, 34 and 35 missed, identically for both tests.', source: SRC.MEASURED}],
    },
    {
      id: 'hamcrest',
      title: 'Where that leaves Hamcrest',
      body: ['As at September 2026, Hamcrest 3.0 shipped in August 2024, five years after 2.2. Pace is not the argument: a mature library does not need monthly releases. The question is whether matcher composition gives the clearest test for your domain. Sometimes it does, especially where an API hands you matchers. Often the fluent version reads more plainly.'],
      code: [],
      claims: [{text: 'Hamcrest release history, checked September 2026.', source: 'Maven Central, org.hamcrest:hamcrest'}],
    },
  ],

  checklist: {
    title: 'Before you trust a green test',
    items: [
      'Does this assertion say what it checks, or only that something was true?',
      'On a failure path, is it asserting the type, the message and the data?',
      'Could this test be green for the wrong rejection?',
      'Are these soft assertions observations of one outcome?',
      'Would anything here notice the method returning the wrong number?',
      'Is this simple enough that plain JUnit reads better?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('assertions-demos')].filter(Boolean),
  trademarks: ORACLE_TRADEMARK,
  closing: CLOSING,
};
