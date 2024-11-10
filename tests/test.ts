import {BlockPermutation} from "@minecraft/server";

test();
bob();
await null;
test();


function test(){
    BlockPermutation.resolve("bedrock");
    

    const a = BlockPermutation;
    const fakeResolve = a.resolve;
    
    a.resolve("text");
    
    test();
    
    fakeResolve("text");
}

function bob(){

}