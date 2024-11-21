import {Node, Program, SourceFile, Symbol, TypeChecker} from "typescript";
import { ProgramFile } from "./program-file";
import { ParserServicesWithTypeInformation, TSESTree } from "@typescript-eslint/utils";
import { ProgramMethodSymbol } from "./program-method-symbol";
import { PrivilegeType } from "../../privileges";

export class ProgramContext{
    public readonly metadata: WeakMap<Symbol, ProgramMethodSymbol> = new WeakMap();

    /**
     * Cached files
     */
    public readonly programFiles: WeakMap<SourceFile, ProgramFile> = new WeakMap();
    /**
     * TS Program
     */
    public readonly program: Program;
    /**
     * TS Service
     */
    public readonly service: ParserServicesWithTypeInformation;
    /**
     * TS Checker
     */
    public readonly checker: TypeChecker;
    /**
     * @param program TS Program Source
     */
    public constructor(program: Program, service: ParserServicesWithTypeInformation){
        this.program = program;
        this.service = service;
        this.checker = service.program.getTypeChecker();
    }

    public getType(node: Node){ return this.checker.getTypeAtLocation(node); }
    public getSymbol(node: Node){ return this.checker.getSymbolAtLocation(node)??null; }
    public getMethodSymbol(symbol: Symbol){ return this.metadata.get(symbol)??null; }

    public getOrCreateMethodSymbolFromSymbolsJSDocs(symbol: Symbol): ProgramMethodSymbol {
        let mSymbol = this.getMethodSymbol(symbol);
        // Maybe it wa already 
        if(mSymbol) return mSymbol;
        mSymbol = new ProgramMethodSymbol(symbol);

        for(const tag of symbol.getJsDocTags()){
            if(tag.name.toLocaleLowerCase() === "apiprivilege"){
                console.log("resolved for: " + symbol.name);
                mSymbol.resolvablePrivilege.addPrivilegeType(PrivilegeType.ReadOnly);
            }
        }


        this.metadata.set(symbol, mSymbol);

        return mSymbol;
    }
    
    /**
     * @param src Source file to resolve 
     * @returns Iterator of nodes and diagnostics
     */
    public * resolve(src: SourceFile): Generator<Node, boolean>{
        let srcFile: SourceFile | undefined = src; 
        srcFile = this.program.getSourceFile(src.fileName);
        
        //Check if the source file is valid and its part of this context
        if(!srcFile) return false;
        
        //Try to get this source file
        let file = this.programFiles.get(srcFile);

        // Create new program file if its the first time
        if(!file) file = new ProgramFile(this, srcFile);

        return yield * file.resolve();;
    }
}