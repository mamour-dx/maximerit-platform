"use client";

import { useEffect } from "react";

/** Aligne <html lang> sur la langue de la page (le layout racine est en fr). */
export function SetLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);
  return null;
}
