/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChangeSet, Extension, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { flags } from "../../flags";
import { dndDecorations } from "./dnd-decorations";
import "./dnd.css";
import { calculateChanges } from "./edits";
import { deployment } from "../../deployment";

export const debug = (message: string, ...args: any) => {
  if (flags.dndDebug) {
    console.log(message, ...args);
  }
};

/**
 * Information stashed last time we handled dragover.
 * Cleared on drop or dragleave.
 */
interface LastDragPos {
  /**
   * The last drag position.
   */
  pos: number;
  line: number;
  /**
   * The inverse set of changes to the changes made for preview.
   */
  previewUndo: ChangeSet;
}

export type CodeInsertType =
  /**
   * A potentially multi-line example snippet.
   */
  | "example"
  /**
   * Rearragement of code by dragging and dropping in the editor.
   */
  | "rearrangement"
  /**
   * A function call.
   */
  | "call";

export interface DragContext {
  code: string;
  type: CodeInsertType;
  id?: string;
  undoToMerge?: ChangeSet;
  redoToMerge?: ChangeSet;
  dropCallback?: () => void;
}

let dragContext: DragContext | undefined;

/**
 * Set the dragged code.
 *
 * There's no access to the content via the event in dragover (as it may be cross-document),
 * we use that event to draw a preview, so we need shared state with the drag.
 *
 * Set it in dragstart and clear it in dragend.
 */
export const setDragContext = (context: DragContext | undefined) => {
  dragContext = context;
};

// We add the class to the parent element that we own as otherwise CM
// will remove it when it re-renders. Might be worth replacing this
// with a CM compartment with the style.
const findWrappingSection = (view: EditorView) => {
  let e: HTMLElement | null = view.contentDOM;
  while (e && e.localName !== "section") {
    e = e.parentElement;
  }
  if (!e) {
    throw new Error("Unexpected DOM structure");
  }
  return e;
};

const suppressChildDragEnterLeave = (view: EditorView) => {
  findWrappingSection(view).classList.add("cm-drag-in-progress");
};

const clearSuppressChildDragEnterLeave = (view: EditorView) => {
  findWrappingSection(view).classList.remove("cm-drag-in-progress");
};


const dndHandlers = () => {
  let lastDragPos: LastDragPos | undefined;
  let lastTransaction: Transaction | undefined;

  const revertPreview = (view: EditorView) => {
    if (lastDragPos) {
      view.dispatch({
        userEvent: "dnd.cleanup",
        changes: lastDragPos.previewUndo,
        annotations: [Transaction.addToHistory.of(false)],
      });
      lastDragPos = undefined;
    }
  };

  return [
    EditorView.domEventHandlers({
      dragover(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }

        if (dragContext) {
          event.preventDefault();

          const visualLine = view.visualLineAtHeight(event.y);
          const line = view.state.doc.lineAt(visualLine.from);
          const pos = view.posAtCoords(event, false);

          if (line.number !== lastDragPos?.line || pos !== lastDragPos?.pos) {
            debug("  dragover", line);
            revertPreview(view);

            lastTransaction = calculateChanges(
              view.state,
              dragContext.code,
              dragContext.type,
              line.number,
              pos
            );
            lastDragPos = {
              pos: pos,
              line: line.number,
              previewUndo: lastTransaction.changes.invert(view.state.doc),
            };
            // Take just the changes, skip the selection updates we perform on drop.
            view.dispatch({
              userEvent: "dnd.preview",
              changes: lastTransaction.changes,
              annotations: [Transaction.addToHistory.of(false)],
            });
          }
        }
      },
      dragenter(event, view) {
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        debug("dragenter");
        event.preventDefault();
        suppressChildDragEnterLeave(view);
      },
      dragleave(event, view) {
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        document.getElementById("dnd-underlay-layer")!.innerHTML = ""

        if (event.target === view.contentDOM) {
          event.preventDefault();
          clearSuppressChildDragEnterLeave(view);
          revertPreview(view);
          lastTransaction = undefined;
          debug(
            "  dragleave",
            {
              x: event.clientX,
              y: event.clientY,
            },
            event.target
          );
        } else {
          debug(
            "  dragleave (ignored)",
            {
              x: event.clientX,
              y: event.clientY,
            },
            event.target
          );
        }
      },
      drop(event, view) {
        if (dragContext && dragContext.dropCallback) {
          dragContext.dropCallback();
        }

        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }

        deployment.logging.event({
          type: "code-drop",
          message: dragContext.id,
        });
        debug("  drop");
        clearSuppressChildDragEnterLeave(view);
        event.preventDefault();

        const visualLine = view.visualLineAtHeight(event.y);
        const line = view.state.doc.lineAt(visualLine.from);

        revertPreview(view);

        // To have a single undo event, we need to undo the undo actions and then 
        // compose the redo actions and the drop action into a single ChangeSet.
        if (dragContext.undoToMerge) {
          view.dispatch({
            userEvent: "dnd-undo",
            changes: dragContext?.undoToMerge,
            annotations: [Transaction.addToHistory.of(false)],
          })
        }

        let changes;
        if (lastTransaction && dragContext.redoToMerge) {
          console.log("yay");
          changes = dragContext.redoToMerge.compose(lastTransaction.changes);
        }

        //make changes
        view.dispatch({
          userEvent: `dnd.drop.${dragContext.type}`,
          changes: changes,
          selection: lastTransaction?.selection,
        });
        view.focus();

        lastTransaction = undefined;
      },
    }),
  ];
};

/**
 * Support for dropping code snippets.
 *
 * Note this requires coordination from the drag end via {@link setDraggedCode}.
 */
export const dndSupport = (): Extension => [dndHandlers(), dndDecorations()];
