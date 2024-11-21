import { Node } from "typescript";
import { Privilege } from "../../privileges";

export class ProgramScope {
    // If this method hasDeclaration
    public isHardCoded: boolean = false;
    // If in the declaration has been used await
    public hasBeenAwaited: boolean = false;
    // Privilege
    public executionPrivilege: Privilege = new Privilege();
    // AST Node
    public node: Node;
    public constructor(node: Node){ this.node = node; }
    public toString(){
        return `[Object Privilege: {${[...this.executionPrivilege.privilegeTypes].join(", ")}}]`;
    }
}