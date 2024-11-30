import { Node } from "typescript";

export class CalleeRef {
    public readonly node: Node;
    public constructor(node: Node){
        this.node = node;
    }
}