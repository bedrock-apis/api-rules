import { Program, SourceFile, Symbol, TypeChecker } from "typescript";
import { Privilege } from "../../privileges";
import { ProgramFile } from "./program-file";
import { ProgramDiagnosticsReport } from "./diagnostics";
import { ParserServicesWithTypeInformation } from "@typescript-eslint/utils";

export class ProgramContext{

    public readonly files = new Map<SourceFile, ProgramFile>();
    public readonly resolvedPrivileges = new Map<Symbol, Privilege>();
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
    public reportDiagnostics(diagnostics: ProgramDiagnosticsReport){
        const file = this.openFile(diagnostics.node.getSourceFile());
        file.diagnostics.set(diagnostics.node, diagnostics);
    }
    public openFile(srcFile: SourceFile){
        let file = this.files.get(srcFile);
        if(!file) this.files.set(srcFile, file = new ProgramFile(srcFile, this));
        return file;
    }
}