import type {Linter} from "eslint";
//@ts-ignore
import parser from '@typescript-eslint/parser';
// Privilege rule
import privileges from "./rules/api-privileges";
import globals from "globals";
// This is base export for our plugin
export const plugin = {
    rules:{
        "apis-privileges": privileges
    }
};
export default plugin;
export const recommended: Linter.Config = ({
    languageOptions: {
      parser: {meta: parser.meta, parseForESLint: parser.parseForESLint},
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module", 
        projectService: true,
      },
      globals: globals.es2022,
    },
    plugins: {
      "@bedrock-apis-rules": plugin as any,
    },
    rules: {
      "@bedrock-apis-rules/apis-privileges": "error",
    }
} satisfies Linter.Config);