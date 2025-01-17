import { handleDragStart, handleDrop } from "./event-handlers"
import { EditorView } from "@codemirror/view"
import { DragHandleIcon } from "@chakra-ui/icons";
import * as ReactDOM from 'react-dom';
import { makeShadow } from "../dnd-shadows";

/**
 * A CoreMirror view extension providing blocks for dragging and dropping using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export class Positions {
  constructor(
    public top: number,
    public left: number,
    public height: number,
    public cursorActive: boolean
  ) { }
  eq(other: Positions) {
    return (
      this.top === other.top &&
      this.left === other.left &&
      this.height === other.height &&
      this.cursorActive === other.cursorActive
    );
  }
}

/**
 * A block representing a nested body and it's parent in with
 * DOM pixel locations.
 *
 * Both parent and body are defined for l-shapes, with the exception
 * that the body will be omitted if it's on the same line as the parent.
 *
 * For box presentations either the parent or the body will be defined.
 * In this case the parent is the entire compound statement rather than
 * a branch.
 *
 * This class is responsible for drawing the blocks used for dragging.
 */
export class DragBlock {
  constructor(
    readonly parent?: Positions,
    readonly body?: Positions,
    readonly isStatement?: boolean,
    readonly view?: EditorView,
    readonly start?: number,
    readonly end?: number
  ) { }


  draw(pointerEvents: boolean) {
    let statementDragger: HTMLElement | undefined;
    let blockDragger: HTMLElement | undefined;

    const pointerEventsCN = pointerEvents ? "cm-cs--pointer-events-all" : "cm-cs--pointer-events-none";

    if (this.parent && this.body) {
      blockDragger = draggableBlockWithClass("cm-cs--dnd-dragblock", pointerEventsCN)
    }
    if (this.isStatement) {
      statementDragger = draggableBlockWithClass("cm-cs--dnd-dragline", pointerEventsCN)
    }
    this.adjust(statementDragger, blockDragger);
    const elements = [statementDragger, blockDragger].filter(Boolean) as HTMLElement[];
    return elements;
  }

  adjust(statementDragger?: HTMLElement, blockDragger?: HTMLElement) {
    const dragHandleIcon = <DragHandleIcon
        boxSize={12}
        color={"var(--chakra-colors-code-blockBorder)"}
        transition="color .2s"
      />

    // Create a DragBlock for moving a simple statement
    if (this.body && this.isStatement && statementDragger) {
      // different statements should be separated by one pixel
      statementDragger.style.top = this.body.top + "px";
      statementDragger.style.height = this.body.height + 2 + "px";
      statementDragger.style.left = this.body.left - 99 + "px";
      
      ReactDOM.render(dragHandleIcon, statementDragger)

      statementDragger.ondragstart = () => {
        if (this.view && this.start && this.end) {
          handleDragStart(this.view, this.start, this.end);
        }
      }
      statementDragger.ondragend = () => {
        if (this.view) {
          handleDrop(this.view);
        }
      }
    }

    // Create a DragBlock for moving a simple statement
    if (this.parent && this.body && blockDragger) {
      // different statements should be separated by one pixel 
      blockDragger.style.top = this.parent.top + "px";
      blockDragger.style.height = this.parent.height + 2 + "px";
      blockDragger.style.left = this.parent.left - 99 + "px";
      
      ReactDOM.render(dragHandleIcon, blockDragger)

      let underlayLayer = document.getElementById("dnd-underlay-layer")

      blockDragger.onpointerdown = () => {
        if(this.view && underlayLayer && this.start && this.end){
          let state = this.view.state
          makeShadow (this.view, state, true, false, underlayLayer, this.start, this.end)
        }
      }

      blockDragger.onpointerup = () => {
        if(this.view && underlayLayer && this.start && this.end){
          makeShadow (this.view, this.view.state, false, true, underlayLayer, this.start, this.end)
        }
      }

      blockDragger.ondragstart = (e) => {
        if (this.view && this.start && this.end) {
          var crt = blockDragger.cloneNode(true) as HTMLElement;
          crt.style.display = "none"; /* or visibility: hidden, or any of the above */
          document.body.appendChild(crt);
          if(e.dataTransfer) e.dataTransfer.setDragImage(crt, 0, 0);

          // When it is a code block the end includes the start of next line, we don't want to move the next line.
          handleDragStart(this.view, this.start, this.end - 1);
        }
      }
      blockDragger.ondragend = () => {
        if (this.view) {
          handleDrop(this.view);
        }
      }
    }
  }

  eq(other: DragBlock) {
    return equals(this.body, other.body) && equals(this.parent, other.parent);
  }
}

const draggableBlockWithClass = (...classNames: (string | undefined)[]) => {
  const element = document.createElement("div");
  element.className = classNames.join(" ");
  element.draggable = true;

  return element;
};

const equals = (a?: Positions, b?: Positions) => {
  if (!a || !b) {
    return !a && !b;
  }
  return a.eq(b);
};
