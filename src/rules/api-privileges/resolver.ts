import { Node, SyntaxKind } from "typescript";


type OnlyNumber<T> = T extends Number ? T : never;

// Walk thru the TS AST Tree
export function traverse<T extends OnlyNumber<SyntaxKind>>(node: Node, handler: {[key in T]: (node: Node)=>void}){
    visit(node, (node)=>handler[node.kind as T]?.(node));
}
export function visit(node: Node, caller: (node: Node)=>void){
    caller(node);
    node.forEachChild((node)=>visit(node, caller));
}
