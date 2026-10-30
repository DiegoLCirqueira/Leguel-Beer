import base from "@leguele/config/eslint";
import nextVitals from "eslint-config-next/core-web-vitals";

const hardcodedColor = "/#[0-9a-fA-F]{3,8}|rgba?[(]|hsla?[(]/";

const config = [
  ...base,
  ...nextVitals,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=${hardcodedColor}]`,
          message: "Cor fixa no componente: use um token de cor (definido em globals.css).",
        },
        {
          selector: `TemplateElement[value.raw=${hardcodedColor}]`,
          message: "Cor fixa no componente: use um token de cor (definido em globals.css).",
        },
      ],
    },
  },
];

export default config;
