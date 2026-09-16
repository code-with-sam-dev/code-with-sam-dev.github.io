/**
 * The EJB to Spring Boot design sheet.
 *
 * Every claim on this page was checked on 2026-09-16 against the Jakarta EE
 * specifications themselves, and the working is recorded in
 * production/ejb-claims.md. Nothing here is sourced to a blog post.
 *
 * THE PAGE THAT EARNS THE SHEET is the characterisation result. The premium is
 * identical, the excess is identical, and the basis label is not, and that was
 * FOUND by running a corpus through both implementations rather than reasoned
 * about. A sheet that only argued the thesis would be one more opinion. A sheet
 * that prints the diff is evidence.
 *
 * ONE CLAIM WAS DELIBERATELY WEAKENED. The tempting sentence is that the
 * platform specification says an HTTP request does not propagate transaction
 * context. That sentence could not be retrieved from the specification, so it
 * is not on this page. What is on the page is the mechanism, which is sourced
 * and is more useful anyway: propagation is provided by the transaction
 * managers at both ends and the format has to be negotiated between the hosts,
 * and an ordinary REST call negotiates nothing.
 */
import {CHANNEL_LINKS, repoLink, CLOSING} from './java-common.mjs';

const SRC = {
  EJB_CORE: 'Jakarta Enterprise Beans 4.0, Core Features',
  EJB_TX: 'Jakarta Enterprise Beans 4.0, transaction context of a client call',
  JTA: 'Jakarta Transactions 2.0, transaction context propagation',
  CONCURRENCY: 'Jakarta Concurrency, ContextServiceDefinition',
  MEASURED: 'Measured on the machine that built this sheet, not quoted',
  PRACTICE: 'Engineering practice, not vendor documentation',
};

