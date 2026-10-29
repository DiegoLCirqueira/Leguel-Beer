import base from "@leguele/config/eslint";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [...base, ...nextVitals];

export default config;
