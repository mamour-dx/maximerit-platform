import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Maximerit — Recrutement & talents en Afrique de l'Ouest",
    template: "%s · Maximerit",
  },
  description:
    "Cabinet de recrutement, executive search et vivier de talents en Afrique de l'Ouest, spécialisé Mines & Ressources naturelles.",
  metadataBase: new URL("https://www.maximerit.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
