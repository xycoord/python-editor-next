/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import { Tree } from '@lezer/common';
import { StructureNode } from './util'
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { DndStructureSettings } from "./index";
import { skipBodyTrailers } from "../structure-highlighting/doc-util";
import { Positions, DragBlock } from "./blocks";
import { iterateOverStructureTree } from "./syntax-tree-iterator"

interface Measure {
  blocks: DragBlock[];
}

export const dndStructureView = (settings: DndStructureSettings) =>
  ViewPlugin.fromClass(
    class {
      measureReq: { read: () => Measure; write: (value: Measure) => void };
      overlayLayer: HTMLElement;
      blocks: DragBlock[] = [];
      indentHandles = settings.indentHandles;
      dragSmallStatements = settings.dragSmallStatements;

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
        const {state} = view;

        const blocks: DragBlock[] = [];

        const addSmallStatementHandle = 
          (start: number, end:number, depth:number) => {
            //this if should really be on the definition of the function
            if(this.dragSmallStatements) {
            const statementPositions = positionsForNode(
              view,
              start,
              end,
              depth,
              false
            )
            blocks.push(
              new DragBlock(
                undefined,
                statementPositions,
                true,
                view,
                start,
                end
              )
            )
            }
          }
          
        const addCompoundStatementHandle =
          (startNode: StructureNode, bodyNode: StructureNode, depth: number) => {
            const parentPositions = 
                  positionsForNode(
                    view,
                    startNode.start,
                    bodyNode.start,
                    depth,
                    false
                  );

                // Where should the body block go?
                const bodyPositions =
                  positionsForNode(
                    view,
                    bodyNode.start,
                    bodyNode.end,
                    depth + 1,
                    true
                  );

                // Create block and register it
                blocks.push(
                  new DragBlock(
                    parentPositions,
                    bodyPositions,
                    undefined,
                    view,
                    startNode.start,
                    bodyNode.end
                  )
                );
          }

        // We could throw away blocks if we tracked returning to the top-level or started from
        // the closest top-level node. Otherwise we need to render them because they overlap.
        // Should consider switching to tree cursors to avoid allocating syntax nodes.
        const tree: Tree = syntaxTree(state);

        if (tree) {
          iterateOverStructureTree(addSmallStatementHandle, addCompoundStatementHandle, tree)
        }
        return { blocks: blocks.reverse() };
      }

      drawBlocks({ blocks }: Measure) {
        // Update the height of the DOM
        if (this.overlayLayer.parentElement){
          this.overlayLayer.style.height = '0px';
          this.overlayLayer.style.height = this.overlayLayer.parentElement.scrollHeight+"px";
        }
        console.log("drawBlocks!")
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
