/** Lien « Voir le site » en bas du menu latéral : ouvre le site public dans un nouvel onglet. */
export function ViewSite() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        margin: "12px 0 0",
        padding: "8px 0",
        color: "var(--theme-text)",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      ↗ Voir le site
    </a>
  );
}
