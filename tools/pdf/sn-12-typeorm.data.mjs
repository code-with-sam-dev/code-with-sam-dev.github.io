/**
 * Spring to Node design sheet, episode 13 in the course list: TypeORM entities and repositories.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-typeorm.sh` in the course
 * repository. Node 22.22.2, TypeORM 1.1.1 and 0.3.30, Spring Boot 4.1.1, Postgres 18.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-typeorm.sh in the course repository.';
const TYPEORM = 'TypeORM 1.1.1 source and changelog, read 2026-09-30.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Changed. Not saved.',
  subtitle: 'Spring Boot to NestJS, episode 13: TypeORM entities and repositories',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'The annotations look the same. The lifecycle is not.',
  verifiedOn: '2026-09-30',

  intro: [
    'JPA tracks managed entities: change one inside a transaction and Hibernate writes it at flush. TypeORM persists when you ask.',
    'TypeORM gives you two ways to ask, save() and update(), and they are different paths.',
    'A Java Long is not a TypeScript number, and some TypeORM advice depends on the major version.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'Entity and repository mapping, JPA to TypeORM',
      'Managed entities against plain objects',
      'save() against update(), measured',
      'bigint, and the 0.3 to 1.x change in where values',
    ],
    outTitle: 'Not in scope',
    out: ['Migrations and relations: next episode', 'Transactions: episode 15'],
    note: 'Measured on one machine against Postgres 18.',
  },

  scale: {
    title: 'The measurements',
    note: 'Same table shape on both stacks.',
    rows: [
      ['LOAD, CHANGE, COMMIT, NO SAVE', 'Spring: written. TypeORM: not written'],
      ['save(entity)', 'SELECT, transaction, UPDATE; @BeforeUpdate ran 1x'],
      ['update(id, partial)', 'one UPDATE; @BeforeUpdate ran 0x'],
      ['bigint 9007199254740993', 'string; Number() gives ...992; BigInt exact'],
      ['findOneBy({ id: undefined })', '0.3.30 returned a row; 1.1.1 throws'],
      ['synchronize, a property rename', 'RENAME COLUMN, data kept (one case)'],
    ],
  },

  sections: [
    {
      id: 'entity',
      title: 'The mapping transfers',
      body: ['@Entity stays @Entity, @Id with a generated value becomes @PrimaryGeneratedColumn, @Column stays @Column. A TypeORM Repository is an EntityManager scoped to one entity type.'],
      code: [
        {caption: 'probes.ts, the TypeORM entity', lines: [
          "@Entity('ep12_accounts')",
          'class Account {',
          '  @PrimaryGeneratedColumn()',
          '  id!: number;',
          '',
          '  @Column()',
          '  owner!: string;',
          '',
          "  @Column({ type: 'bigint' })",
          '  balanceInMinorUnits!: string;',
          '}',
        ]},
      ],
      claims: [{text: 'Hibernate wrote the changed owner with no save() call; TypeORM did not', source: RUN}],
    },
    {
      id: 'persist',
      title: 'Ask explicitly, and pick the path',
      body: ['save() works from the entity: it re-read the row, opened a transaction, updated, and ran the @BeforeUpdate listener. update() sent one statement and the listener did not run.'],
      code: [{caption: 'probes.ts', lines: [
        "loaded.owner = 'dave-via-save';",
        'await repo.save(loaded);',
        '',
        "await repo.update(dave.id, { owner: 'dave-via-update' });",
      ]}],
      claims: [
        {text: 'synchronize: "Be careful with this option and don\'t use this in production - otherwise you can lose production data."', source: TYPEORM},
        {text: '1.0.0 changelog, invalid-where-values-behavior: "make throw the default"', source: TYPEORM},
      ],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: TypeORM 1.1, Spring Boot 4.1.',

  checklist: {
    title: 'Before you port a JPA service to TypeORM',
    items: [
      'Call save() or update(); a changed entity is not written by itself',
      'Use save() when entity listeners must run',
      'Map Java Long to string or BigInt, not number',
      'Check the TypeORM major version before trusting old advice',
      'Keep synchronize off outside development',
      'Move schema changes to migrations',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-typeorm.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'TypeORM', url: 'https://typeorm.io'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
