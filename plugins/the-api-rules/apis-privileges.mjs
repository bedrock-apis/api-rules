import * as ts from 'typescript';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  name => `https://example.com/rule/${name}`,
);


export default createRule({
  meta: {
    type: "problem",
    docs: {
      description: "Enforces type checking on closures",
      category: "Best Practices",
      recommended: true
    },
    schema: []
  },
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    if (!parserServices || !parserServices.program) {
      console.error("Faild to load " + import.meta.filename);
      return {}; 
      // If parserServices is not available, return an empty object
    }
    //const checker = parserServices.program.getTypeChecker();

    console.log("Done!!:");
    return {
      "CallExpression"(node){
        // 2. Find the TS type for the ES node
        const type = parserServices.getTypeAtLocation(node);
        
        // 3. Check the TS type's backing symbol for being an enum
        let parent = type.symbol;
        while(parent?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = parent?.parent;
        
        if(!parent?.parent) return;
        context.report({
          node,
          message: `Identifier '${type.symbol.name}' is from our module ${parent?.parent?.name?.match(/@minecraft\/[^ \/]+/g)}`
        });

      }
    };
  },
  defaultOptions: []
});
