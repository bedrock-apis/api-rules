import globals from "globals";
//import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


import apiRules from "./plugins/the-api-rules/index.mjs";

import pkg from '@typescript-eslint/parser';
const { parser } = pkg;

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["tests/*"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: './tsconfig.json', // Ensure this path is correct
      },
      globals: globals.es2022,
    },
    plugins: {
      "@the-api-rules": apiRules,
    },
    rules: {
      "@the-api-rules/apis-privileges": "error",
    },
  },
  ...tseslint.configs.recommended,
  //pluginJs.configs.recommended
];
