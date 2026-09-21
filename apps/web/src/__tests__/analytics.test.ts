import { beforeEach, describe, it, expect } from "vitest";
import {
  pushEvent, trackOnce, setConsent, captureUtm, getUtm, TRACKING_EVENTS, __resetAnalytics,
  type TrackingEvent,
} from "@/lib/analytics";
import { enums } from "@maximerit/domain";

function dl() {
  return (window.dataLayer ?? []) as Record<string, unknown>[];
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.dataLayer = [];
  window.history.replaceState({}, "", "/");
  __resetAnalytics();
});

describe("catalogue d'événements", () => {
  it("miroite domain enums.trackingEvents (pas de dérive)", () => {
    expect([...TRACKING_EVENTS].sort()).toEqual([...(enums.trackingEvents as string[])].sort());
  });
});

describe("consentement (RGPD)", () => {
  it("ne pousse rien avant consentement (bufferisé)", () => {
    pushEvent("use_tool", { tool: "x" });
    expect(dl().length).toBe(0);
  });
  it("vide le buffer quand le consentement est accordé", () => {
    pushEvent("use_tool", { tool: "x" });
    setConsent("granted");
    expect(dl().length).toBe(1);
    expect(dl()[0].event).toBe("use_tool");
  });
  it("le refus jette les événements en attente", () => {
    pushEvent("use_tool", {});
    setConsent("denied");
    expect(dl().length).toBe(0);
  });
  it("après accord, pousse directement", () => {
    setConsent("granted");
    pushEvent("view_job", { slug: "a" });
    expect(dl().length).toBe(1);
  });
});

describe("validation & anti double déclenchement", () => {
  it("rejette un événement hors catalogue", () => {
    expect(pushEvent("nope" as TrackingEvent)).toBe(false);
  });
  it("trackOnce ne déclenche qu'une seule fois par clé", () => {
    setConsent("granted");
    expect(trackOnce("k", "submit_lead_form", {})).toBe(true);
    expect(trackOnce("k", "submit_lead_form", {})).toBe(false);
    expect(dl().length).toBe(1);
  });
});

describe("UTM", () => {
  it("capture les UTM de l'URL et les conserve", () => {
    window.history.replaceState({}, "", "/?utm_source=google&utm_medium=cpc");
    captureUtm();
    expect(getUtm()).toEqual({ source: "google", medium: "cpc" });
  });
  it("attache les UTM aux événements", () => {
    window.sessionStorage.setItem("mx_utm", JSON.stringify({ source: "linkedin" }));
    setConsent("granted");
    pushEvent("submit_lead_form", { source: "contact" });
    expect(dl()[0].utm).toEqual({ source: "linkedin" });
  });
});
