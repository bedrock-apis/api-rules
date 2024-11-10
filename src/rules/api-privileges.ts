//import * as ts from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

enum ExecutionPrivilage {
  All = "all",
  ReadOnly = "read_only",
  EarlyExecution = 'early_execution',
}
enum DeclarationPrivilege {
  None = 'none',
  ReadOnly = 'read_only',
  EarlyExecution = 'early_execution',
}

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

const functionNodeTypes = new Set([
  TSESTree.AST_NODE_TYPES.ArrowFunctionExpression,
  TSESTree.AST_NODE_TYPES.FunctionDeclaration,
  TSESTree.AST_NODE_TYPES.FunctionExpression,
  TSESTree.AST_NODE_TYPES.MethodDefinition,
]);

type FunctionType =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.MethodDefinition;

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
    const SCOPES = new Map<TSESTree.Node, Scope>();
    console.log(context.filename);
    
    // Get Parser Service
    const parserServices = ESLintUtils.getParserServices(context);
    
    // Report the load fail
    if (!parserServices || !parserServices.program) {
      console.error("Faild to load ");
      // If parserServices is not available, return an empty object
      return {}; 
    }
    // const checker = parserServices.program.getTypeChecker();

    const topLevelFunctions = new Set<FunctionType>();

    function isTopLevelCall(node: TSESTree.CallExpression): boolean {
      let current: TSESTree.Node | undefined = node;
      while (current) {
        if (current.type === TSESTree.AST_NODE_TYPES.Program) {
          return true;
        }
        if (topLevelFunctions.has(current as any)) {
          return true;
        }
        if (functionNodeTypes.has(current.type)) {
          return false;
        }
        current = current.parent;
      }
      return false;
    }

        
    function getScope(node: TSESTree.Node): null | Scope
    {
      let parent = node.parent;
      while(!SCOPES.has(parent!)) parent = parent?.parent;
      if(parent) return SCOPES.get(parent)!;
      else return null;
    }

    return {
      "Program"(node){ // :eyes:
        SCOPES.set(node, new Scope(node, ExecutionPrivilage.EarlyExecution));
      },
      "AwaitExpression"(node){
        const scope = getScope(node);
        if(!scope) return;
        scope.execution_privilege = ExecutionPrivilage.All;
      },
      // This expression is general for calls
      "CallExpression"(node){

        const scope = getScope(node);
        if(!scope || scope.execution_privilege === ExecutionPrivilage.All) return;

        // 1. Find the TS type for the ES node
        const caleeType = parserServices.getTypeAtLocation(node.callee);

        // 2. Check the TS type's backing symbol for being an enum
        // parent of symbols are not exposed so we have to cast it to any
        let parent: any = caleeType.symbol;

        //Check for the root symbol to match a native lib names
        while(parent?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = parent?.parent;
        
        // Check if we success with founding root parent
        if(!parent?.parent) return;

        const parentType = parserServices.getTypeAtLocation((caleeType.symbol as any).parent);
        //console.log(caleeType.symbol.name, isTopLevelCall(node));

        // Report No privilege
        context.report({
          node,
          messageId: "no-privilege",
          data:{
            method: caleeType.symbol.name,
          }
        });
      }
    };
  },
  defaultOptions: []
});

class Scope{
  public execution_privilege = ExecutionPrivilage.All;
  public node;
  public constructor(node: TSESTree.Node, privilege = ExecutionPrivilage.All){
    this.node = node;
    this.execution_privilege = privilege;
  }
}