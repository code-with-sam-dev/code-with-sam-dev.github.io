/**
 * The quietly quadratic loop design sheet.
 *
 * THE NUMBERS ARE MEASURED, NOT ILLUSTRATIVE. 29.3ms, 46.5ms and 135.8ms came
 * off the machine that built the episode, on Java 21, in one session. If a
 * number here is ever changed it gets re-measured first.
 *
 * THE PAGE THAT EARNS THE SHEET is the doubling table. "Use a StringBuilder" is
 * the answer almost everyone reaches. Watching the wall clock roughly triple
 * each time the input doubles is the evidence that the COMPLEXITY CLASS
 * changed, which is the part the answer usually misses.
 */
import {CHANNEL_LINKS, repoLink, ORACLE_TRADEMARK, CLOSING} from './java-common.mjs';

const SRC = {
  MEASURED: 'Measured on the machine that built this sheet, Java 21, not quoted',
  JLS_STRING: 'The Java Language Specification, String objects are immutable',
  JLS_CONCAT: 'The Java Language Specification, string concatenation operator',
  JAVADOC_SB: 'StringBuilder, API documentation',
  JAVADOC_REPEAT: 'String.repeat, introduced in Java 11',
  FIRST: 'First principles, not vendor documentation',
};

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/watch?v=KBSz9wxCzRA', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'The Quietly Quadratic Loop',
  subtitle: 'It compiles, it is correct, and it passes review',
  kicker: 'For software engineers: the half answer most seniors give',
  strapline:
    'Double the input and the time roughly triples. That is a complexity class changing, in wall clock rather than in a textbook.',
  verifiedOn: '2026-09-16',

  intro: [
    'Most people look at this loop and assume the problem is `String res = ""`. It is not. The problem is `res +=` inside the loop.',
    'Saying "this is slow" is not the answer. Saying WHY the complexity class changes is, and that is a language rule almost every engineer can recite and very few apply.',
    'The timings on this page were measured on one machine in one session, on Java 21. They are not illustrative.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Why immutability turns a linear-looking loop into quadratic work',
      'Three measurements showing the growth in wall clock',
      'Why sizing the builder up front still matters',
      'The one-line answer that exists for this exact case since Java 11',
      'Why the compiler optimisation people cite does not rescue this',
    ],
    outTitle: 'Out of scope',
    out: [
      'Micro-benchmark methodology. These are wall clock timings, stated as such',
      'Any claim about your hardware. The SHAPE of the growth is the transferable part',
      'String interning, which is a different question that sounds related',
      'Rope or builder implementations in other languages',
    ],
    note:
      'Read the table first. The absolute milliseconds belong to one machine; the ratio between the rows belongs to everybody.',
  },

  scale: {
    title: 'Measured on Java 21, one machine, one session',
    note:
      'Each doubling of n roughly triples the time for the concatenation, which is the signature of quadratic growth. The builder does not move.',
    rows: [
      ['n = 10,000, res += s', '29.3 ms'],
      ['n = 20,000, res += s', '46.5 ms'],
      ['n = 40,000, res += s', '135.8 ms'],
      ['n = 40,000, StringBuilder', '0.833 ms'],
      ['The ratio that matters', 'About 163 times faster at n = 40,000'],
      ['The shape that matters', 'Double the input, roughly triple the time'],
    ],
  },

  sections: [
    {
      id: 'why',
      title: 'Why it is quadratic',
      body: [
        'Strings in Java are immutable. Every `+=` creates a NEW String and copies everything accumulated so far into it.',
        'On iteration one you copy one unit. On iteration two, two. The total work is the sum of one to n, which is quadratic in the LENGTH OF THE OUTPUT rather than linear in the number of iterations.',
        'That distinction is the whole answer. The loop runs n times and looks linear. The work inside it grows with what has already been built, and that is what nobody says out loud.',
      ],
      claims: [
        {
          text: 'String objects are immutable, so their contents cannot be changed after they are created.',
          source: SRC.JLS_STRING,
        },
        {
          text: 'Summing one to n is quadratic in n, so copying an accumulating buffer once per iteration is quadratic in the length of the result.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'measured',
      title: 'Measured, not asserted',
      body: [
        'Ten thousand took 29.3 milliseconds. Twenty thousand took 46.5. Forty thousand took 135.8.',
        'Double the input and the time roughly triples. That is quadratic growth appearing in wall clock rather than in a complexity table, and it is far more persuasive in a room than the theory is.',
        'The builder at the same size took 0.833 milliseconds, and stays flat as the input grows.',
      ],
      claims: [
        {
          text: 'At n = 40,000 the concatenating loop took 135.8 ms and the builder took 0.833 ms on the same machine in the same session.',
          source: SRC.MEASURED,
        },
        {
          text: 'The absolute numbers belong to one machine. The ratio between the rows is the part that transfers.',
          source: SRC.FIRST,
        },
      ],
    },
    {
      id: 'fix',
      title: 'The fix, and the detail inside the fix',
      body: [
        'Use a StringBuilder and append. The buffer is mutable, so nothing is copied on each iteration.',
        'SIZE IT UP FRONT. `new StringBuilder(s.length() * n)` matters, because without a capacity the internal array still has to grow and copy. Far fewer times than the concatenation did, but not zero.',
        'And for this exact case, since Java 11, the shorter answer is `s.repeat(n)`. Knowing that exists is worth a sentence, because reaching for a builder when the library already has the method is its own small tell.',
      ],
      claims: [
        {
          text: 'StringBuilder provides a mutable sequence of characters, so appending does not copy the accumulated content on every call.',
          source: SRC.JAVADOC_SB,
        },
        {
          text: 'A builder created without a capacity still resizes its internal array as it grows, which is why sizing it up front is not a micro-optimisation.',
          source: SRC.JAVADOC_SB,
        },
        {
          text: 'String.repeat returns a string whose value is the concatenation of this string repeated n times, and has existed since Java 11.',
          source: SRC.JAVADOC_REPEAT,
        },
      ],
    },
    {
      id: 'compiler',
      title: 'Why the optimisation people cite does not rescue you',
      body: [
        'Someone will say the compiler turns string concatenation into a builder anyway. That is true WITHIN one expression.',
        'Here the concatenation happens ACROSS LOOP ITERATIONS. Each iteration is its own expression, so each one builds, copies and discards. There is nothing for that optimisation to fuse.',
        'Being able to say that sentence is the difference between having heard about the optimisation and understanding what it applies to.',
      ],
      claims: [
        {
          text: 'The compiler may optimise a concatenation expression into a builder, which does not extend across separate statements executed in separate iterations.',
          source: SRC.JLS_CONCAT,
        },
      ],
    },
    {
      id: 'interview',
      title: 'What the interviewer is listening for',
      body: [
        'Not "use a StringBuilder". Almost everyone gets there, and getting there proves very little.',
        'The answer that separates people names three things: immutability, the copy on every iteration, and the resulting change of complexity class. Then it adds that the compiler optimisation does not apply because the concatenation is across iterations rather than within one expression.',
        'If you have a number, use it. "It roughly triples each time the input doubles" is a sentence that sounds like someone who ran it.',
      ],
      claims: [
        {
          text: 'Naming the mechanism and the complexity class, rather than the remedy, is what distinguishes a measured answer from a memorised one.',
          source: SRC.FIRST,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you call a loop linear',
    items: [
      'Does anything inside the loop copy what has already been accumulated?',
      'Is the accumulating type immutable?',
      'Is the complexity in the number of iterations, or in the size of the result?',
      'Would doubling the input double the time, or more than double it?',
      'Is there a capacity I could give the builder up front?',
      'Does the standard library already have this method?',
      'Am I relying on a compiler optimisation that works only within one expression?',
      'Have I measured it, or am I reasoning about it?',
      'Can I state the complexity class, not just that it is slow?',
      'Does the same argument apply to the list or map I am building the same way?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('java-demos')].filter(Boolean),
  trademarks: ORACLE_TRADEMARK,
  closing: CLOSING,
};
