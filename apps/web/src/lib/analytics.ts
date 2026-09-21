// Phase 8 — Couche tracking : dataLayer (GTM), consentement RGPD, conservation UTM.
// Aucun événement n'est envoyé avant consentement (bufferisé puis vidé au consentement).
// Le catalogue d'événements ci-dessous MIROITE domain enums.trackingEvents (test de non-dérive).

export const TRACKING_EVENTS = [
  "view_service", "view_mining_page", "view_job",
  "start_application", "submit_application", "upload_cv",
  "start_lead_form", "submit_lead_form",
  "download_guide", "use_tool",
  "click_phone", "click_email", "click_whatsapp",
] as const;
export type TrackingEvent = (typeof TRACKING_EVENTS)[number];

const CONSENT_KEY = "mx_consent"; // 'granted' | 'denied'
const UTM_KEY = "mx_utm";
const UTM_FIELDS = ["source", "medium", "campaign", "term", "content"] as const;

type Params = Record<string, unknown>;
interface DataLayerObject { push: (o: Params) => void }
declare global {
  interface Window { dataLayer?: Params[] }
}

function dataLayer(): DataLayerObject | null {
  if (typeof window === "undefined") return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer as unknown as DataLayerObject;
}

export function getConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

const buffer: Params[] = [];

export function setConsent(value: "granted" | "denied"): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
  if (value === "granted") flush();
  else buffer.length = 0; // refus : on jette les événements en attente
}

function flush(): void {
  const dl = dataLayer();
  if (!dl) return;
  while (buffer.length) dl.push(buffer.shift() as Params);
}

/** Capture les UTM de l'URL une seule fois par session (conservation cross-pages). */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(UTM_KEY)) return;
    const p = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const f of UTM_FIELDS) {
      const v = p.get(`utm_${f}`);
      if (v) utm[f] = v;
    }
    if (Object.keys(utm).length) window.sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    /* ignore */
  }
}

export function getUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Pousse un événement. No-op (bufferisé) tant que le consentement n'est pas accordé. Retourne false si nom inconnu. */
export function pushEvent(name: TrackingEvent, params: Params = {}): boolean {
  if (!TRACKING_EVENTS.includes(name)) {
    if (process.env.NODE_ENV !== "production") console.warn(`[analytics] événement inconnu: ${name}`);
    return false;
  }
  const utm = getUtm();
  const evt: Params = { event: name, ...params, ...(Object.keys(utm).length ? { utm } : {}) };
  if (getConsent() !== "granted") {
    buffer.push(evt);
    return true;
  }
  dataLayer()?.push(evt);
  return true;
}

const fired = new Set<string>();
/** Déclenche un événement au plus une fois par clé (anti double déclenchement). */
export function trackOnce(key: string, name: TrackingEvent, params: Params = {}): boolean {
  if (fired.has(key)) return false;
  fired.add(key);
  return pushEvent(name, params);
}

// Testing helper — réinitialise l'état en mémoire (buffer + dédup).
export function __resetAnalytics(): void {
  buffer.length = 0;
  fired.clear();
}
