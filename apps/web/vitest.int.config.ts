import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Config des tests d'intégration (Phase 3b) : environnement Node, PostgreSQL requis.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    testTimeout: 60000,
    hookTimeout: 120000,
    // Les tests d'intégration touchent des services partagés (PostgreSQL, index Meili unique) :
    // exécution séquentielle pour un état déterministe.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@payload-config": fileURLToPath(new URL("./src/payload.config.ts", import.meta.url)),
    },
  },
});
