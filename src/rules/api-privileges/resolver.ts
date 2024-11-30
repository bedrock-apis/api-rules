import { ArrowFunction, CallExpression, FunctionDeclaration, MethodDeclaration, Node, Symbol, SyntaxKind } from "typescript";
import { Privilege, PrivilegeType } from "../../privileges";
import { ProgramContext } from "./program-context";
import { visiter } from "./program-utils";
import { ProgramDiagnosticsReport } from "./diagnostics";



export class ResolveContext{
    public readonly context: ProgramContext;
    public readonly recursivePath: Map<Symbol, Privilege> = new Map();
    public constructor(context: ProgramContext) {this.context = context;}
}

export function resolve(context: ResolveContext, symbol: Symbol): Privilege{
    let privilege = context.context.resolvedPrivileges.get(symbol);

    // Maybe the resolved privileges for this symbol already exists
    if(privilege) return privilege;

    // Initialize new privilege instance
    privilege = Privilege.All();

    if(context.recursivePath.has(symbol)) return Privilege.All();

    let isResolved = false;
    // Loop For each JsDocTag
    for(const tag of symbol.getJsDocTags()){
        //Check if thats valid api_privilege tag
        if(tag.name.toLocaleLowerCase() === "api_privilege"){
            // Check if data are available
            if(!tag.text) continue;
            // Extract all required data
            const text = tag.text.filter(e=>e.kind === "text").map(e=>e.text).join("");
            const searches = text.match(/\[(\s*[^,\]\s]+(?:\s*,\s*([^,\]\s]+|))*)\s*\]/)?.[1]?.replaceAll(" ","")?.split(',');
            // Check for availability
            if(!searches) continue;

            // Assign privileges
            searches.filter(e=>e.length > 0).forEach(e=>privilege.addPrivilegeType(e.toLowerCase() as PrivilegeType));

            // Mark symbol as resolved by JSDocs
            isResolved = true;
        }
    }

    // When declaration is available then check its content
    if(symbol.valueDeclaration){
        //Get SrcFile
        const srcFile = context.context.openFile(symbol.valueDeclaration.getSourceFile());
        
        // Skip AST lookup when it's TypeScript Declaration file only
        if(srcFile.srcFile.isDeclarationFile) {
            // Register newly resolved privilege
            context.context.resolvedPrivileges.set(symbol, privilege);
            return privilege;
        }
        // Set recursive path for this object
        context.recursivePath.set(symbol, privilege);

        // Loop all call expressions
        for(const callExpression of resolveDeclaration(symbol.valueDeclaration)){
            // Get Symbol
            const type = context.context.checker.getTypeAtLocation(callExpression.expression);
            const mSymbol = type.getSymbol()??context.context.checker.getSymbolAtLocation(callExpression.expression);

            // Skip if no symbol is available
            if(!mSymbol) continue;

            // Ignore recursive tasks
            // TODO: Improve save its reference for nested recursions and resolve once this method is used standalone
            if(context.recursivePath.has(mSymbol)) continue;


            // Resolve Privilege for this call expression
            const callPrivilege = resolve(context, mSymbol);


            if(isResolved){
                // Report Privilege incompatibility
                let canExecute = privilege.canExecute(callPrivilege);

                // Skip when compatible
                if(canExecute) continue;
                srcFile.diagnostics.set(callExpression, new ProgramDiagnosticsReport(callExpression, mSymbol, privilege, callPrivilege));
            }else{
                
                // Update current privilege based on its call expressions
                privilege.merge(callPrivilege);
            }
        }
        // Remove My self from recursions
        context.recursivePath.delete(symbol);
    }


    // Register newly resolved privilege
    context.context.resolvedPrivileges.set(symbol, privilege);
    return privilege;
}
const BASE_FILTER = new Set([SyntaxKind.AwaitExpression, SyntaxKind.CallExpression]);
export function * resolveDeclaration(node: Node): Generator<CallExpression>{
    for(const n of resolveComplexTree(node, BASE_FILTER))
    {
        if(n.kind === SyntaxKind.AwaitExpression) return;
        if(n.kind === SyntaxKind.CallExpression) yield n as CallExpression;
    }
}
export function * resolveComplexTree(node: Node, filter: Set<SyntaxKind>): Generator<Node>{
    const a = visiter(node);
    let skip = null;
    let next: IteratorResult<Node> = a.next(skip);
    if(next.done) return;


    while(!(next = a.next(skip)).done){
        skip = null;
        const nextNode = next.value;
        if(filter.has(nextNode.kind)){
            yield nextNode as Node;
            skip = true;
        }
    }
}