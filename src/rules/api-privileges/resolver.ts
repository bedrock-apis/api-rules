import { Node, SyntaxKind } from "typescript";

export function traverse(node: Node, handler: {[key: number]: (node: Node)=>void}){
    const r = Math.floor(Math.random() * 10);
    visit(node, (node)=>handler[node.kind as number]?.(node));
}
function visit(node: Node, caller: (node: Node)=>void){
    caller(node);
    node.forEachChild((node)=>visit(node, caller));
}