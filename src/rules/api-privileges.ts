import { Type } from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

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

    function getScope(node: TSESTree.Node): null | Scope
    {
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
      return [isNative(parent)?DeclarationPrivilege.ReadOnly:DeclarationPrivilege.None];
    }

    function hasPrivilege(executionPrivilege: ExecutionPrivilage, declerationPrivileges: DeclarationPrivilege[]){
      if(executionPrivilege === ExecutionPrivilage.All) return true;
      
      return declerationPrivileges.includes((executionPrivilege as any));
    }

    return {
      "Program"(node){ // :eyes:
        //Create Hardcoded Scope
        const scope = new Scope(node, ExecutionPrivilage.EarlyExecution, false);

        // Register new Scope
        SCOPES.set(node, scope);
      },
      "FunctionDeclaration"(node){
        // 1. Find the TS type for this Function Declaration
        const type = parserServices.getTypeAtLocation(node);

        //Create Scope
        const scope = new Scope(node, ExecutionPrivilage.All, true);

        // Assign Symbol
        scope.symbol = type.symbol;

        // Register new Scope
        SCOPES.set(node, scope);
      },
      "AwaitExpression"(node){
        const scope = getScope(node);
        if(!scope) return;
        scope.executionPrivilege = ExecutionPrivilage.All;
      },
      // This expression is general for calls
      "CallExpression"(node){

        const scope = getScope(node);
        if(!scope) return;
        // should I conbine methods/props in map?
        // Yes methods and properties to gether
        // ok
        

        // 1. Find the TS type for the ES node
        const calleeType = parserServices.getTypeAtLocation(node.callee);

        const privileges = getPrivileges(calleeType.symbol);
        


        if(scope.hasImplementation) {
          for(const privilege of privileges){
            if(scope.declarationPrivileges.includes(privilege)) continue;
            scope.declarationPrivileges.push(privilege);
          }
          return;
        }

        if(hasPrivilege(scope.executionPrivilege, privileges)){
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

class Scope{
  // Context Scope Privilege
  public executionPrivilege = ExecutionPrivilage.All;
  // Context Scope Privilege
  public declarationPrivileges = [DeclarationPrivilege.None];

  // AST Node
  public node: TSESTree.Node;
  
  public symbol?: Type["symbol"];
  // When method or function has declaration known to ESLint 
  public readonly hasImplementation: boolean;
  public constructor(node: TSESTree.Node, privilege = ExecutionPrivilage.All, hasImplementation = true){
    this.node = node;
    this.executionPrivilege = privilege;
    this.hasImplementation = hasImplementation;
  }
}