const DATED =
  'Every statement about a specification on this sheet was read out of that ' +
  'specification in September 2026 and is quoted rather than paraphrased. ' +
  'Statements about your own runtime are not on this page, because the only ' +
  'honest source for those is the version you are actually running.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/watch?v=Ug5eZMkIZeo', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'EJB to Spring Boot',
  subtitle: 'Interface compatibility is not semantic compatibility',
  kicker: 'For software engineers: the migration you can actually draw',
  strapline:
    'The method signature is identical byte for byte and the contract has still changed. Two runs, one rollback, and a ledger that disagrees with itself.',
  verifiedOn: '2026-09-16',

  intro: [
    'Everyone agrees the old enterprise beans have to go. Nobody signs the eighteen month rewrite, and they are right not to, because nobody in the room can describe what the system looks like in month nine.',
    'This sheet is the middle. What to extract first, what to freeze, what to measure before you touch anything, and the one failure that survives a green test suite because every type still lines up.',
    DATED,
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'What a remote enterprise bean call carried that an HTTP call does not',
      'Characterisation before architecture, and what it caught here',
      'The anti-corruption layer, and which side of it a legacy quirk belongs on',
      'Four architecture rules that fail a build rather than a review',
      'The order of work for a strangler migration that can be stopped at any point',
    ],
    outTitle: 'Out of scope',
    out: [
      'Any claim that enterprise beans are unsupported. Jakarta EE is alive; the problem is always a specific runtime and version',
      'Deployment frequency numbers. Nobody has a source for those',
      'Which application server to leave, which is a decision only your operations record can make',
      'Anything implying this ordering comes from one person and one company',
    ],
    note:
      'Read the transaction section first. Everything else on this page is a consequence of the fact that the compiler cannot see the difference between the two call shapes.',
  },

  scale: {
    title: 'The order of work, and what each step buys',
    note:
      'Every step leaves the system shippable. That is the property that makes the plan signable, and it is the reason characterisation comes before any architecture at all.',
    rows: [
      ['1. Corpus', 'Record real request shapes off the running system. Not invented ones'],
      ['2. Characterise', 'Run the corpus through the old implementation. Whatever it does IS the spec now'],
      ['3. Extract the domain', 'Pure logic, no framework, no legacy types reaching in'],
      ['4. Adapter', 'New domain behind the old interface. The corpus must still pass'],
      ['5. Enforce', 'Architecture tests, so the boundary survives the next developer in a hurry'],
      ['6. Divert', 'Route a slice of traffic. Keep the old path warm and reversible'],
      ['7. Delete', 'Only once nothing calls it. Deleting early is how a migration becomes a rewrite'],
    ],
  },

  sections: [
    {
      id: 'transaction',
      title: 'The call that carried a transaction, and the call that does not',
      body: [
        'A remote enterprise bean call made inside a transaction ran inside that transaction. The container did it for you and no line of application code said so.',
        'Replace that call with an HTTP hop to a new service and the signature is unchanged, the arguments are unchanged, the return value is unchanged, and the transaction is gone. The caller rolls back and the work on the other side stays committed.',
        'Nothing throws. Nothing logs. The types line up. That is what makes it dangerous: every check a reviewer would run still passes.',
      ],
      claims: [
        {
          text: 'If a client invokes an enterprise bean method while the client is associated with a transaction context, the container invokes the enterprise bean method in the client transaction context.',
          source: SRC.EJB_TX,
        },
        {
          text: 'Transaction context propagation between application programs is provided by the underlying transaction manager implementations on the client and server machines. The transaction context format used for propagation is protocol dependent and must be negotiated between the client and server hosts.',
          source: SRC.JTA,
        },
        {
          text: 'An ordinary REST call from an HTTP client to a controller negotiates nothing, so there are no two transaction managers talking and no context to carry.',
          source: SRC.PRACTICE,
        },
        {
          text: 'Jakarta EE providers need not support the propagation of transactions to other threads and can reject resource definition annotations that include transaction as a propagated context.',
          source: SRC.CONCURRENCY,
        },
      ],
    },
    {
      id: 'measured',
      title: 'The same two calls, one rolled back',
      body: [
        'Identical interface. Identical arguments. Identical return value. One difference, and it is in the database rather than in the response.',
        'bean, then caller rolls back: the ledger is EMPTY. The call was enlisted in the caller transaction.',
        'adapter, then caller rolls back: the ledger HAS ONE ENTRY. It was never enlisted.',
        'Both paths returned the same result object, which is precisely why nobody notices until the reconciliation run.',
      ],
      claims: [
        {
          text: 'Both call shapes return an equal result while leaving the database in different states after an identical rollback.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'pass-by-value',
      title: 'Why the old contract is a serialization contract',
      body: [
        'A remote interface is pass by value. The arguments are serialized, so every type that crosses it is part of a Java serialization contract with all of its history baked in.',
        'That is why the adapter inherits two contracts rather than one: the method signature, which the compiler checks, and the wire shape, which it does not.',
        'It is also why a local interface type cannot be handed to a remote method. The spec forbids it, and the reason is the same one that makes this migration hard.',
      ],
      claims: [
        {
          text: 'Arguments and results of methods in a local client view are passed by reference, whereas remote interfaces use pass-by-value semantics.',
          source: SRC.EJB_CORE,
        },
        {
          text: 'If an entity instance is to be passed by value as a detached object through a remote interface, the entity class must implement the Serializable interface.',
          source: SRC.EJB_CORE,
        },
        {
          text: 'A local interface type must not be passed as an argument or result of a remote interface method.',
          source: SRC.EJB_CORE,
        },
      ],
    },
    {
      id: 'characterisation',
      title: 'What the corpus caught, which nobody planted',
      body: [
        'Thirteen recorded request shapes through the legacy bean and through the adapter. Twelve matched. One did not.',
        'Policy P-1009, scheme "NOPE", excess null. Premium 19750 on both sides. Excess 25000 on both sides. The basis label came back NOPE/S from the bean and STD/S from the new domain.',
        'The money is identical. The label is not. Any downstream report keyed on that label now sees a value it has never seen before, and it would have shipped, because the money reconciles and the types match.',
        'This is the thesis in miniature, and it was found rather than argued. That is the whole case for characterising before you architect.',
      ],
      claims: [
        {
          text: 'The legacy bean upper cased whatever scheme string arrived and used it in the basis label; the new domain parses an unknown scheme to a standard default.',
          source: SRC.MEASURED,
        },
        {
          text: 'A corpus comparison caught a behaviour change that identical signatures, identical numbers and a passing suite all missed.',
          source: SRC.MEASURED,
        },
      ],
    },
    {
      id: 'acl',
      title: 'Which side of the boundary a quirk belongs on',
      body: [
        'The obvious fix is to make the new domain reproduce the old label. Do not. Normalising an unknown scheme is the correct behaviour for new code, and importing the quirk into the domain defeats the entire exercise.',
        'The fix belongs in the adapter, whose job is exactly this: to keep paying the old contract debts so the new code does not have to inherit them.',
        'That is what an anti-corruption layer is for, and it is the difference between a migration and a rename. The domain stays clean. The adapter carries the label.',
      ],
      claims: [
        {
          text: 'A legacy behaviour that is wrong for new code but observed by existing consumers belongs in the translating layer, not in the extracted domain.',
          source: SRC.PRACTICE,
        },
      ],
    },
    {
      id: 'archunit',
      title: 'The rule that fails the build, not the review',
      body: [
        'The drift that actually happens is not exotic. Somebody reuses the legacy data object in the domain instead of writing a port. It compiles, it is already on the classpath, the pull request looks fine, and the boundary is gone.',
        'Four rules, enforced in the test suite: the domain depends on neither the legacy contract nor the adapter, no framework package reaches into the domain, and the frozen legacy contract never reaches forward into the new code.',
        'Write the reason into the rule. A developer who hits it at four in the afternoon should not have to go and find somebody to ask.',
      ],
      claims: [
        {
          text: 'An architecture rule carrying its reason names the offending field, the offending type, and why the rule exists, in the failure message itself.',
          source: SRC.MEASURED,
        },
        {
          text: 'A boundary that lives only in a diagram is a boundary that survives until the next deadline.',
          source: SRC.PRACTICE,
        },
      ],
    },
    {
      id: 'interview',
      title: 'The answer that beats "we moved to Spring Boot"',
      body: [
        'The weak answer is the destination. Everyone has the same destination and it says nothing about whether you have done this.',
        'The stronger answer names what the old call gave you for free and what you had to make explicit to replace it. A remote bean call joined the caller transaction. An HTTP hop does not, so the work has to become idempotent, or compensating, or it has to stay on the same side of the boundary.',
        'Then say what you measured before you moved anything. An answer with a corpus in it sounds like someone who has done a migration. An answer with a diagram in it sounds like someone who has read about one.',
      ],
      claims: [
        {
          text: 'Naming what a platform did implicitly, and what replaced it explicitly, distinguishes an engineer who ran a migration from one who planned a rewrite.',
          source: SRC.PRACTICE,
        },
      ],
    },
  ],

  checklist: {
    title: 'Before you move one call out',
    items: [
      'Was the old call made inside a transaction, and did it join one?',
      'If the transaction is gone, what makes the work safe to repeat?',
      'Do I have recorded real request shapes, or shapes I invented?',
      'Does the corpus pass through the adapter before any traffic moves?',
      'Which types cross the old remote boundary, and are they part of a serialization contract?',
      'Is there a legacy quirk in the output that a downstream system reads?',
      'Which side of the anti-corruption layer did I put that quirk on?',
      'Is the boundary enforced by a test, or only by agreement?',
      'Can this step be stopped and shipped as it is?',
      'Is the old path still warm enough to route back to today?',
    ],
  },

  links: [...CHANNEL_LINKS, repoLink('ejb-migration-demos')].filter(Boolean),
  trademarks:
    'Jakarta and Jakarta EE are trademarks of the Eclipse Foundation. Spring and Spring Boot are trademarks of Broadcom. Java is a trademark of Oracle and/or its affiliates. This sheet is not affiliated with, endorsed by, or sponsored by any of them.',
  closing: CLOSING,
};
