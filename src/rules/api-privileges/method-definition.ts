import { Symbol, Type } from "typescript";
import { Privilege, ScopeDefinition } from "../../privileges";
import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";


// Method Declaration Reference
export class MethodDefinition {
    public calls = new Set<CalleeRef>();
    public scope;
    public symbol;
    public isResolved: boolean = false;
    public constructor(scope: ScopeDefinition | null, type: Symbol){
        this.scope = scope;
        this.symbol = type;
    }
    public add(call: CalleeRef){
        this.calls.add(call);
    }
}
// CallExpression Reference
export class CalleeRef{
    public readonly definition;
    public readonly node;
    public constructor(methodDefinition: MethodDefinition, node: TSESTree.Node){
        this.definition = methodDefinition;
        this.node = node;
    }
}
// Program Context Helper
export class ProgramContext<C extends Readonly<RuleContext<M, any[]>>, M extends string>{
    public constructor(context: C){
        this.context =  context;
    }
    public readonly context;
    public readonly BY_SYMBOL_SCOPES = new WeakMap<Symbol, ScopeDefinition>();
    public readonly SCOPES = new WeakMap<TSESTree.Node, ScopeDefinition>();
    public readonly METHODS = new Map<ScopeDefinition, MethodDefinition>();
    public readonly BY_SYMBOL_METHODS = new WeakMap<Symbol, MethodDefinition>();
    public tryCreate(node: TSESTree.Node, type: Symbol){
        const scope = new ScopeDefinition(node);
        scope.symbol = type;
        const method = this.tryGetMethod(type);
        
        method.scope = scope;

        this.SCOPES.set(node, scope);
        this.BY_SYMBOL_SCOPES.set(type, scope);
        this.METHODS.set(scope, method);
        return scope;
    }
    public getScope(node: TSESTree.Node): ScopeDefinition | null {
        let parent = node.parent;
        // Loop thru the Node Tree to found the scope where the node is
        while(!this.SCOPES.has(parent!)) parent = parent?.parent;
        // If scope was founded
        if(parent) return this.SCOPES.get(parent)!;
        // No scope found
        else return null;
    }
    public getMethodByScope(scope: ScopeDefinition){ return this.METHODS.get(scope); }
    public buildCalleeRef(node: TSESTree.Node, type: Symbol){
        const method = this.tryGetMethod(type);

        return new CalleeRef(method, node);
    }

    public tryGetMethod(type: Symbol){
        let method = this.BY_SYMBOL_METHODS.get(type);
        if(!method) method = new MethodDefinition(null, type);
        this.BY_SYMBOL_METHODS.set(type, method);
        return method;
    }
    public resolveAll(messageId: M){
        this.context.report({
            messageId,
            node: 
        })
    }
}
export function isNative(parent: Type["symbol"]){
    //Check for the root symbol to match a native lib names
    while((parent as any)?.parent?.escapedName?.includes?.("@minecraft/") === false) parent = (parent as any)?.parent;
    // Check if we success with founding root parent
    return !!((parent as any)?.parent);
}
export function getPrivileges(parent: Type["symbol"]){
  return isNative(parent)?Privilege.None():Privilege.All();
}