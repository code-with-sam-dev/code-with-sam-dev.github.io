/**
 * Support and sponsorship configuration.
 *
 * `DONATION_METHODS` is deliberately empty. Zimbabwe is not a supported
 * merchant country for Stripe, which rules out GitHub Sponsors and the Stripe
 * path on Ko-fi and Buy Me a Coffee, so no rail has been confirmed yet. The
 * support page renders the free ways to help regardless, and the money section
 * only appears once a real, tested link is added here. A dead donate button is
 * worse than none: it costs trust from exactly the people who wanted to give.
 *
 * To switch it on, add one entry and nothing else has to change.
 */
export type DonationMethod = {
  name: string;
  url: string;
  /** One line on what the viewer is actually doing by clicking. */
  note: string;
};

export const DONATION_METHODS: DonationMethod[] = [];

/*
 * `CONTACT_EMAIL` used to live here and was rendered into two pages as a
 * `mailto:` link. It was removed on 2026-09-11: a plain address in the markup
 * of a public site is scraped within days, and that is a personal inbox. Every
 * route to it now goes through the contact form. See lib/contact.ts.
 *
 * Do not add an address back. If a dedicated business one is ever wanted, point
 * the form's access key at it instead, which keeps it out of the HTML.
 */
