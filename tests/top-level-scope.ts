import { BlockPermutation } from "@minecraft/server";


// SHOULD ERROR
// REQUIRE PRIVILEGE
BlockPermutation.resolve("bedrock");

await null;

// SHOULDN'T ERROR
// DEFAULT PRIVILEGE
BlockPermutation.resolve("bedrock");

export const RES = BlockPermutation.resolve;

export function RESOLVE(test: string){
    BlockPermutation.resolve(test);
}