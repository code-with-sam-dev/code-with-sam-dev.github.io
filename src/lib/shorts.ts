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
  {id: 'mYygHIg4SOs', title: 'Your p95 dashboard is lying to you', from: 'Digital Wallet'},
  {id: 'JpWDt7XTRd4', title: 'Both writes succeeded. The money vanished.', from: 'Digital Wallet'},
  {id: 'K1jAVd3M_l8', title: 'Your API just charged them twice', from: 'Digital Wallet'},
  {id: 'oz6NVmGKbYo', title: 'Why not just create 100 Kafka partitions?', from: 'Kafka Partitions'},
  {id: 'PBLV35JPwA8', title: 'Will more Kafka consumers make it faster?', from: 'Kafka Partitions'},
  {id: 'WeTEdAVIqME', title: 'Four consumers, three partitions. What does the fourth do?', from: 'Kafka Partitions'},
];

export const shortUrl = (s: Short): string => `https://www.youtube.com/shorts/${s.id}`;

/**
 * A YouTube id is exactly 11 characters of an unreserved alphabet. Checking
 * the shape here is cheap and catches a truncated paste, which would otherwise
 * ship as a link to nothing.
 */
export const isValidId = (id: string): boolean => /^[A-Za-z0-9_-]{11}$/.test(id);
