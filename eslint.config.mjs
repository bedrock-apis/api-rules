import globals from "globals";
//import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


import apiRules from "./plugins/the-api-rules/index.mjs";

import parser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["tests/*.ts"],
    languageOptions: {
      parser: {meta: parser.meta, parseForESLint: parser.parseForESLint},
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module", 
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
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
  }
];