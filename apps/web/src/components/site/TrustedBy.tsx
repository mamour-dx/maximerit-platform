import Image from "next/image";
import Link from "next/link";
import { CLIENT_LOGOS, type ClientLogo } from "@/lib/clients";

// Section « Ils nous font confiance » : un bandeau de logos qui défile en continu
// (CSS pur, cf. .marquee dans globals.css). La piste = 4 copies de la liste ; l'animation
// translate de -50 % (2 copies) pour une boucle sans couture. Copies dupliquées masquées aux
// lecteurs d'écran ; en prefers-reduced-motion, la 1re copie devient une grille statique.

const COPY = {
  fr: {
    eyebrow: "Ils nous font confiance",
    title: "Des références qui nous engagent",
    intro: "Groupes internationaux et acteurs majeurs de la région nous confient le recrutement de leurs talents.",
    region: "Logos de nos clients",
    cta: "Rejoindre nos clients",
    ctaHref: "/contact/",
  },
  en: {
    eyebrow: "They trust us",
    title: "References we're proud of",
    intro: "International groups and leading regional players trust us to recruit their talent.",
    region: "Our clients' logos",
    cta: "Join our clients",
    ctaHref: "/en/contact/",
  },
} as const;

const COPIES = 4;

function Tile({ logo }: { logo: ClientLogo }) {
  return (
    <div className="client-tile flex h-24 min-w-40 items-center justify-center rounded-[var(--radius)] border border-border bg-background px-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Image
        src={`/clients/${logo.slug}.png`}
        alt={logo.name}
        title={logo.name}
        width={logo.width}
        height={logo.height}
        className="w-auto max-w-[180px] object-contain"
        style={{ height: logo.h }}
      />
    </div>
  );
}

function Row({ logos, duration, label }: { logos: ClientLogo[]; duration: number; label: string }) {
  return (
    <div className="marquee" role="region" aria-label={label}>
      <ul className="marquee-track" style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}>
        {Array.from({ length: COPIES }, (_, copy) =>
          logos.map((logo) => (
            <li key={`${copy}-${logo.slug}`} className="px-2" data-dup={copy > 0 || undefined} aria-hidden={copy > 0 || undefined}>
              <Tile logo={logo} />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

export function TrustedBy({ lang = "fr" }: { lang?: "fr" | "en" }) {
  const t = COPY[lang];

  return (
    <section className="overflow-hidden border-b border-border bg-surface py-16">
      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">{t.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{t.title}</h2>
        <span className="mx-auto mt-3 block h-1 w-16 rounded bg-brand" />
        <p className="mx-auto mt-4 max-w-2xl text-muted">{t.intro}</p>
      </div>

      <div className="mt-10">
        <Row logos={CLIENT_LOGOS} duration={48} label={t.region} />
      </div>

      <div className="mt-10 text-center">
        <Link href={t.ctaHref} className="text-sm font-semibold text-brand hover:underline">
          {t.cta} →
        </Link>
      </div>
    </section>
  );
}
