/**
 * Channel identity, in one place.
 *
 * The handle is `@CodewithSam-Dev`, not `@CodeWithSam`. The plain one was taken
 * at creation time. Every link on the site reads from here so a future handle
 * change is a single edit rather than a hunt through templates.
 */
export const CHANNEL_HANDLE = '@CodewithSam-Dev';
export const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
export const CHANNEL_ID = 'UCnkxhOh-6OydBuUW2ym6QTQ';

/**
 * Every account the channel owns, in one list.
 *
 * Added 2026-09-11 during a cross-platform link audit. The accounts were created
 * over several days, so anything published early points only at what existed at
 * the time, and several posts link to nothing. Keeping the list here means the
 * site, the footer and any future page all read the same source, and adding an
 * account is one edit.
 *
 * Sam's standing rule: FULL urls with the scheme, never bare hostnames. A bare
 * hostname reads as prose, and on a surface that will not linkify it the reader
 * has to retype what they see.
 */
export interface SocialLink {
  readonly label: string;
  readonly url: string;
  /** Shown under the label. Says what the account is actually for. */
  readonly note: string;
  /** The glyph drawn beside it, see SocialIcon.astro. */
  readonly icon: 'youtube' | 'linkedin' | 'x' | 'tiktok' | 'instagram' | 'facebook' | 'github' | 'coffee' | 'sadza';
  /** A way to support the channel rather than an account to follow. Drawn in
   *  its own stacked section, coffee above sadza, per Sam. */
  readonly support?: boolean;
}

export const SOCIALS: readonly SocialLink[] = [
  {label: 'YouTube', url: CHANNEL_URL, note: 'Every episode, long form', icon: 'youtube'},
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/company/code-with-sam-dev',
    note: 'Write-ups and working notes',
    icon: 'linkedin',
  },
  {label: 'X', url: 'https://x.com/CodeWithSamDev', note: 'Threads and links', icon: 'x'},
  {
    label: 'TikTok',
    url: 'https://www.tiktok.com/@codewithsamdev',
    note: 'Shorts',
    icon: 'tiktok',
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/codewithsamdev',
    note: 'Reels',
    icon: 'instagram',
  },
  {
    // Claimed username rather than the profile.php id, so it can be spoken
    // aloud and typed from memory.
    label: 'Facebook',
    url: 'https://www.facebook.com/codewithsamdev',
    note: 'Reels',
    icon: 'facebook',
  },
  {
    label: 'GitHub',
    url: 'https://github.com/code-with-sam-dev',
    note: 'The code for every episode',
    icon: 'github',
  },
  {
    // Opened 2026-09-23. Listed last and plainly: a support link is an offer,
    // never an ask, and it sits in the same register as the subscribe line.
    label: 'Buy me a coffee',
    url: 'https://buymeacoffee.com/codewithsam',
    note: 'Support Code with Sam',
    icon: 'coffee',
    support: true,
  },
  {
    // Sam's own sadza, directly under the coffee, per his instruction. Its own
    // platform, Buy Me Sadza, which pays out in Zimbabwe.
    label: 'Buy me sadza',
    url: 'https://buymesadza.com/codewithsam',
    note: 'Support Code with Sam',
    icon: 'sadza',
    support: true,
  },
] as const;
