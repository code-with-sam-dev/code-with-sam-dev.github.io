/**
 * What the Codex sheets share.
 *
 * A module of its own rather than reusing craft-common, for the same reason
 * java-common and kafka-common are separate: this one carries a TRADEMARK
 * notice naming a specific company's products, and a sheet that borrowed it
 * would be printing a notice for a product it never mentions.
 */

export {CHANNEL_LINKS} from './channel-links.mjs';

export const OPENAI_TRADEMARK =
  'ChatGPT and Codex are products of OpenAI. This is an independent, unofficial ' +
  'guide produced by Code with Sam. It is not affiliated with, endorsed by, or ' +
  'sponsored by OpenAI, and no OpenAI artwork is reproduced here. Product names ' +
  'appear only to identify the software being discussed. Java is a trademark of ' +
  'Oracle and/or its affiliates. Other names are the property of their ' +
  'respective owners.';

export const CLOSING =
  'If this was useful, a like and a subscribe help more than you would think. ' +
  'And tell me in the comments which review it got wrong for you.';

/**
 * A SHEET ABOUT PRODUCT SURFACE GOES STALE FASTEST OF ALL, which is why every
 * claim carries a source and the page carries a date.
 */
export const PERISHABLE_NOTE =
  'Every product claim on this sheet was read from the vendor documentation in ' +
  'September 2026 and is stated as at that date. This is product surface that ' +
  'moves in months, so the date is the point of the page rather than decoration.';

/** Source labels. Each names a primary document, or says plainly it is judgement. */
export const SRC = {
  MANUAL: 'Codex manual, retrieved in full and grepped, September 2026',
  APPROVALS: 'Agent approvals and security documentation, September 2026',
  HELP_MODES: 'Help centre, ChatGPT Work and Codex, September 2026',
  HELP_DESKTOP: 'Help centre, the new desktop app, September 2026',
  MEASURED: 'Run against real Java on the machine that built this sheet',
  FIRST: 'First principles, not vendor documentation',
  PRACTICE: 'Engineering practice, not vendor documentation',
};
