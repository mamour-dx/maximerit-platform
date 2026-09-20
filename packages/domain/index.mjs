// Point d'entrée public du package @maximerit/domain.
// La logique reste en JS pur (model.mjs) pour rester testable sans transpilation ;
// les types sont fournis par index.d.ts pour les consommateurs TypeScript (apps/web).
export * from './model.mjs';
