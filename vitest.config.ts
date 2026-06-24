import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/_tests_/**/*.{test,spec}.{ts,tsx,js,jsx}"],
    passWithNoTests: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
