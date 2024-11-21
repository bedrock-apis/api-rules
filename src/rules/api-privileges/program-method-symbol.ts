import { Symbol } from "typescript";
import { Privilege } from "../../privileges";
import { CalleeRef } from "./callee-ref";

export class ProgramMethodSymbol{
    public readonly unresolvedReferences = new Set<CalleeRef>();
    public readonly symbol: Symbol;
    public readonly resolvablePrivilege: Privilege = Privilege.All();
    public constructor(symbol: Symbol){
        this.symbol = symbol;
    }
}