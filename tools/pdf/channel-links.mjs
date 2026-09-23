/**
 * Every link a design sheet ends with, in ONE place.
 *
 * There were five copies of this list, one per series common module, and on
 * 2026-09-23 adding the support links to one of them reached 25 of 42 sheets.
 * The other 17 carried the old list silently. So every common module now
 * re-exports this, and a link added here reaches every sheet on the next build.
 */
export const CHANNEL_LINKS = [
  {label: 'Site', url: 'https://code-with-sam-dev.github.io'},
  {label: 'YouTube', url: 'https://www.youtube.com/@CodewithSam-Dev'},
  {label: 'LinkedIn', url: 'https://www.linkedin.com/company/code-with-sam-dev'},
  {label: 'X', url: 'https://x.com/CodeWithSamDev'},
  {label: 'TikTok', url: 'https://www.tiktok.com/@codewithsamdev'},
  {label: 'Instagram', url: 'https://www.instagram.com/codewithsamdev'},
  {label: 'Facebook', url: 'https://www.facebook.com/codewithsamdev'},
  {label: 'GitHub', url: 'https://github.com/code-with-sam-dev'},
  // Support, coffee above sadza, per Sam 2026-09-23. One page, two ways to
  // say thanks. Last, because a support link is an offer, never the headline.
  {label: '☕ Buy me a coffee', url: 'https://buymeacoffee.com/codewithsam'},
  {label: 'Buy me sadza', url: 'https://buymesadza.com/codewithsam'},
];
