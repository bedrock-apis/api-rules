//import * as ts from 'typescript';

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Enforces type checking on closures",
      category: "Best Practices",
      recommended: true
    },
    schema: []
  },
  create(context) {
    //const parserServices = context.parserServices;
    /*if (!parserServices || !parserServices.program) {
      console.error("Faild to load " + import.meta.filename);
      return {}; 
      // If parserServices is not available, return an empty object
    }
    //const checker = parserServices.program.getTypeChecker();
    */
    console.log("Done!!:");
    return {
      Identifier(node) {
        /*
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);
        const typeName = checker.typeToString(type);
        */
        context.report({
          node,
          message: `Identifier '${node.name}' has type: ${"LMAO HAHAHA"}`
        });
      }
    };
  }
};
