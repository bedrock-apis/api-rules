import { ArrowFunction, CallExpression, FunctionDeclaration, MethodDeclaration, Node, SourceFile, SyntaxKind } from "typescript";
import { ProgramDiagnosticsReport } from "./diagnostics";
import { ProgramContext } from "./program-context";
import { resolve, resolveComplexTree, ResolveContext } from "./resolver";
import { Privilege, PrivilegeType } from "../../privileges";

const BASE_FILTER = new Set([
    SyntaxKind.AwaitExpression, SyntaxKind.CallExpression, 
    SyntaxKind.MethodDeclaration, SyntaxKind.FunctionDeclaration, SyntaxKind.ArrowFunction
]);

export class ProgramFile {
    public readonly srcFile: SourceFile;
    public readonly context: ProgramContext;
    public readonly diagnostics: Map<Node, ProgramDiagnosticsReport> = new Map();
    public constructor(src: SourceFile, context: ProgramContext){
        this.context = context;
        this.srcFile = src;
    }
    public * resolve(): Generator<ProgramDiagnosticsReport>{
        const privilege = new Privilege(PrivilegeType.EarlyExecution);

        const context = new ResolveContext(this.context);
        let hasBeenAwaited = false;

        for(const node of resolveComplexTree(this.srcFile, BASE_FILTER)){
            if(node.kind === SyntaxKind.AwaitExpression) {
                hasBeenAwaited = true;
                continue;
            }
            if(node.kind === SyntaxKind.CallExpression && !hasBeenAwaited){
                let callExpression = node as CallExpression;
                const type = context.context.checker.getTypeAtLocation(callExpression.expression);
                const symbol = type.getSymbol()??context.context.checker.getSymbolAtLocation(callExpression.expression);
                if(!symbol) continue;
                if(context.recursivePath.has(symbol)) continue;
    
                const callPrivilege = resolve(context, symbol);
                let canExecute = privilege.canExecute(callPrivilege);
                if(canExecute) continue;
                yield new ProgramDiagnosticsReport(callExpression, symbol, privilege, callPrivilege);
                continue;
            }
            let declaration = node as MethodDeclaration | FunctionDeclaration | ArrowFunction;
            
            const type = context.context.checker.getTypeAtLocation(declaration);
            const symbol = type.getSymbol()??context.context.checker.getSymbolAtLocation(declaration);
            if(!symbol) continue;
            resolve(context, symbol);
        }

        yield * this.diagnostics.values();
    }
}