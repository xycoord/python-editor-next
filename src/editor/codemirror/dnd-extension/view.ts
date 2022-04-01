/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import { Tree, NodeType } from '@lezer/common';
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { DndStructureSettings } from "./index";
import { skipBodyTrailers } from "../structure-highlighting/doc-util";
import { Positions, DragBlock } from "./blocks";

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

interface Measure {
  blocks: DragBlock[];
}

export const dndStructureView = (settings: DndStructureSettings) =>
  ViewPlugin.fromClass(
    class {
      measureReq: { read: () => Measure; write: (value: Measure) => void };
      overlayLayer: HTMLElement;
      blocks: DragBlock[] = [];
      lShape = settings.shape === "l-shape";

      constructor(readonly view: EditorView) {
        this.measureReq = {
          read: this.readBlocks.bind(this),
          write: this.drawBlocks.bind(this),
        };
        this.overlayLayer = view.scrollDOM.appendChild(
          document.createElement("div")
        );
        this.overlayLayer.className = "cm-cs--dnd-layer";
        this.overlayLayer.setAttribute("aria-hidden", "true");

        this.overlayLayer.id = "dnd-overlay-layer"
        this.overlayLayer.setAttribute("dnd-pointer-events", "all") 

        view.requestMeasure(this.measureReq);
      }

      update(update: ViewUpdate) {
        // We can probably limit this but we need to know when the language state has changed as parsing has occurred.
        this.view.requestMeasure(this.measureReq);
      }

      readBlocks(): Measure {
        let cursorFound = false;

        const positionsForNode = (
          view: EditorView,
          start: number,
          end: number,
          depth: number,
          body: boolean
        ) => {
          const state = view.state;
          const leftEdge =
            view.contentDOM.getBoundingClientRect().left -
            view.scrollDOM.getBoundingClientRect().left;
          const indentWidth =
            state.facet(indentUnit).length * view.defaultCharacterWidth;

          let topLine = view.visualLineAt(start);
          if (body) {
            topLine = view.visualLineAt(topLine.to + 1);
          }
          const top = topLine.top;
          const bottomLine = view.visualLineAt(
            skipBodyTrailers(state, end - 1)
          );
          const bottom = bottomLine.bottom;
          const height = bottom - top;
          const leftIndent = depth * indentWidth;
          const left = leftEdge + leftIndent;
          const mainCursor = state.selection.main.head;
          const cursorActive =
            !cursorFound &&
            mainCursor >= topLine.from &&
            mainCursor <= bottomLine.to;
          if (cursorActive) {
            cursorFound = true;
          }
          return new Positions(top, left, height, cursorActive);
        };

        const view = this.view;
        const { state } = view;

        const bodyPullBack = this.lShape && settings.background !== "none";
        const blocks: DragBlock[] = [];
        // We could throw away blocks if we tracked returning to the top-level or started from
        // the closest top-level node. Otherwise we need to render them because they overlap.
        // Should consider switching to tree cursors to avoid allocating syntax nodes.
        let depth = 0;
        const tree: Tree = syntaxTree(state);

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
            // Draw an l-shape for each run of non-Body (e.g. keywords, test expressions) followed by Body in the child list.
            let runStart = 0;
            for (let i = 0; i < children.length; ++i) {
              if (children[i].name === "Body") {
                const startNode = children[runStart];
                const bodyNode = children[i];

                const parentPositions = this.lShape
                  ? positionsForNode(
                    view,
                    startNode.start,
                    bodyNode.start,
                    depth,
                    false
                  )
                  : undefined;
                const bodyPositions = positionsForNode(
                  view,
                  bodyNode.start,
                  bodyNode.end,
                  depth + 1,
                  true
                );
                blocks.push(
                  new DragBlock(
                    bodyPullBack,
                    parentPositions,
                    bodyPositions,
                    undefined,
                    view,
                    undefined,
                    startNode.start,
                    bodyNode.end
                  )
                );
                runStart = i + 1;
              }
            }
            if (!this.lShape) {
              // Draw a box for the parent compound statement as a whole (may have multiple child Bodys)
              const parentPositions = positionsForNode(
                view,
                start,
                end,
                depth,
                false
              );
              blocks.push(
                new DragBlock(bodyPullBack, parentPositions, undefined, undefined, view, undefined, start, end)
              );
            }
          }
          if (grammarInfo.smallStatements.has(type.name)) {
            const statementPositions = positionsForNode(
              view,
              start,
              end,
              depth,
              false
            )
            blocks.push(
              new DragBlock(
                false,
                undefined,
                statementPositions,
                true,
                view,
                undefined,
                start,
                end
              )
            )
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

        if (tree) {
          tree.iterate({
            enter: onEnterNode,
            leave: onLeaveNode,
          });
        }
        return { blocks: blocks.reverse() };
      }

      drawBlocks({ blocks }: Measure) {
        const blocksChanged =
          blocks.length !== this.blocks.length ||
          blocks.some((b, i) => !b.eq(this.blocks[i]));
        if (blocksChanged) {
          this.blocks = blocks;

          const pointerEvents = this.overlayLayer.getAttribute("dnd-pointer-events") === "all" 
          // Should be able to adjust old elements here if it's a performance win.
          this.overlayLayer.textContent = "";
          for (const b of blocks) {
            for (const e of b.draw(pointerEvents)) {
              this.overlayLayer.appendChild(e);
            }
          }
        }
      }

      destroy() {
        this.overlayLayer.remove();
      }
    }
  );
