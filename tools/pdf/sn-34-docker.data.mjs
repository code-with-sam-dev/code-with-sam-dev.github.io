/**
 * Spring to Node design sheet, episode 35 in the course list: Docker for both stacks.
 *
 * EVERY FIGURE HERE WAS RUN, on 2026-10-01, by `scripts/verify-docker.sh` in the course repository:
 * real builds from a scratch copy of each app, the build cache pruned first. Docker 29.8.1.
 */
import {CHANNEL_LINKS, CLOSING} from './claude-code-common.mjs';

const RUN = 'Run on a real machine, 2026-10-01, by scripts/verify-docker.sh in the course repository.';

export const sheet = {
  channel: 'Code with Sam',
  video: {url: 'https://www.youtube.com/@CodewithSam-Dev', label: 'Watch on YouTube'},
  siteUrl: 'https://code-with-sam-dev.github.io',
  title: '385 MB to change one line.',
  subtitle: 'Spring Boot to NestJS, episode 35: Docker for both stacks',
  kicker: 'For Java developers moving to NestJS',
  strapline: 'An image is a build artifact with defaults of its own: what enters the build, what rebuilds, what reaches production, and who runs it.',
  verifiedOn: '2026-10-01',

  intro: [
    'With no .dockerignore, the Nest builder received 385 MB of context, and five macOS packages landed inside the Linux build stage.',
    'A bare node_modules line only matches the top level: 40 MB were left. Matching it at any depth: 2 MB.',
    'Both course images ran as root until a USER line changed it.',
  ],

  scope: {
    inTitle: 'In scope',
    in: ['.dockerignore', 'Multi-stage builds', 'Layer order and layered jars', 'A non-root user'],
    outTitle: 'Not in scope',
    out: ['Signals and graceful shutdown (episode 38)', 'Image signing and scanning'],
    note: 'Sizes are uncompressed local image sizes on this machine.',
  },

  scale: {
    title: 'The measurements',
    note: 'Real builds, the build cache pruned first.',
    rows: [
      ['NEST CONTEXT, NO .dockerignore', '385 MB'],
      ['NEST CONTEXT, **/node_modules', '2 MB'],
      ['NEST, ONE STAGE / MULTI-STAGE', '1642 MB / 379 MB'],
      ['SPRING, MAVEN IMAGE / JRE', '707 MB / 283 MB'],
      ['ONE LINE, COPY . . BEFORE npm ci', '73 s'],
      ['ONE LINE, PACKAGE FILES FIRST', '13 s'],
      ['SPRING FAT JAR / LAYERED', '58.5 MB / 30.2 kB changed'],
    ],
  },

  sections: [
    {
      id: 'nest',
      title: 'The Nest image',
      body: ['Ignore node_modules at any depth, install from the package files before copying source, ship only production dependencies, and run as the node user.'],
      code: [{caption: '.dockerignore', lines: ['**/node_modules', 'dist', 'coverage', '.git', '*.log', '*.tsbuildinfo', '.env*']}, {caption: 'Dockerfile', lines: [
        'FROM node:24.21.0-alpine AS build',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci',
        'COPY . .',
        'RUN npm run build',
        '',
        'FROM node:24.21.0-alpine',
        'WORKDIR /app',
        'COPY package*.json ./',
        'RUN npm ci --omit=dev',
        'COPY --from=build /app/dist ./dist',
        'USER node',
        'CMD ["node", "dist/main.js"]',
      ]}],
      claims: [{text: 'after: uid 1000, GET /health 200', source: RUN}],
    },
    {
      id: 'spring',
      title: 'The Spring image',
      body: ['Extract the jar into Spring Boot\'s layers so a code change replaces the application layer only, and create a user to run as.'],
      code: [{caption: 'Dockerfile, the runtime stage', lines: [
        'FROM eclipse-temurin:25-jre-alpine',
        'RUN addgroup -S app && adduser -S app -G app',
        'WORKDIR /app',
        'COPY --from=build /app/extracted/dependencies/ ./',
        'COPY --from=build /app/extracted/spring-boot-loader/ ./',
        'COPY --from=build /app/extracted/snapshot-dependencies/ ./',
        'COPY --from=build /app/extracted/application/ ./',
        'USER app',
        'ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]',
      ]}],
      claims: [{text: 'one line changed: the application layer 30.2 kB, against 58.5 MB for the fat jar', source: RUN}],
    },
  ],

  scaleNote: 'At the time of recording, October 2026: Node 24.21, Temurin 25, Docker 29.8.',

  checklist: {
    title: 'Before you ship an image',
    items: [
      'What does the builder receive as context?',
      'Do build tools or devDependencies reach the runtime image?',
      'Does a one-line change reinstall dependencies?',
      'Which layer changes when code changes?',
      'Which user does the process run as?',
    ],
  },

  links: [
    ...CHANNEL_LINKS,
    {label: 'Every measurement, one command: scripts/verify-docker.sh', url: 'https://github.com/code-with-sam-dev/spring-to-node'},
    {label: 'Docker build context', url: 'https://docs.docker.com/build/concepts/context/'},
  ],
  trademarks:
    'Spring is a trademark of Broadcom. Java is a trademark of Oracle. Node.js is a trademark ' +
    'of the OpenJS Foundation. Docker is a trademark of Docker, Inc. This is an independent, unofficial ' +
    'guide produced by Code with Sam, not affiliated with or endorsed by any of them.',
  closing: CLOSING,
};
