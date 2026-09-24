// Section « Localisation » : carte Google Maps intégrée (même fiche que l'actuel maximerit.com,
// avec la fiche « MAXIMERIT » et ses avis). Iframe en lazy-load : aucun coût avant le scroll.

const PLACE_CID = "4078936135536915344"; // fiche Google « MAXIMERIT » (0x389b4acddc2eb390)

// `hl` = langue des libellés de la carte (fr / en), région Sénégal.
const embedUrl = (hl: "fr" | "en") =>
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.928713525113!2d-17.469124824209146!3d14.71662227422422" +
  "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10d5ca365f8ed%3A0x389b4acddc2eb390!2sMAXIMERIT!5e0" +
  `!3m2!1s${hl}!2ssn!4v1694617932613!5m2!1s${hl}!2ssn`;

const COPY = {
  fr: {
    title: "Localisation de Maximerit",
    address: "Sacré Cœur 3 Pyrotechnie, immeuble lot 115 A, côté B.E.M — Dakar",
    open: "Ouvrir dans Google Maps",
    iframeTitle: "Carte : localisation de Maximerit à Dakar",
  },
  en: {
    title: "Find us in Dakar",
    address: "Sacré Cœur 3 Pyrotechnie, building lot 115 A, next to B.E.M — Dakar",
    open: "Open in Google Maps",
    iframeTitle: "Map: Maximerit's location in Dakar",
  },
} as const;

export function LocationMap({ lang = "fr" }: { lang?: "fr" | "en" }) {
  const t = COPY[lang];
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-10 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h2>
        <span className="mx-auto mt-3 block h-1 w-16 rounded bg-brand" />
        <p className="mt-4 text-muted">{t.address}</p>
        <a
          href={`https://www.google.com/maps?cid=${PLACE_CID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
        >
          {t.open} ↗
        </a>
      </div>
      <iframe
        src={embedUrl(lang)}
        title={t.iframeTitle}
        className="block h-[360px] w-full border-0 sm:h-[450px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </section>
  );
}
