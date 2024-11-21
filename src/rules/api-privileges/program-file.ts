import { ArrowFunction, AwaitExpression, CallExpression, FunctionDeclaration, Block, MethodDeclaration, Node, SourceFile, SyntaxKind, flattenDiagnosticMessageText } from "typescript";
import { ProgramContext } from "./program-context";
import { ProgramScope } from "./program-scope";
import { ThruWalker } from "./program-utils";

export class ProgramFile{
    private readonly scopes: WeakMap<Node, ProgramScope> = new WeakMap();
    public readonly context: ProgramContext;
    public readonly sourceFile: SourceFile;
    public constructor(context: ProgramContext, src: SourceFile){
        this.context = context;
        this.sourceFile = src;
    }
    private [SyntaxKind.MethodDeclaration](node: MethodDeclaration){return this.scopeDeclaration(node);}
    private [SyntaxKind.FunctionDeclaration](node: FunctionDeclaration){return this.scopeDeclaration(node);}
    private [SyntaxKind.ArrowFunction](node: ArrowFunction){return this.scopeDeclaration(node);}
    private scopeDeclaration(node: ArrowFunction | MethodDeclaration | FunctionDeclaration): Node | null{
        const programScope = new ProgramScope(node);
        this.scopes.set(node, programScope);
        return null;
    }
    /**
     * @param node Received Input
     * @returns Whenever this expression should be reported
     */
    private [SyntaxKind.CallExpression](node: CallExpression): Node | null{
        const scope = this.scopes.get(this.findScopeFor(node)??node);
        if(!scope) return null;

        if(scope.hasBeenAwaited) return null;

        const src = this.context.getType(node.expression).symbol.valueDeclaration?.getSourceFile();
        if(src && src !== this.sourceFile){
            if(src.isDeclarationFile) {
                return node.expression;
            }
            return null;
        }
        //const type = this.context.getType();
        //const scope = this.findScopeFor(node);
        //if(!scope) return null;
        console.log("Call Depression: ", this.context.getType(node.expression).symbol.name);
        return null;
    }
    /**
     * 
     * @param node Received Input
     * @returns Whenever this expression should be reported
     */
    private [SyntaxKind.AwaitExpression](node: AwaitExpression): Node | null{
        const scope = this.scopes.get(this.findScopeFor(node)??node);
        if(!scope) return null;

        scope.hasBeenAwaited = true;
        return null;
    }
    /**
     * @param src Source file to resolve 
     * @returns Iterator of nodes and diagnostics
     */
    public * resolve(): Generator<Node, boolean>{
        for(const node of ThruWalker(this.sourceFile)){
            if(node.kind in this){
                const mapped = this[node.kind as (
                    SyntaxKind.AwaitExpression | 
                    SyntaxKind.CallExpression
                )](node as any);
                if(mapped) yield mapped;
            }
        }
        //All was successful
        return true;
    }
    /**
     * @param node Node to check
     * @returns True, when node is registered scope.
     */
    public isScope(node: Node){ return this.scopes.has(node);}
    /**
     * @param node Node to check in where this node is
     * @returns Parent node of the scope, null if no scope was found.
     */
    public findScopeFor(node: Node): Node | null{
        let parent = node.parent;

        // Recursive walk thru
        while(!this.isScope(parent) && parent.parent){
            parent = parent.parent;
        }

        return parent??null;
    }
    /**
     * @param node Node of the registered scope
     * @returns The scope of the node 
     */
    public getScopeFor(node: Node): ProgramScope | null { return this.scopes.get(node)??null;}
}