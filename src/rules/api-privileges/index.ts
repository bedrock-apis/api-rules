import { ESLintUtils } from '@typescript-eslint/utils';
import { ProgramContext } from './program-context';

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
const createRule: ReturnType<(typeof ESLintUtils)["RuleCreator"]> = ESLintUtils.RuleCreator<typeof DOCS>(
  name => `https://example.com/rule/${name}`,
);

let RULE_CONTEXT: null | ProgramContext = null;

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
    const parserServices = ESLintUtils.getParserServices(context);
    // Global Rule Context
    if(!RULE_CONTEXT) {
      RULE_CONTEXT = new ProgramContext(parserServices.program, parserServices);
    }

    // Local Variable
    // No longer optional
    const rule_context = RULE_CONTEXT;
    return {
        "Program:exit"(node){
          const srcFile = parserServices.esTreeNodeToTSNodeMap.get(node);
          const data = rule_context.openFile(srcFile);

          // Loop all diagnostics
          for(const diagnostics of data.resolve()){

            // Get eslint node
            const expression = parserServices.tsNodeToESTreeNodeMap.get(diagnostics.node);

            // Report privilege error for this noe
            context.report({
              node: expression,
              messageId: "no-privilege",
              data:{
                "method-name":diagnostics.symbol.name,
                "required-privilege":diagnostics.requiredPrivilege,
                "has-privilege":diagnostics.currentPrivilege,
              }
            });
          }
        }
    };
  },
  defaultOptions: []
}) as unknown as {name: string, meta: object, create(context: any): any};

/**
 * 
 * 
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

        //console.log(context.filename,calleeType.getSymbol()?.getJsDocTags());
        //console.log(SyntaxKind[calleeType.getSymbol()?.valueDeclaration?.kind??0]);
        const tsNode = calleeType.symbol.valueDeclaration;

        if(tsNode){
          traverse(tsNode, {
            [SyntaxKind.CallExpression](node){
              console.log("\x1b[35m",SyntaxKind[node.kind],"\x1b[0m" + node.getText());
            },
            [SyntaxKind.CallSignature](node){
              console.log(SyntaxKind[node.kind], node.getText());
            }
          });
        }

        // Add method for after resolve operation
        if(!isNative(calleeType.symbol)) {
          const calleeRef = PROGRAM_CONTEXT.buildCalleeRef(node, calleeType.symbol);
          method.add(calleeRef);
          return;
        }

        const privilege = getPrivileges(calleeType.symbol);

        // If function declaration is available then merge privileges
        if(scope.hasDeclaration) {
          scope.executionPrivilege.merge(privilege);
          return;
        }
        // Else register for later resolve 
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
 */