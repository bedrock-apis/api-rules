export enum PrivilegeType {
    None = 'none',
    ReadOnly = 'read_only',
    EarlyExecution = 'early_execution',
    All = "all"
}

export class Privilege {
    public static readonly None = ()=>new Privilege(PrivilegeType.None);
    public static readonly All = ()=>new Privilege(PrivilegeType.All);

    public set(privilege: Privilege){
        this.privilegeTypes.clear();
        privilege.privilegeTypes.forEach(this.privilegeTypes.add.bind(this.privilegeTypes));
    }
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
    public merge(privilege: Privilege){
        if(this.has(PrivilegeType.All)) {
            this.privilegeTypes = new Set(privilege.privilegeTypes);
            return;
        }

        for(const p of this.privilegeTypes){
            if(!privilege.has(p)) this.privilegeTypes.delete(p);
        }

        if(this.privilegeTypes.size <= 0) this.privilegeTypes.add(PrivilegeType.None);
    }
    public addPrivilegeType(privilegeType: PrivilegeType){
        if(this.privilegeTypes.has(PrivilegeType.All)){
            this.privilegeTypes.clear();
        }
        // Add new PrivilegeType to the set
        this.privilegeTypes.add(privilegeType);
    }
    public constructor(...privilegeTypes: PrivilegeType[]){this.privilegeTypes = new Set(privilegeTypes);}
    public toString(){return `[Privilege: ${[...this.privilegeTypes].join(", ")}]`}
}