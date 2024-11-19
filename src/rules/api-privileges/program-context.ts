import {Node, Program, SourceFile, TypeChecker} from "typescript";
import { ProgramFile } from "./program-file";
import { ParserServicesWithTypeInformation, TSESTree } from "@typescript-eslint/utils";

export class ProgramContext{
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
    public getType(node: Node){
        return this.checker.getTypeAtLocation(node);
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

        yield * file.resolve();

        //All was successful
        return true;
    }
}