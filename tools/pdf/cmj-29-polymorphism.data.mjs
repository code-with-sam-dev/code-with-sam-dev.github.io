/**
 * Complete Modern Java design sheet, episode 29: polymorphism, in Java and TypeScript.
 *
 * EVERY OUTPUT HERE WAS RUN. Run on 2026-11-07 in the student home folder (Java 25, Node 24 LTS,
 * TypeScript 7.0.2).
 * The files are in the repository: java/ep29 and typescript/ep29.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a Mac, 2026-11-07: Java 25.0.4, Node 24.22.0, TypeScript 7.0.2.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Same call. Different result.',
  subtitle: 'Complete Modern Java, episode 29: polymorphism, in Java and TypeScript',
  kicker: 'For complete beginners',
  strapline: 'When checkout keeps asking what kind of payment it has, let each payment object answer instead.',
  verifiedOn: '2026-11-07',
  intro: [
    'An if statement is not wrong; for two fixed types it may be the simplest thing. But every new type means editing it.',
    'With a shared type, the call stays the same and each object supplies its own behaviour.',
  ],
  scope: {
    inTitle: 'In this episode',
    in: ['A string if chain', 'totalFor(PaymentMethod)', 'Adding a type', 'One variable, two objects', 'What polymorphism means', 'TypeScript, the same way'],
    outTitle: 'Coming next',
    out: ['Records (episode 30)'],
    note: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  },
  scale: {
    title: 'What each run printed',
    note: 'Every row was run, not predicted.',
    rows: [
      ['StringTill: card, cash, voucher', '1020, 1000, unknown payment type'],
      ['Till: card, cash', '1020, 1000'],
      ['Till: a VoucherPayment', '1050, totalFor unchanged'],
      ['one variable: a card, then cash', '1020, then 1000'],
      ['till.ts', '1020, 1000, 1050'],
    ],
  },
  sections: [
    {
      id: 'if',
      title: 'Asking what kind of payment it is',
      body: ['Fine for a small fixed set; the method has to be edited for every new payment type.'],
      code: [{caption: 'StringTill.java', lines: [
        'int totalFor(String type, int priceCents) {',
        '    if (type.equals("card")) {',
        '        return priceCents + priceCents * 2 / 100;',
        '    }',
        '    if (type.equals("cash")) {',
        '        return priceCents;',
        '    }',
        '    throw new IllegalArgumentException("unknown payment type: " + type);',
        '}',
      ]}],
      claims: [{text: 'card 1020, cash 1000, then unknown payment type: voucher.', source: RUN}],
    },
    {
      id: 'poly',
      title: 'Letting the object answer',
      body: [
        'totalFor never asks what kind of payment it was given. A new VoucherPayment class is created and passed in; the calculation does not change.',
        'Every payment uses the same inherited totalCents; inside it, Java calls the feeCents of the actual object.',
      ],
      code: [{caption: 'Till.java', lines: [
        'int totalFor(PaymentMethod method, int priceCents) {',
        '    return method.totalCents(priceCents);',
        '}',
        '',
        'PaymentMethod method = new CardPayment();',
        'IO.println(method.totalCents(1000));   // 1020',
        'method = new CashPayment();',
        'IO.println(method.totalCents(1000));   // 1000',
      ]}],
      claims: [{text: 'Card 1020, cash 1000, voucher 1050; one variable printed 1020, then 1000.', source: RUN}],
    },
    {
      id: 'ts',
      title: 'TypeScript',
      body: ['The same abstract class, three payment types and a totalFor function give the same three answers.'],
      code: [{caption: 'till.ts', lines: [
        'function totalFor(method: PaymentMethod, priceCents: number): number {',
        '    return method.totalCents(priceCents);',
        '}',
        'console.log(totalFor(new VoucherPayment(), 1000));   // 1050',
      ]}],
      claims: [{text: 'tsc quiet; 1020, 1000, 1050.', source: RUN}],
    },
  ],
  scaleNote: 'At the time of recording: Java 25, Node 24 LTS, IntelliJ IDEA 2026.1.3.',
  checklist: {
    title: 'Polymorphism, in one look',
    items: [
      'Same call, through a shared type.',
      'The object decides which version runs.',
      'An if is not wrong; a growing one is a hint.',
      'New type: new class, the checkout unchanged.',
      'Challenge: a fourth payment type, totalFor untouched.',
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
