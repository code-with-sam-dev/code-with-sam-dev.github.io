/**
 * Where the newsletter form posts, if anywhere.
 *
 * WHY THIS EXISTS. The form action was the literal string
 * REPLACE_WITH_KIT_FORM_ENDPOINT, live on six of twelve pages including the
 * homepage. It invited an email address and captured nothing: every reader who
 * tried to subscribe got silence, and the address was gone.
 *
 * A signup that discards addresses is worse than no signup. So the endpoint is
 * configuration now, and the component renders a form ONLY when one exists.
 *
 * LIVE since 2026-09-12. The endpoint below belongs to the Kit form
 * "Code with Sam newsletter", form id 9911205, and was read from that form's
 * own Embed HTML snippet rather than typed from memory.
 *
 * It is hard coded rather than left to the build environment on purpose. The
 * value is public: it ships in the page source of every visitor's browser, so
 * it is not a secret, and putting it here means a fresh clone builds a working
 * form instead of silently building the fallback. KIT_FORM_ENDPOINT still
 * overrides it, which is what a staging build would use to avoid posting test
 * addresses into the real list.
 */
const KIT_FORM = 'https://app.kit.com/forms/9911205/subscriptions';

export const SIGNUP_ENDPOINT: string =
  import.meta.env.KIT_FORM_ENDPOINT ?? KIT_FORM;

export const signupIsLive = (): boolean =>
  SIGNUP_ENDPOINT.startsWith('http');
