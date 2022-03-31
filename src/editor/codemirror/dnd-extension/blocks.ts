import { handleDragStart, handleDrop } from "./event-handlers"
import { BlockInfo, EditorView } from "@codemirror/view"

/**
 * A CoreMirror view extension providing structural highlighting using
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
 * This class is responsible for drawing the highlighting.
 */
export class DragBlock {
  constructor(
    readonly bodyPullBack: boolean,
    readonly parent?: Positions,
    readonly body?: Positions,
    readonly isStatement?: boolean,
    readonly view?: EditorView,
    readonly block?: BlockInfo,
    readonly start?: number,
    readonly end?: number
  ) { }

  draw() {
    let dragger: HTMLElement | undefined;
    let statementDragger: HTMLElement | undefined;
    let parentDragger: HTMLElement | undefined;
    let active = this.parent?.cursorActive || this.body?.cursorActive;
    let activeClassname = active ? "cm-cs--active" : undefined;
    if (this.parent && this.body) {
      if (activeClassname) {
        dragger = draggableBlockWithClass("cm-cs--dnd-dragblock", activeClassname);
      }
      parentDragger = draggableBlockWithClass("cm-cs--dnd-dragparent", activeClassname)
    }
    if (this.isStatement) {
      statementDragger = draggableBlockWithClass("cm-cs--dnd-dragline", activeClassname)
    }
    this.adjust(dragger, statementDragger, parentDragger);
    const elements = [dragger, statementDragger, parentDragger].filter(Boolean) as HTMLElement[];
    return elements;
  }

  adjust(dragger?: HTMLElement, statementDragger?: HTMLElement, parentDragger?: HTMLElement) {
    // Optionally allows nested compound statements some breathing space
    const bodyPullBack = this.bodyPullBack ? 3 : 0;
    if (this.parent && this.body && dragger) {
      dragger.style.width = (this.body.left - this.parent.left) / 2 - bodyPullBack + "px";
      dragger.style.top = this.parent.top + "px";
      dragger.style.height = this.parent.height + this.body.height + "px";

      dragger.style.left = `calc(95% - ${this.body.left - bodyPullBack}px)`;
      dragger.onclick = function() {
        dragger.style.backgroundColor = dragger.style.backgroundColor === "gray" ? "orange" : "gray";
        return false;
      }
    }
    if (this.body && this.isStatement && statementDragger) {
      statementDragger.style.width = 'calc(20%)';
      // different statements should be separated by one pixel
      statementDragger.style.top = this.body.top + 1 + "px";
      statementDragger.style.height = this.body.height - 2 + "px";
      statementDragger.style.left = `calc(0%)`;
      statementDragger.onclick = function() {
        statementDragger.style.backgroundColor = statementDragger.style.backgroundColor === "green" ? "purple" : "green";
        return false;
      }
      statementDragger.ondragstart = () => {
        if (this.view && this.start && this.end) {
          handleDragStart(this.view, this.start, this.end);
        }
      }
      statementDragger.ondrop = () => {
        if (this.view) {
          handleDrop(this.view);
        }
      }
    }
    if (this.parent && this.body && parentDragger) {
      parentDragger.style.width = 'calc(20%)';
      // different statements should be separated by one pixel 
      parentDragger.style.top = this.parent.top + 1 + "px";
      parentDragger.style.height = this.parent.height - 2 + "px";
      parentDragger.style.left = `calc(0%)`;
      parentDragger.onclick = function() {
        parentDragger.style.backgroundColor = parentDragger.style.backgroundColor === "blue" ? "red" : "blue";
        return false;
      }
      parentDragger.ondragstart = () => {
        if (this.view && this.start && this.end) {
          // When it is a code block the end includes the start of next line, we don't want to move the next line.
          handleDragStart(this.view, this.start, this.end - 1);
        }
      }
      parentDragger.ondrop = () => {
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
