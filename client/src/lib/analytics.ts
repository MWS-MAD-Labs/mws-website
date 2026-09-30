import { env } from "@/config/env";

const SESSION_KEY = "mws-analytics-session";

let hasSentFirstView = false;

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Random id for this browsing session (tab). Null when storage is blocked. */
function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = randomId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function prefersNotToBeTracked() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

/**
 * Records one public page view for the CMS traffic dashboard. Fire-and-forget:
 * tracking must never slow down or break the page. No cookie is set and the
 * server does not store IP addresses.
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined" || prefersNotToBeTracked()) return;

  const id = sessionId();
  if (!id) return;

  // document.referrer never changes during SPA navigation, so only the first
  // view of the session says where the visitor came from.
  const referrer = hasSentFirstView ? null : document.referrer || null;
  hasSentFirstView = true;

  fetch(`${env.apiBaseUrl}/api/analytics/pageview`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, sessionId: id, referrer }),
  }).catch(() => undefined);
}
