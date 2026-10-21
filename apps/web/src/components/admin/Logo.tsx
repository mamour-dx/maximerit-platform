import Image from "next/image";

/** Logo Maximerit affiché sur la page de connexion de l'espace d'administration. */
export function Logo() {
  return <Image src="/maximerit-logo.png" alt="Maximerit" width={246} height={46} priority style={{ height: 46, width: "auto", maxWidth: "100%" }} />;
}
