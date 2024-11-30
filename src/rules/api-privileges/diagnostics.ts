import { Node, Symbol } from "typescript";
import { Privilege } from "../../privileges";

export class ProgramDiagnosticsReport{
    public readonly node: Node;
    public readonly symbol: Symbol;
    public readonly requiredPrivilege: Privilege;
    public readonly currentPrivilege: Privilege;
    public constructor(node: Node, symbol: Symbol, required: Privilege, current: Privilege){
        this.node = node;
        this.symbol = symbol;
        this.requiredPrivilege = required;
        this.currentPrivilege = current;
    }
}