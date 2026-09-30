/**
 * Spring to Node design sheet, episode 11 in the course list: file uploads and downloads.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-09-30, by `scripts/verify-uploads.sh` in the course
 * repository. Node 22.22.2, @nestjs/platform-express 12.0.1, Multer 2.4.0, Spring Boot 4.1.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-09-30, by scripts/verify-uploads.sh in the course repository.';
const BOOT = 'spring-boot-servlet 4.1.1 configuration metadata, read 2026-09-30.';
const MULTER = 'Multer 2.4.0 README and storage/memory.js, read 2026-09-30.';
const NODE = 'Node.js 22 docs, process.memoryUsage(), read 2026-09-30.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: 'Nest took 50 MB.',
  subtitle: 'Spring Boot to NestJS, episode 11: file uploads and downloads',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'The requirement transfers: bound the upload. The default does not.',
  verifiedOn: '2026-09-30',

  intro: [
    'Spring Boot refuses a 2 MB multipart file out of the box. NestJS on Express, with Multer, accepts 50 MB and keeps it in memory.',
    'The heap barely moves while it happens, because a Node Buffer lives outside the V8 heap. Watch arrayBuffers and rss.',
    'The fix is two decisions: a size bound, and a storage location. For downloads, stream rather than buffer.',
  ],

  scope: {
    inTitle: 'In scope',
    in: [
      'NestJS on its default Express platform, uploads through Multer',
      'Which memory counter sees an upload, and why it reads twice the file',
      'limits.fileSize and diskStorage, as two separate decisions',
      'Buffered against streamed downloads, under concurrency',
    ],
    outTitle: 'Not in scope',
    out: ['NestJS on Fastify: its file size cap defaults to 1 MiB (NestJS docs)', 'Object storage uploads (S3 and friends)'],
    note: 'Measurements are one machine, one local client. They show direction and scale, not constants.',
  },

  scale: {
    title: 'The measurements',
    note: 'Same endpoint shape on both stacks, nothing configured unless stated.',
    rows: [
      ['SPRING BOOT, 2 MB', '413'],
      ['NESTJS + MULTER, 2 MB / 50 MB', '201 / 201, inMemory true'],
      ['ONE 50 MB UPLOAD: heapUsed', '15.8 -> 16.7 MB'],
      ['ONE 50 MB UPLOAD: arrayBuffers', '0.1 -> 100.1 MB'],
      ['ONE 50 MB UPLOAD: rss', '99.9 -> 197.4 MB'],
      ['WITH limits + diskStorage', '512 KB 201 to disk, 50 MB 413'],
      ['4 x 200 MB DOWNLOADS, PEAK', 'buffered 800.3 MB, streamed 32.8 MB'],
      ['SAME, FORCED GC EVERY 20 MS', 'buffered 800.1 MB, streamed 6.2 to 7.7 MB'],
    ],
  },

  sections: [
    {
      id: 'bound',
      title: 'Bound the upload, and choose where it goes',
      body: ['Two options, two decisions. limits.fileSize is the bound; without it Multer accepts any size. diskStorage decides where an accepted file goes; on its own it bounds nothing.'],
      code: [
        {caption: 'bounded.ts, the upload route (repository)', lines: [
          "import { FileInterceptor } from '@nestjs/platform-express';",
          "import { diskStorage } from 'multer';",
          '',
          "@Post('upload')",
          "@UseInterceptors(FileInterceptor('file', {",
          '  storage: diskStorage({ destination: uploadDir }),',
          '  limits: { fileSize: 1024 * 1024 },',
          '}))',
          'upload(@UploadedFile() file: { size: number; buffer?: Buffer; path?: string }) {',
          '  return {',
          '    bytes: file?.size,',
          '    inMemory: Buffer.isBuffer(file?.buffer),',
          "    onDisk: typeof file?.path === 'string',",
          '  };',
          '}',
        ]},
        {caption: 'the Spring Boot defaults it replaces', lines: [
          'spring.servlet.multipart.max-file-size=1MB',
          'spring.servlet.multipart.max-request-size=10MB',
          'spring.servlet.multipart.file-size-threshold=0B',
        ]},
      ],
      claims: [
        {text: 'max-file-size default 1MB; max-request-size 10MB; file-size-threshold 0B, "Threshold after which files are written to disk."', source: BOOT},
        {text: 'fileSize: "For multipart forms, the max file size (in bytes)", default Infinity', source: MULTER},
      ],
    },
    {
      id: 'memory',
      title: 'Which counter sees an upload',
      body: ['Multer\'s memory storage pushes every chunk onto a list, then joins them with Buffer.concat, so for a moment the chunks and the joined copy both exist: consistent with 100 MB for a 50 MB file.'],
      code: [{caption: 'multer 2.4.0, storage/memory.js', lines: [
        "file.stream.on('data', function (chunk) {",
        '  chunks.push(chunk)',
        '})',
        "file.stream.on('end', function () {",
        '  var buffer = Buffer.concat(chunks)',
      ]}],
      claims: [
        {text: 'arrayBuffers "refers to memory allocated for ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers."', source: NODE},
        {text: 'heapUsed +0.9 MB, arrayBuffers +100.0 MB, rss +97.5 MB for one 50 MB upload', source: RUN},
      ],
    },
    {
      id: 'downloads',
      title: 'Stream downloads rather than buffer them',
      body: ['A buffered response holds the whole file for as long as it is being sent, once per concurrent download. A streamed one passes chunks through. A plain memory reading shows about 30 MB for streaming; most of that is spent chunks the collector has not swept yet.'],
      code: [{caption: 'the two routes', lines: [
        "@Get('buffered')",
        'async buffered() {',
        '  return new StreamableFile(await readFile(file));',
        '}',
        '',
        "@Get('streamed')",
        'streamed() {',
        '  return new StreamableFile(createReadStream(file));',
        '}',
      ]}],
      claims: [{text: 'Four concurrent 200 MB downloads: buffered peak 800.3 MB, streamed 32.8 MB; with GC forced every 20 ms and the client at 40 MB/s, buffered 800.1 MB, streamed 6.2 to 7.7 MB over six runs', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, September 2026: Node 22, NestJS 12, Multer 2.4, Spring Boot 4.1.',

  checklist: {
    title: 'Before you ship an upload endpoint in NestJS',
    items: [
      'Set limits.fileSize on every FileInterceptor',
      'Choose a storage: diskStorage, or memory only for small bounded files',
      'Do not treat diskStorage as a limit',
      'Watch arrayBuffers and rss, not only heapUsed',
      'Stream downloads with createReadStream and StreamableFile',
      'On Fastify, check its own multipart limits instead',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-uploads.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'NestJS: file upload', url: 'https://docs.nestjs.com/techniques/file-upload'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. This is an independent, unofficial guide produced by Code with Sam, ' +
    'not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
