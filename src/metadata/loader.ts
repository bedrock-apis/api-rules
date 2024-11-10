import { MetadataModuleDefinition, PrivilegeType } from './metadata-definition';

const BRANCH = "preview"
const BDS_DOCS = `https://raw.githubusercontent.com/Bedrock-APIs/bds-docs/${BRANCH}`;
const EXISTS_FILE = "exist.json";

/** [moduleName]: MetadataModule */
type ModuleMetadataMap = Record<string, ModuleMetadata>;
interface ModuleMetadata {
  /**
   * [ClassName.functionName]: MetadataPriviligedDefinition
   * @example { "BlockPermutation.resolve": { privileges: PrivilegeType[] } }
  */
  functions: Record<string, { privileges: PrivilegeType[] }>;
}

export class MetadataLoader {
  private metadata: ModuleMetadataMap = {};
  
  constructor() {
    const definitions: MetadataModuleDefinition[] = [/** loaded metadatas */];
    for (const definition of definitions) {
      this.createModuleMapping(definition);
    }
    // console.dir(this.metadata, { depth: null });
  }
  

  async fetch(): Promise<(null | object)> {
    // load metadata file
    const response = await fetch([BDS_DOCS, EXISTS_FILE].join("/"));
    
    // Response headers
    if(!response.ok){
      console.error("Failed to fetch module metadata");
      return null;
    }

    // Data Stream
    let rawData = await response.json().catch(e=>null);

    // Check for validity
    if(rawData === null) {
      console.error("Invalid json body");
      return null;
    }

    // Chech for availability
    if(
      !rawData.flags?.includes("METADATA") || 
      !rawData.flags?.includes("SCRIPT_MODULES_MAPPING")
      ) {
      console.error("This generated branch doesn't includes mapped files.");
      return null;
    }

    const MAPPINGS = rawData.SCRIPT_MODULES_MAPPING as {script_modules: string[], script_modules_mapping:{[key: string]: {name:string, uuid: string, versions: string[]}}};

    // Just fail now
    return null;
  }

  hasPrivilege(privilege: PrivilegeType, functionName: string, moduleName: string): boolean {
    const metadataModule = this.metadata[moduleName];
    if (!metadataModule) throw Error(`Module ${moduleName} not found`);

    const metadataFunction = metadataModule.functions[functionName];
    if (!metadataFunction) throw Error(`Function ${functionName} not found in module ${moduleName}`);

    return metadataFunction.privileges.includes(privilege);
  }

  private createModuleMapping(definition: MetadataModuleDefinition) {
    const { functions, classes } = definition;
    const metadataModule: ModuleMetadata = { functions: {} };
    for (const func of functions) {
      metadataModule.functions[func.name] = { privileges: func.privilege.map(p => p.name) };
    }
    for (const cls of classes) {
      for (const func of cls.functions) {
        metadataModule.functions[`${cls.name}.${func.name}`] = { privileges: func.privilege.map(p => p.name) };
      }
    }
    this.metadata[definition.name] = metadataModule;
  } 
}

