import { Tree, NodeType } from '@lezer/common';
import { StructureNode } from './util'

// Grammar is defined by https://github.com/lezer-parser/python/blob/master/src/python.grammar
const grammarInfo = {
  compoundStatements: new Set([
    "IfStatement",
    "WhileStatement",
    "ForStatement",
    "TryStatement",
    "WithStatement",
    "FunctionDefinition",
    "ClassDefinition",
  ]),
  smallStatements: new Set([
    "AssignStatement",
    "UpdateStatement",
    "ExpressionStatement",
    "DeleteStatement",
    "PassStatement",
    "BreakStatement",
    "ContinueStatement",
    "ReturnStatement",
    "YieldStatement",
    "PrintStatement",
    "RaiseStatement",
    "ImportStatement",
    "ScopeStatement",
    "AssertStatement",
  ]),
};

export const iterateOverStructureTree = 
  ( onSmallStatement: (start:number, end:number, depth:number) => void,
    onCompoundStatement: (startNode:StructureNode, endNode:StructureNode, depth:number)=> void,
    tree: Tree
  ):void => {
    let depth = 0;
    interface Parent{
      name: string;
      children?: { name: string; start: number; end: number }[];
    } 
    const parents: Parent[] = [];
    const onEnterNode = (type: NodeType, _start: number) => {
      parents.push({ name: type.name });
      if (type.name === "Body") {
        depth++;
      }
    }

    const onLeaveNode = (type: NodeType , start: number, end: number) => {
      if (type.name === "Body") {
        depth--;
      }
      const leaving = parents.pop()!;
      const children = leaving.children;

      if (children) {
        let runStart = 0;
        for (let i = 0; i < children.length; ++i) {
          if (children[i].name === "Body") {
            const startNode = children[runStart];
            const bodyNode = children[i];
            onCompoundStatement(startNode, bodyNode, depth)
            runStart = i + 1;
          }
        }
      }

      if (grammarInfo.smallStatements.has(type.name)) {
        onSmallStatement(start, end, depth)              
      }

      // Poke our information into our parent if we need to track it.
      const parent = parents[parents.length - 1];
        if (parent && grammarInfo.compoundStatements.has(parent.name)) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push({ name: type.name, start, end });
        }
      } 

      tree.iterate({
        enter: onEnterNode,
        leave: onLeaveNode,
      });
    }