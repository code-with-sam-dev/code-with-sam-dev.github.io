/**
 * Complete Modern Java design sheet, episode 28: abstract classes, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep28 and typescript/ep28.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Half built. On purpose.',
  subtitle: 'Complete Modern Java, episode 28: abstract classes, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'A parent with work left unfinished: its finished methods call the unfinished ones, and each child fills them in.',
  verifiedOn: '2026-11-07',
  intro: [
    'Card adds a two percent fee; cash adds nothing. Both work out a total the same way: price plus fee.',
    'Write the shared calculation once, in an abstract parent, and leave the fee to each payment type.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['abstract class', 'abstract method', 'A finished method calling an unfinished one', 'Two finished children', 'Cannot create the parent', 'Interface or abstract class', 'TypeScript abstract at run time'],
    outTitle: 'Coming next',
    out: ['Polymorphism (episode 29)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['PaymentMethod payment = new CardPayment(); totalCents(1000)', '1020'],
      ['a list of card and cash', 'Card: 1020, Cash: 1000'],
      ['new PaymentMethod("Voucher")', 'compile error'],
      ['pay.ts', 'Card: 1020, Cash: 1000'],
      ['pay.ts with a PaymentMethod voucher', 'TS2511; node: this.feeCents is not a function'],
    ],
  },
  sections: [
    {
      id: 'parent',
      title: 'The abstract parent',
      body: [
        'totalCents is finished and calls feeCents, which is not. Abstract describes an incomplete class; not every method in it is abstract.',
        'In our little shop each payment type decides its own fee; real payment systems have more rules. Fractions of a cent are dropped.',
      ],
      code: [{caption: 'PaymentMethod.java', lines: [
        'abstract class PaymentMethod {',
        '    private String name;',
        '',
        '    PaymentMethod(String name) {',
        '        this.name = name;',
        '    }',
        '',
        '    String getName() {',
        '        return name;',
        '    }',
        '',
        '    abstract int feeCents(int priceCents);',
        '',
        '    int totalCents(int priceCents) {',
        '        return priceCents + feeCents(priceCents);',
        '    }',
        '}',
      ]}],
      claims: [{text: 'A PaymentMethod variable holding a CardPayment printed 1020; the list printed Card: 1020 and Cash: 1000.', source: RUN}],
    },
    {
      id: 'children',
      title: 'The children fill the gap',
      body: ['These are ordinary, finished classes, so Java requires each one to fill in feeCents. You cannot create the parent itself.'],
      code: [{caption: 'CardPayment.java', lines: [
        'class CardPayment extends PaymentMethod {',
        '    CardPayment() {',
        '        super("Card");',
        '    }',
        '',
        '    @Override',
        '    int feeCents(int priceCents) {',
        '        return priceCents * 2 / 100;',
        '    }',
        '}',
      ]}],
      claims: [{text: 'new PaymentMethod("Voucher"): PaymentMethod is abstract; cannot be instantiated.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript abstract',
      body: ['tsc refuses to create the abstract class. node creates it anyway, and fails when the missing method is called.'],
      code: [{caption: 'pay.ts', lines: [
        'abstract class PaymentMethod {',
        '    abstract feeCents(priceCents: number): number;',
        '    totalCents(priceCents: number): number {',
        '        return priceCents + this.feeCents(priceCents);',
        '    }',
        '}',
        'const voucher = new PaymentMethod("Voucher");   // TS2511',
        'console.log(voucher.totalCents(1000));          // node: TypeError',
      ]}],
      claims: [{text: 'tsc: Cannot create an instance of an abstract class. node: this.feeCents is not a function.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Abstract classes, in one look',
    items: [
      'Shared work in the parent; the missing part left abstract.',
      'Finished methods may call unfinished ones.',
      'Every finished child fills in the gap.',
      'Interface: a promise. Abstract class: partly built.',
      'Challenge: VoucherPayment, 50 cent fee. Voucher: 1050.',
    ],
  },
  links: [
    ...CHANNEL_LINKS,
    {label: 'The code and the challenge files: complete-modern-java', url: 'https://github.com/code-with-sam-dev/complete-modern-java'},
  ],
  trademarks:
    'Java is a trademark of Oracle. Node.js is a trademark of the OpenJS Foundation. TypeScript is a trademark of Microsoft. IntelliJ IDEA is a trademark of ' +
    'JetBrains. This is an independent, unofficial guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
