import * as ts from 'typescript';
import { ESLintUtils } from '@typescript-eslint/utils';

type MessageIds = 'no-privilege' | 'none';
type Options = any[];
type Docs = {
    description: string,
    recommended: boolean
};
const createRule = ESLintUtils.RuleCreator<Docs>(
  name => `https://example.com/rule/${name}`,
);


export default createRule<Options, MessageIds>({
    name: "",
    meta: {
        type: "problem",
        docs: {
        description: "Enforces type checking on closures",
        recommended: true
        },
        schema: [],
        messages:{
            "no-privilege":"`{{method}}` doesn't have privileges to be executed in this context.",
            "none":"No error"
        }
    },
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    if (!parserServices || !parserServices.program) {
      console.error("Faild to load ");
      return {}; 
      // If parserServices is not available, return an empty object
    }
    //const checker = parserServices.program.getTypeChecker();

    console.log("Done!!:");
    return {
      "CallExpression"(node){
        // 2. Find the TS type for the ES node
        const type = parserServices.getTypeAtLocation(node.callee);

        // 3. Check the TS type's backing symbol for being an enum
        let parent: any = type.symbol;
        //? But it does exists
        while(parent?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = parent?.parent;
        
        if(!parent?.parent) return;

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
