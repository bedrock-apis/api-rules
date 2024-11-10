import {BlockPermutation} from "@minecraft/server";

function test(){
    BlockPermutation.resolve("bedrock");
    

    const a = BlockPermutation;
    const fakeResolve = a.resolve;
    
    a.resolve("text");
    
    test();
    
    fakeResolve("text");
}