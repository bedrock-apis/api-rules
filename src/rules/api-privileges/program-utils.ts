import { Node } from "typescript";

/**
 * 
 * @param node Node Tree to walk thru
 * @param 
 */
export function * ThruWalker(node: Node): Generator<Node, void>{
    // Yield self the first
    yield node;
    // Loop Child
    for(const child of node.getChildren()){
        yield * ThruWalker(child);
    }
}