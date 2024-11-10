import { Type } from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { ScopeDefinition, Privilege, PrivilegeType } from '../privileges';
// import { MetadataLoader } from '../metadata';


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
/*
const DECLARATIONS = new WeakMap();

const functionNodeTypes = new Set([
  TSESTree.AST_NODE_TYPES.ArrowFunctionExpression,
  TSESTree.AST_NODE_TYPES.FunctionDeclaration,
  TSESTree.AST_NODE_TYPES.FunctionExpression,
  TSESTree.AST_NODE_TYPES.MethodDefinition,
]);


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

type FunctionType =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.MethodDefinition;*/


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
    // const loader = new MetadataLoader();
    // loader.hasPrivilege(PrivilegeType.ReadOnly, 'BlockPermutation.resolve', '@minecraft/server')

    const SCOPES = new Map<TSESTree.Node, ScopeDefinition>();
    console.log(context.filename);
    
    // Get Parser Service
    const parserServices = ESLintUtils.getParserServices(context);
    
    // Report the load fail
    if (!parserServices || !parserServices.program) {
      console.error("Faild to load ");
      // If parserServices is not available, return an empty object
      return {}; 
    }

    function getScope(node: TSESTree.Node): ScopeDefinition | null {
      let parent = node.parent;
      // Loop throu the Node Tree to found the scope where the node is
      while(!SCOPES.has(parent!)) parent = parent?.parent;
      // If scope was founded
      if(parent) return SCOPES.get(parent)!;
      // No scope found
      else return null;
    }

    function isNative(parent: Type["symbol"]){
        //Check for the root symbol to match a native lib names
        while((parent as any)?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = (parent as any)?.parent;
        // Check if we success with founding root parent
        return !!((parent as any)?.parent);
    }

    function getPrivileges(parent: Type["symbol"]){
      return isNative(parent)?Privilege.None():Privilege.All();
    }

    const afterChecks = [];
    return {
      "Program:exit"(){

      },
      "Program"(node){
        //Create Hardcoded Scope
        const scope = new ScopeDefinition(node);
        scope.executionPrivilege = new Privilege(PrivilegeType.EarlyExecution);

        // Register new Scope
        SCOPES.set(node, scope);
      },
      "FunctionDeclaration"(node){
        // 1. Find the TS type for this Function Declaration
        const type = parserServices.getTypeAtLocation(node);

        //Create Scope
        const scope = new ScopeDefinition(node);
        
        // Assign required properties
        scope.hasDeclaration = true;
        scope.executionPrivilege = new Privilege(PrivilegeType.All);
        scope.symbol = type.symbol;

        // Register new Scope
        SCOPES.set(node, scope);
      },
      "AwaitExpression"(node){
        const scope = getScope(node);
        if(!scope) return;
        scope.hasBeenAwaited = true;
      },
      // This expression is general for calls
      "CallExpression"(node){

        const scope = getScope(node);
        if(!scope) return;        

        // 1. Find the TS type for the ES node
        const calleeType = parserServices.getTypeAtLocation(node.callee);

        if(!isNative(calleeType.symbol)) {}

        const privilege = getPrivileges(calleeType.symbol);
        
        // Everything is possible after await expression
        if(scope.hasBeenAwaited) return;

        if(scope.hasDeclaration) {
          scope.executionPrivilege.marge(privilege);
          return;
        }
        else if(scope.executionPrivilege.canExecute(privilege)){
          return;
        }
        
        // Report No privilege
        context.report({
          node,
          messageId: "no-privilege",
          data:{
            method: calleeType.symbol.name,
          }
        });
      }
    };
  },
  defaultOptions: []
});