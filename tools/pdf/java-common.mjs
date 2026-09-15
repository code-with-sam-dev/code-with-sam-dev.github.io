/**
 * What every Modern Java sheet shares.
 *
 * Same reasoning as kafka-common.mjs: the link block went out with two entries
 * missing once, because it was retyped rather than referenced. It is written
 * once here.
 *
 * The video URL is deliberately NOT here. It differs per sheet and it is the
 * one field a reader actually clicks, so a missing value has to be obvious.
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

/**
 * Companion repositories that ACTUALLY EXIST on GitHub today.
 *
 * This list is the fix for a link that shipped broken. The Modern Java sheet
 * went out linking to code-with-sam-dev/modern-java/tree/main/src, which has
 * never existed: the repo is written but unpublished, because its Docker path
 * has never been built and this channel does not claim what it has not run.
 *
 * So a sheet asks for a repo link and gets one only if the repo is published.
 * Add a name here on the day it goes public, not on the day it is written.
 */
const PUBLISHED_REPOS = new Set(['kafka-payments']);

/**
 * The runnable code link, or NOTHING.
 *
 * Returns null for an unpublished repo, and every sheet filters nulls out of
 * its link block. A missing link costs a reader one click of curiosity. A link
 * that 404s costs the channel its credibility, which is the entire product.
 */
export const repoLink = (repo) =>
  PUBLISHED_REPOS.has(repo)
    ? {label: 'Runnable code', url: `https://github.com/code-with-sam-dev/${repo}`}
    : null;

export const ORACLE_TRADEMARK =
  'Java and OpenJDK are trademarks or registered trademarks of Oracle and/or its ' +
  'affiliates. Eclipse Temurin is a trademark of the Eclipse Foundation. They appear ' +
  'here only to identify the technology being discussed. Nothing here implies ' +
  'endorsement by, or affiliation with, any of them.';

export const CLOSING =
  'If this was useful, a like and a subscribe help more than you would think. ' +
  'And tell me in the comments which of these you have actually shipped.';

/**
 * A VERSION SHEET GOES STALE FASTER THAN ANY OTHER KIND, which is why every
 * claim here carries a source and the page carries a date.
 */
export const PERISHABLE_NOTE =
  'Every version and availability claim on this sheet is stated as at September 2026 ' +
  'and was checked against the OpenJDK JEP index on the day it was built. A feature ' +
  'that was preview then may be final by the time you read this. The dates are the ' +
  'point of the page, not decoration.';

export const SRC = {
  JEP: 'OpenJDK JEP index, checked September 2026',
  JEP_444: 'JEP 444, Virtual Threads',
  JEP_361: 'JEP 361, Switch Expressions',
  JEP_395: 'JEP 395, Records',
  JEP_378: 'JEP 378, Text Blocks',
  JEP_286: 'JEP 286, Local-Variable Type Inference',
  JEP_394: 'JEP 394, Pattern Matching for instanceof',
  JEP_409: 'JEP 409, Sealed Classes',
  JEP_440: 'JEP 440, Record Patterns',
  JEP_431: 'JEP 431, Sequenced Collections',
  JEP_485: 'JEP 485, Stream Gatherers',
  JEP_506: 'JEP 506, Scoped Values',
  JEP_512: 'JEP 512, Compact Source Files and Instance Main Methods',
  JEP_511: 'JEP 511, Module Import Declarations',
  JEP_513: 'JEP 513, Flexible Constructor Bodies',
  JEP_321: 'JEP 321, HTTP Client',
  JEP_517: 'JEP 517, HTTP/3 for the HTTP Client API',
  JEP_454: 'JEP 454, Foreign Function and Memory API',
  JEP_519: 'JEP 519, Compact Object Headers',
  MEASURED: 'Measured on the machine that built this sheet, not quoted',
  COMPILER: 'The compiler itself, on the release named',
};
