/**
 * Pictogramme Maximerit (en-tête de l'admin, menu replié, onglet du navigateur).
 * Comme l'icône native de Payload, il se met à l'échelle de son conteneur (100 %) : une taille fixe
 * serait rognée par le conteneur de l'en-tête.
 */
export function Icon() {
  return (
    <svg className="graphic-icon" width="100%" height="100%" viewBox="0 0 32 32" role="img" aria-label="Maximerit" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="7" fill="#e2001a" />
      <path d="M7 24V8h3.2l5.8 9.2L21.8 8H25v16h-3.4V14.1l-5.1 8h-1l-5.1-8V24H7Z" fill="#fff" />
    </svg>
  );
}
