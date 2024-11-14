// import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { Privilege, PrivilegeType } from '../privileges';
import { MetadataModuleDefinition, MetadataPriviligedDefinition, Privileges } from './metadata-definition';

// metadata source info
const BRANCH = "preview"
const BDS_DOCS = `https://raw.githubusercontent.com/Bedrock-APIs/bds-docs/${BRANCH}`;
const EXISTS_FILE = "exist.json";

const nodeModulesDir = path.join(import.meta.resolve('eslint'), '../../../');
const cacheDir = path.join(nodeModulesDir, '.cache');

/** [moduleName]: MetadataModule */
type ModuleMetadataMap = Record<string, ModuleMetadata>;
interface ModuleMetadata {
  /**
   * [ClassName.functionName]: MetadataPriviligedDefinition
   * @example { "BlockPermutation.resolve": Privilege }
  */
  functions: Record<string, Privilege>;
}

const toPrivilegeType = {
  'none': PrivilegeType.None,
  'read_only': PrivilegeType.ReadOnly,
  'early_execution': PrivilegeType.EarlyExecution,
} as const satisfies Record<Privileges, PrivilegeType>;

export class MetadataLoader {
  private metadata: ModuleMetadataMap = {};
  
  constructor() {
    // const data = JSON.parse(readFileSync(process.cwd() + '/src/metadata/__server_2.0.0-alpha.json', "utf-8"));

    //TODO - Implement load logic to extract metadata from the file
    const definitions: MetadataModuleDefinition[] = [/** loaded metadatas */ /*data*/];
    for (const definition of definitions) {
      // this.createModuleMapping(definition);
    }
    console.log(nodeModulesDir);
    
  }
  
  //TODO - Implement fetch method
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

  getPrivilege(moduleName: string, functionName: string): Privilege {
    const metadataModule = this.metadata[moduleName];
    if (!metadataModule) throw Error(`Metadata for module ${moduleName} not found`);
    const privilege = metadataModule.functions[functionName];
    if (!privilege) throw Error(`Metadata for symbol ${functionName} not found`);
    return privilege;
  }

  private createModuleMapping(definition: MetadataModuleDefinition) {
    const { functions, classes } = definition;
    
    const metadataModule: ModuleMetadata = { functions: {} };
    for (const func of functions) {
      metadataModule.functions[func.name] = this.createPrivilege(func);
    }
    for (const cls of classes) {
      for (const func of cls.functions) {
        metadataModule.functions[`${cls.name}.${func.name}`] = this.createPrivilege(func);
      }
    }
    this.metadata[definition.name] = metadataModule;
  } 

  private createPrivilege(privilege: MetadataPriviligedDefinition): Privilege {
    return new Privilege(...privilege.privilege.map(p => toPrivilegeType[p.name]));
  }
}
