import base from "@leguele/config/eslint";

export default [
  ...base,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: { globals: { process: "readonly", console: "readonly" } },
  },
];
