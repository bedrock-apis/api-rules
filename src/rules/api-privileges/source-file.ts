/**
 * SourceFile is code file fro the user and each source file has dependencies on another file if the source file is resolved,
 * then could be skipped and privileges loaded from cache of symbol.
 * by default no files are resolve once ESLint rule ask for one file then we are able to resolve it,
 * so we should move all logic from ./index.ts here and in ./index.ts we would call the source file resolve method and report all its errors,
 * but all logic would be here and we would work with TS AST only no ESTree AST so we don't need to rely on ESLint execution timing
 */