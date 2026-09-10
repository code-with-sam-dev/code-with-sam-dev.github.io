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

/**
 * Business contact. Currently the personal address; swap to a dedicated
 * one (hello@codewithsam.com) as soon as the domain is bought, so sponsor mail
 * and personal mail are not the same inbox.
 */
export const CONTACT_EMAIL = 'nyabangasamson@gmail.com';
