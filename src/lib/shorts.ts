/**
 * The channel's Shorts.
 *
 * Sam, 2026-09-12: "is it possible to put shorts links on the site?", then
 * "I would like to have them in a marquee like so that if they get too many
 * they will be rotating in their own section".
 *
 * The ids and titles were read off the channel's own Shorts page rather than
 * typed from memory, because a wrong id is a dead link that looks alive.
 *
 * NOTE ON THE ORDER. Newest first. The marquee repeats the list to fill the
 * track, so the newest Short is the one a reader sees without waiting.
 */
export type Short = {
  /** YouTube video id. The watch URL is built from this, never stored. */
  id: string;
  /** The title as published, minus the hashtag, which is noise on a page. */
  title: string;
  /** Which episode it came from, so a reader can go and watch the whole thing. */
  from: string;
};

export const SHORTS: Short[] = [
  // Kafka Rebalancing, episode 3. Newest first.
  {
    id: 'KBSz9wxCzRA',
    title: 'Senior Java interview: what is wrong with this loop?',
    from: 'Java gotchas',
  },
  {
    id: 'SbVU6EiJBw4',
    title: 'Static membership does not reserve your partitions',
    from: 'Kafka Rebalancing',
  },
  {
    id: 't3NI1p30b-s',
    title: 'Which rebalance protocol are you actually on?',
    from: 'Kafka Rebalancing',
  },
  {
    id: '0yIv3scYAMY',
    title: 'Your consumer is alive. It got kicked out anyway.',
    from: 'Kafka Rebalancing',
  },
  {
    id: 'wpME6KCRI4g',
    title: 'A rebalance made the payment run twice',
    from: 'Kafka Rebalancing',
  },
  {id: 'mYygHIg4SOs', title: 'Your p95 dashboard is lying to you', from: 'Digital Wallet'},
  {id: 'JpWDt7XTRd4', title: 'Both writes succeeded. The money vanished.', from: 'Digital Wallet'},
  {id: 'K1jAVd3M_l8', title: 'Your API just charged them twice', from: 'Digital Wallet'},
  {id: 'oz6NVmGKbYo', title: 'Why not just create 100 Kafka partitions?', from: 'Kafka Partitions'},
  {id: 'PBLV35JPwA8', title: 'Will more Kafka consumers make it faster?', from: 'Kafka Partitions'},
  {id: 'WeTEdAVIqME', title: 'Four consumers, three partitions. What does the fourth do?', from: 'Kafka Partitions'},
];

export const shortUrl = (s: Short): string => `https://www.youtube.com/shorts/${s.id}`;

/**
 * The poster for a Short, served from THIS domain.
 *
 * Deliberately not i.ytimg.com. Hot-linking YouTube's thumbnail would call
 * Google on every page load, for every visitor, before anyone has asked to
 * watch anything, which would make the privacy policy's "nothing is loaded
 * from YouTube until you press play" untrue. These are committed here instead,
 * so the page stays fast and the promise stays true.
 *
 * From 2026-09-13 they are OUR OWN renders, straight out of Remotion, rather
 * than YouTube's copy of them. Same picture, one less round trip, and it can
 * never drift from the thumbnail actually on the video, because it is the same
 * file that was uploaded.
 */
export const shortPoster = (s: Short): string => `/shorts/${s.id}.jpg`;

/** How long each Short holds before the carousel steps on. Sam's number. */
export const HOLD_MS = 5000;

/**
 * A YouTube id is exactly 11 characters of an unreserved alphabet. Checking
 * the shape here is cheap and catches a truncated paste, which would otherwise
 * ship as a link to nothing.
 */
export const isValidId = (id: string): boolean => /^[A-Za-z0-9_-]{11}$/.test(id);
