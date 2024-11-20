import { Symbol, Type } from "typescript";
import { Privilege, ScopeDefinition } from "../../privileges";
import { TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
};

// Method Declaration Reference
export class MethodDefinition {
    public calls = new Set<CalleeRef>();
    public scope;
    public symbol;
    public isResolved: boolean = false;
    public constructor(scope: ScopeDefinition | null, type: Symbol | null = null){
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
export class ProgramContext<C extends Readonly<RuleContext<string, any[]>>>{
    public constructor(context: C){
        this.context =  context;
    }
    public readonly context;
    public readonly BY_SYMBOL_SCOPES = new WeakMap<Symbol, ScopeDefinition>();
    public readonly SCOPES = new WeakMap<TSESTree.Node, ScopeDefinition>();
    public readonly METHODS = new Map<ScopeDefinition, MethodDefinition>();
    public readonly BY_SYMBOL_METHODS = new WeakMap<Symbol, MethodDefinition>();
    public readonly TOPLEVEL?: TSESTree.Node;
    public setTopLevel(node: TSESTree.Node){
        const scope = new ScopeDefinition(node);
        (this as Mutable<this>).TOPLEVEL = node;
        this.METHODS.set(scope, new MethodDefinition(scope, null!));
        this.SCOPES.set(node, scope);
        return scope;
    }
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
    public getTopLevelScope(){return this.SCOPES.get(this.TOPLEVEL??{} as any);}
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
    public resolveAll(messageId: C extends Readonly<RuleContext<infer M, any[]>>?M:string){
        for(const method of this.METHODS.values()){
            if(!method.scope) continue;
            if(!method.scope.hasDeclaration) continue;
            if(method.isResolved) continue;
            this.resolveMethod(messageId, method);
        }

        const scope = this.getTopLevelScope();
        if(!scope) return;

        const method = this.getMethodByScope(scope);
        if(!method) return;

        this.resolveMethod(messageId, method);
    }
    public resolveMethod(messageId: C extends Readonly<RuleContext<infer M, any[]>>?M:string, method: MethodDefinition, recursive_ness = new Set<MethodDefinition>()){
        if(method.calls.size <= 0) {
            method.isResolved = true;
            return;
        }
        recursive_ness.add(method);
        for(const call of method.calls){
            if(!call.definition.isResolved){
                if(recursive_ness.has(call.definition)) continue;
                else this.resolveMethod(messageId, call.definition, recursive_ness);
            }
            if(call.definition.isResolved){
                if(!call.definition.scope?.executionPrivilege) continue;
                if(!method.scope?.hasDeclaration) {
                    //Check if we could execute this call expression
                    const canExecute = method.scope?.executionPrivilege.canExecute(call.definition.scope.executionPrivilege);
                    if(!canExecute) this.context.report({
                        messageId,
                        node: call.node,
                        data: {
                            "has-privilege": [...call.definition.scope.executionPrivilege.privilegeTypes].join(", "),
                            "required-privilege": [...method.scope?.executionPrivilege.privilegeTypes??[]].join(", "),
                            "method-name": call.definition.symbol?.name
                        }
                    })
                }
                else method.scope?.executionPrivilege.merge(call.definition.scope?.executionPrivilege);
            }
        }

        //This is not right yet
        method.isResolved = true;
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