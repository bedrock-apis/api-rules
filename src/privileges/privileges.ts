import type { Type } from "typescript";
import type { TSESTree } from '@typescript-eslint/utils';

export enum PrivilegeType {
    None = 'none',
    ReadOnly = 'read_only',
    EarlyExecution = 'early_execution',
    All = "all"
}

export class Privilege {
    public static readonly None = ()=>new Privilege(PrivilegeType.None);
    public static readonly All = ()=>new Privilege(PrivilegeType.All);

    public privilegeTypes: Set<PrivilegeType> = new Set();
    public canExecute(privilege: Privilege){
        // Check for all privileges and skip
        if(this.has(PrivilegeType.All) || this.has(PrivilegeType.None)) return true;
        // Check for all privileges and skip
        if(privilege.has(PrivilegeType.All)) return true;

        return !this.hasInCommon(privilege).next().done;
    }
    public * hasInCommon(privilege: Privilege){
        // Check if we have at least one privilege type in common
        for(const pType of this.privilegeTypes){
            if(privilege.privilegeTypes.has(pType)) yield pType;
        }
    }
    public has(type: PrivilegeType){return this.privilegeTypes.has(type);}
    public marge(privilege: Privilege){
        if(this.has(PrivilegeType.All)) {
            this.privilegeTypes = new Set(privilege.privilegeTypes);
            return;
        }

        for(const p of this.privilegeTypes){
            if(!privilege.has(p)) this.privilegeTypes.delete(p);
        }

        if(this.privilegeTypes.size <= 0) this.privilegeTypes.add(PrivilegeType.None);
    }
    public addPriviledgeType(priviledgeType: PrivilegeType){
        // Add new PrivilegeType to the set
        this.privilegeTypes.add(priviledgeType);
    }
    public constructor(...privilegeTypes: PrivilegeType[]){this.privilegeTypes = new Set(privilegeTypes);}
}

export class ScopeDefinition {
    // If this method hasDeclaration
    public hasDeclaration: boolean = false;
    // If in the decleration has been used await
    public hasBeenAwaited: boolean = false;
    // Privilege
    public executionPrivilege: Privilege = new Privilege();
    // Symbol
    public symbol?: Type["symbol"];
    // AST Node
    public node: TSESTree.Node;

    public constructor(node: TSESTree.Node){
        this.node = node;
    }
}