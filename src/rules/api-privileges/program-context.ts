import {Node, Program, SourceFile} from "typescript";
import { ProgramFile } from "./program-file";

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
     * @param program TS Program Source
     */
    public constructor(program: Program){
        this.program = program;
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