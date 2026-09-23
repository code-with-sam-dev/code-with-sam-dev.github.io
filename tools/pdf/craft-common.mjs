/**
 * What the craft sheets share. Craft, meaning the episodes that are about how
 * to work rather than about a particular technology.
 *
 * A separate module from java-common and kafka-common for one reason that
 * matters: those two each carry a TRADEMARK notice naming the technology their
 * series is about, and a craft sheet that reused one would be printing a
 * trademark notice for a product it never mentions.
 */

export {CHANNEL_LINKS} from './channel-links.mjs';

/**
 * Companion repositories that ACTUALLY EXIST on GitHub today. See the same
 * list and the same reasoning in java-common.mjs: a sheet gets a runnable code
 * link only if the repo is published, because a link that 404s is worse than
 * no link.
 */
const PUBLISHED_REPOS = new Set(['kafka-payments']);

export const repoLink = (repo) =>
  PUBLISHED_REPOS.has(repo)
    ? {label: 'Runnable code', url: `https://github.com/code-with-sam-dev/${repo}`}
    : null;

export const ATTRIBUTION =
  'Study findings are attributed to their authors and were read at the primary ' +
  'source rather than from a summary. Product and company names appear only to ' +
  'identify what was studied. Nothing here implies endorsement by, or affiliation ' +
  'with, any of them.';

export const CLOSING =
  'If this was useful, a like and a subscribe help more than you would think. ' +
  'And tell me in the comments which of the four your team actually does.';

/**
 * A sheet that quotes research has a second way to go stale: the research
 * itself gets superseded, and at least one study on this page has already been
 * labelled historical by the people who ran it.
 */
export const PERISHABLE_NOTE =
  'Every figure on this sheet was read at the primary source in September 2026 and ' +
  'is quoted with its limitations attached. One of the studies has since been ' +
  'labelled historical by the team that ran it, and this sheet says so where it ' +
  'quotes it. A number without its caveat is not a stronger claim, it is a less ' +
  'honest one.';

export const SRC = {
  WORKDAY: 'Meyer et al., "Today was a Good Day: The Daily Life of Software Developers", IEEE TSE 2019',
  METR: 'METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"',
  GITHUB: 'GitHub, "Does GitHub Copilot improve code quality? Here is what the data says"',
  MEASURED: 'Run on the machine that built this sheet, not quoted',
  PRACTICE: 'Operational practice, not vendor documentation',
};
