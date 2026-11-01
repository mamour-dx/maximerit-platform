"use client";
// Widget Cloudflare Turnstile (captcha), chargé uniquement sur les formulaires qui l'affichent.
// Sans clé de site (NEXT_PUBLIC_TURNSTILE_SITE_KEY), rien n'est rendu : le serveur ne l'exige alors pas non plus.
// Pour obtenir un nouveau jeton (un jeton ne sert qu'une fois), le parent remonte le composant via `key`.
import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const captchaOnPage = TURNSTILE_SITE_KEY !== "";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loader: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loader ??= new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
    s.onerror = () => {
      loader = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export function Turnstile({ onToken, lang = "fr", action }: { onToken: (token: string | null) => void; lang?: "fr" | "en"; action?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!captchaOnPage || !box.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then((ts) => {
        if (cancelled || !box.current) return;
        id = ts.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: lang,
          size: "flexible",
          ...(action ? { action } : {}),
          callback: (token: string) => cb.current(token),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [lang, action]);

  if (!captchaOnPage) return null;
  return <div ref={box} className="min-h-[65px]" data-testid="turnstile" />;
}
