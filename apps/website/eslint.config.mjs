import { nextConfig } from "@genai/config/eslint/next";

export default [
  ...nextConfig,
  {
    rules: {
      // Disable React 19 Compiler rules that break existing patterns
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
    },
  },
];
