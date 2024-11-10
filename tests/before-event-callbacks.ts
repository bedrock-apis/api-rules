import { world } from "@minecraft/server";

world.beforeEvents.playerBreakBlock.subscribe(async (e)=>{
    e.block.setType("");
    await null;
    e.block.setType("");
});