import { Symbol, Type } from 'typescript';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { ScopeDefinition, Privilege, PrivilegeType } from '../../privileges';
import { CalleeRef, getPrivileges, isNative, MethodDefinition, ProgramContext } from './method-definition';
import type { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint';
// import { MetadataLoader } from '../metadata';

// Required messages for this rule
const MESSAGES = {
  'no-privilege':"'{{method-name}}' doesn't have '{{required-privilege}}' privilege to be executed in this context.\n Method privilege: '{{has-privilege}}'",
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

    // Create New Context
    const PROGRAM_CONTEXT = new ProgramContext(context);

    // Get Parser Service
    const parserServices = ESLintUtils.getParserServices(context);
    
    // Report the load fail
    if (!parserServices || !parserServices.program) {
      console.error("Failed to load ");
      // If parserServices is not available, return an empty object
      return {};
    }

    return {
      "Program:exit"(){
        PROGRAM_CONTEXT.resolveAll('no-privilege');
      },
      "Program"(node){
        //Create Hardcoded Scope
        const scope = PROGRAM_CONTEXT.setTopLevel(node);
        // Set scope execution privilege
        scope.executionPrivilege = new Privilege(PrivilegeType.EarlyExecution);
      },
      "FunctionDeclaration"(node){
        // 1. Find the TS type for this Function Declaration
        const type = parserServices.getTypeAtLocation(node);
        
        //Create Scope
        const scope = PROGRAM_CONTEXT.tryCreate(node, type.symbol);

        // Assign required properties
        scope.hasDeclaration = true;
        scope.executionPrivilege = new Privilege(PrivilegeType.All);
      },
      "AwaitExpression"(node){
        const scope = PROGRAM_CONTEXT.getScope(node);
        if(!scope) return;
        scope.hasBeenAwaited = true;
      },
      // This expression is general for calls
      "CallExpression"(node){
        const scope = PROGRAM_CONTEXT.getScope(node);
        if(!scope) return;

        // Everything is possible after await expression
        if(scope.hasBeenAwaited) return;

        // Get method scope info
        const method = PROGRAM_CONTEXT.getMethodByScope(scope);        
        if(!method) return;


        // 1. Find the TS type for the ES node
        const calleeType = parserServices.getTypeAtLocation(node.callee);

        // Add method for after resolve operation
        if(!isNative(calleeType.symbol)) {
          const calleeRef = PROGRAM_CONTEXT.buildCalleeRef(node, calleeType.symbol);
          method.add(calleeRef);
          return;
        }

        const privilege = getPrivileges(calleeType.symbol);

        if(scope.hasDeclaration) {
          scope.executionPrivilege.marge(privilege);
          return;
        }
        else if(scope.executionPrivilege.canExecute(privilege)){
          return;
        }
        
        // Report no privilege
        context.report({
          node,
          messageId: "no-privilege",
          data:{
            "has-privilege": [...privilege.privilegeTypes].join(", "),
            "required-privilege": [...scope.executionPrivilege.privilegeTypes].join(", "),
            "method-name": calleeType.symbol.name,
          }
        });
      }
    };
  },
  defaultOptions: []
});