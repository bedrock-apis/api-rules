//import * as ts from 'typescript';
import { ESLintUtils } from '@typescript-eslint/utils';


// Required messages for this rule
const MESSAGES = {
  'no-privilege':"`{{method}}` doesn't have privileges to be executed in this context.",
  "none":"No error"
};

// Rule Docs I am not sure what it does
const DOCS = {
  description: "Some description",
}

// Rule helper
// This rule helper, improves the created context and binds it to TS AST tree,
// so we can refer types for specific nodes
const createRule = ESLintUtils.RuleCreator<typeof DOCS>(
  name => `https://example.com/rule/${name}`,
);

// Export our rule
export default createRule<any[], keyof typeof MESSAGES>({
    name: "",
    meta: {
        type: "problem",
        docs: DOCS,
        schema: [],
        messages: MESSAGES
    },
  create(context) {
    // Get Parser Service
    const parserServices = ESLintUtils.getParserServices(context);
    
    // Report the load fail
    if (!parserServices || !parserServices.program) {
      console.error("Faild to load ");
      // If parserServices is not available, return an empty object
      return {}; 
    }

    return {
      // This expression is general for calls
      "CallExpression"(node){
        // 1. Find the TS type for the ES node
        const type = parserServices.getTypeAtLocation(node.callee);

        // 2. Check the TS type's backing symbol for being an enum
        // parent of symbols are not exposed so we have to cast it to any
        let parent: any = type.symbol;

        //Check for the root symbol to match a native lib names
        while(parent?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = parent?.parent;
        
        // Check if we success with founding root parent
        if(!parent?.parent) return;

        // Report No privilege
        context.report({
          node,
          messageId: "no-privilege",
          data:{
            method: type.symbol.name,
          }
        });
      }
    };
  },
  defaultOptions: []
});
