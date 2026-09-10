/**
 * Contact configuration.
 *
 * The email address used to live here as `CONTACT_EMAIL` and was rendered into
 * two pages as a `mailto:` link. It is gone on purpose. A plain address in the
 * markup of a public site is scraped within days, and this is Sam's personal
 * inbox, not a business one.
 *
 * The replacement is a form. The site is static and hosted on GitHub Pages, so
 * there is no server to receive a POST, which means a relay is required.
 *
 * Web3Forms was chosen over the obvious alternatives for one specific reason:
 *
 *   Formsubmit    endpoint is literally https://formsubmit.co/<your email>,
 *                 which puts the address straight back into the HTML. That is
 *                 the exact problem we are solving.
 *   Formspree     hides the address behind a form id, but the free tier caps
 *                 at 50 submissions a month and needs an account.
 *   Web3Forms     hides the address behind an access key, is free with no
 *                 submission cap, and needs no dashboard login.
 *
 * The access key is a public UUID and is meant to be visible in the markup. It
 * is not a secret: it can only ever deliver to the address it was registered
 * against, so leaking it costs nothing.
 *
 * To switch the form on:
 *   1. Go to https://web3forms.com and enter the destination inbox. They mail
 *      back an access key. The address is typed there and never here, which is
 *      the whole point: it stays out of the repository as well as the markup.
 *   2. Paste it below.
 *
 * Until then `CONTACT_FORM_ENABLED` is false and the contact page says plainly
 * that the form is not live yet, rather than rendering a form that silently
 * throws messages away. A form that looks like it works but does not is worse
 * than no form: the sender believes they have reached you.
 */

export const WEB3FORMS_ACCESS_KEY = '';

export const CONTACT_FORM_ENABLED = WEB3FORMS_ACCESS_KEY.length > 0;

/** Where the form posts. Public endpoint, no secret in it. */
export const CONTACT_FORM_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Subject line prefix on the mail that arrives, so channel mail is filterable
 * out of a personal inbox from day one.
 */
export const CONTACT_SUBJECT_PREFIX = '[Code with Sam]';
