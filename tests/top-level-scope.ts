import { BlockPermutation } from "@minecraft/server";


// SHOULD ERROR
// REQUIRE PRIVILEGE
BlockPermutation.resolve("bedrock");

RESOLVE("Text");

await null;

// SHOULDN'T ERROR
// DEFAULT PRIVILEGE
BlockPermutation.resolve("bedrock");

export const RES = BlockPermutation.resolve;
/**
 * @api_privilege [early_execution]
 */
export function RESOLVE(test: string){
    BlockPermutation.resolve(test);
}