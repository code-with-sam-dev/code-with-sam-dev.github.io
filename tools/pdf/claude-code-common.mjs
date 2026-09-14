/**
 * What every Claude Code sheet shares.
 *
 * Same reasoning as kafka-common.mjs: the link block shipped wrong once because
 * it was retyped rather than referenced, and seventeen sheets retyping it is
 * seventeen chances to drop one.
 *
 * THE SOURCE LABELS MATTER MORE HERE THAN THEY DID FOR KAFKA. This subject
 * moves fast: half the pages cited below changed this year. Every claim on a
 * Claude Code sheet is dated, and the sheet says which day it was verified, so
 * a re-check is a re-fetch rather than a re-research.
 */

export const CHANNEL_LINKS = [
  {label: 'Site', url: 'https://code-with-sam-dev.github.io'},
  {label: 'YouTube', url: 'https://www.youtube.com/@CodewithSam-Dev'},
  {label: 'LinkedIn', url: 'https://www.linkedin.com/company/code-with-sam-dev'},
  {label: 'X', url: 'https://x.com/CodeWithSamDev'},
  {label: 'TikTok', url: 'https://www.tiktok.com/@codewithsamdev'},
  {label: 'Instagram', url: 'https://www.instagram.com/codewithsamdev'},
  {label: 'GitHub', url: 'https://github.com/code-with-sam-dev'},
];

/** The documentation page a reader should go to next, per sheet. */
export const docsLink = (path, label) => ({
  label: label ?? 'Official docs',
  url: `https://code.claude.com/docs/en/${path}`,
});

export const ANTHROPIC_TRADEMARK =
  'Claude and Claude Code are products of Anthropic. This is an independent, ' +
  'unofficial guide produced by Code with Sam. It is not affiliated with, ' +
  'endorsed by, or sponsored by Anthropic, and no Anthropic artwork is ' +
  'reproduced here. Product names appear only to identify the software being ' +
  'discussed. Other names are the property of their respective owners.';

export const CLOSING =
  'If this was useful, a like and a subscribe help more than you would think. ' +
  'And tell me in the comments which part of your workflow you want taken apart next.';

/**
 * Source labels.
 *
 * Every one names a page on the official documentation, or says plainly that
 * it is a judgement rather than a documented fact. There is no third category.
 */
export const SRC = {
  OVERVIEW: 'Claude Code docs, Overview, checked September 2026',
  HOW: 'Claude Code docs, How Claude Code works, checked September 2026',
  MEMORY: 'Claude Code docs, Memory and CLAUDE.md, checked September 2026',
  SESSIONS: 'Claude Code docs, Manage sessions, checked September 2026',
  PERMISSIONS: 'Claude Code docs, Permission modes, checked September 2026',
  CHECKPOINTS: 'Claude Code docs, Checkpointing, checked September 2026',
  MODELS: 'Claude Code docs, Model configuration, checked September 2026',
  SKILLS: 'Claude Code docs, Skills, checked September 2026',
  MCP: 'Claude Code docs, MCP, checked September 2026',
  SUBAGENTS: 'Claude Code docs, Subagents, checked September 2026',
  WORKFLOWS: 'Claude Code docs, Dynamic workflows, checked September 2026',
  HOOKS: 'Claude Code docs, Hooks, checked September 2026',
  BEST: 'Claude Code docs, Best practices, checked September 2026',
  SCHEDULED: 'Claude Code docs, Scheduled tasks, checked September 2026',
  ROUTINES: 'Claude Code docs, Routines, checked September 2026',
  CHROME: 'Claude Code docs, Chrome, checked September 2026',
  COMPUTER: 'Claude Code docs, Computer use, checked September 2026',
  REMOTE: 'Claude Code docs, Remote Control, checked September 2026',
  DESKTOP: 'Claude Code docs, Claude Code on desktop, checked September 2026',
  WEB: 'Claude Code docs, Claude Code on the web, checked September 2026',
  CHANNELS: 'Claude Code docs, Channels, checked September 2026',
  MOBILE: 'Claude Code docs, Claude Code on mobile, checked September 2026',
  GATEWAY: 'Claude Code docs, LLM gateways, checked September 2026',
  COSTS: 'Claude Code docs, Manage costs effectively, checked September 2026',
  CACHING: 'Claude Code docs, Prompt caching, checked September 2026',
  GOAL: 'Claude Code docs, Goal, checked September 2026',
  PRICING: 'claude.com pricing and Claude Help Center, checked September 2026',
  CERTS: 'claude.com certification announcement and Partner Academy, checked September 2026',
  FIRST: 'First principles, not vendor documentation',
  OPERATIONAL: 'Operational practice, not vendor documentation',
};

/**
 * The line every Claude Code sheet carries, because this subject rots faster
 * than Kafka did and a sheet outlives the release it was written against.
 */
export const PERISHABLE_NOTE =
  'Claude Code changes with every release. Every figure, default and feature ' +
  'name on this sheet was checked on the date below and is stated as of that ' +
  'date. Check the current documentation before you rely on any of it.';
