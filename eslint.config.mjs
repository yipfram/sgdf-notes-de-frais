import coreWebVitalsConfig from "eslint-config-next/core-web-vitals";
import typescriptParser from "@typescript-eslint/parser";

const config = [
  {
    ignores: ["docs/.vitepress/cache/**", "docs/.vitepress/dist/**"],
  },
  ...coreWebVitalsConfig,
  {
    settings: {
      react: { version: "19" },
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs,mts,cts}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
];

export default config;
