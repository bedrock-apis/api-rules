import { world } from "@minecraft/server";

world.beforeEvents.playerBreakBlock.subscribe((e)=>{
    e.block.setPermutation("");
    await null;
    e.block.setPermutation("");
});