"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { captureUtm, getConsent, setConsent } from "@/lib/analytics";

const GTM = process.env.NEXT_PUBLIC_GTM_ID;
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;

export function AnalyticsProvider() {
  const [consent, setC] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    // Lecture client-only après montage (évite tout mismatch d'hydratation SSR).
    captureUtm();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setC(getConsent());
  }, []);

  function decide(v: "granted" | "denied") {
    setConsent(v);
    setC(v);
  }

  return (
    <>
      {consent === "granted" && GTM && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}
        </Script>
      )}
      {consent === "granted" && GA4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');`}
          </Script>
        </>
      )}
      {consent === null && (
        <div role="dialog" aria-label="Consentement cookies" className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background p-4 shadow-lg">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Nous utilisons des cookies de mesure d&apos;audience pour améliorer le site. Aucune mesure n&apos;est effectuée avant votre accord.
            </p>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => decide("denied")} className="rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium">Refuser</button>
              <button onClick={() => decide("granted")} className="rounded-[var(--radius)] bg-brand px-4 py-2 text-sm font-semibold text-white">Accepter</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
