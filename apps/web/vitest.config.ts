import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Les tests d'intégration (*.int.test.ts) nécessitent PostgreSQL : exclus du run unitaire.
    exclude: [...configDefaults.exclude, "**/*.int.test.*"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@payload-config": fileURLToPath(new URL("./src/payload.config.ts", import.meta.url)),
    },
  },
});
