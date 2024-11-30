import {recommended} from "./dist/index.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["tests/*.ts"],
    ...recommended
  },
];