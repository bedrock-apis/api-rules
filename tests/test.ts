import {BlockPermutation} from "@minecraft/server";

// Should Error
MethodCallsAPI();

// No Error
EmptyMethod();

// Should Error as it calls MethodCallsAPI
MethodCallsMethodThatCallsAPI();

// Shouldn't Error as it calls MethodCallsAPI after await expression
MethodThatAwaitsAndCallsMethodThatCallsAPI();
await null;
MethodCallsAPI();

function MethodCallsMethodThatCallsAPI(){
    MethodCallsAPI();
}

function EmptyMethod(){}

async function MethodThatAwaitsAndCallsMethodThatCallsAPI(){
    await null;
    MethodCallsAPI();
}

function MethodCallsAPI(){
    BlockPermutation.resolve("bedrock");
    
    // Recursive
    MethodCallsAPI();
}