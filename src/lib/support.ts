/**
 * Support and sponsorship configuration.
 *
 * `DONATION_METHODS` stayed empty until 2026-09-23 because Stripe does not
 * support Zimbabwe as a merchant country, which ruled out the Stripe payout
 * routes. The Buy Me a Coffee account Sam opened that day is set up in South
 * Africa, which settles it. A dead donate button is worse than none, which is
 * why the list only ever holds links that are live and paying out.
 *
 * To switch it on, add one entry and nothing else has to change.
 */
export type DonationMethod = {
  name: string;
  url: string;
  /** One line on what the viewer is actually doing by clicking. */
  note: string;
  /** Which picture sits on the button. */
  icon: 'coffee' | 'sadza';
};

/*
 * OPENED 2026-09-23. Sam set up https://buymeacoffee.com/codewithsam and asked
 * for it big and first on the support page, coffee above sadza. Both go to the
 * same page: two ways to say thanks, one account.
 */
export const DONATION_METHODS: DonationMethod[] = [
  {
    name: 'Buy me a coffee',
    url: 'https://buymeacoffee.com/codewithsam',
    note: 'Support Code with Sam',
    icon: 'coffee',
  },
  {
    name: 'Buy me sadza',
    url: 'https://buymeacoffee.com/codewithsam',
    note: 'Support Code with Sam',
    icon: 'sadza',
  },
];

/*
 * `CONTACT_EMAIL` used to live here and was rendered into two pages as a
 * `mailto:` link. It was removed on 2026-09-11: a plain address in the markup
 * of a public site is scraped within days, and that is a personal inbox. Every
 * route to it now goes through the contact form. See lib/contact.ts.
 *
 * Do not add an address back. If a dedicated business one is ever wanted, point
 * the form's access key at it instead, which keeps it out of the HTML.
 */
