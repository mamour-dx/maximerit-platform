// Références clients affichées dans la section « Ils nous font confiance ».
// Logos dans public/clients/<slug>.png (rognés automatiquement). `h` = hauteur d'affichage en px,
// réglée par logo pour un poids visuel homogène (logos carrés plus hauts, logos larges plus bas).

export interface ClientLogo {
  slug: string;
  name: string;
  width: number;
  height: number;
  h: number;
}

export const CLIENT_LOGOS: ClientLogo[] = [
  { slug: "senelec", name: "Senelec", width: 190, height: 120, h: 52 },
  { slug: "sgs", name: "SGS", width: 113, height: 54, h: 38 },
  { slug: "bmn", name: "BMN", width: 192, height: 122, h: 50 },
  { slug: "colas", name: "Colas", width: 578, height: 188, h: 40 },
  { slug: "bp", name: "bp", width: 91, height: 121, h: 56 },
  { slug: "wadic", name: "WADIC — West Africa Distribution and Consultancy", width: 187, height: 122, h: 56 },
  { slug: "ascoma", name: "Ascoma", width: 144, height: 87, h: 42 },
  { slug: "cfe-ingenierie", name: "CFE Ingénierie", width: 165, height: 72, h: 42 },
  { slug: "global-view-africa", name: "Global View Africa", width: 493, height: 106, h: 34 },
];
