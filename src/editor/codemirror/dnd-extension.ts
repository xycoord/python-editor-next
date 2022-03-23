import { debug as dndDebug, setDragContext } from "./dnd";
import { gutter, GutterMarker } from "@codemirror/gutter";
import { EditorView } from "@codemirror/view"
import { ChangeSet, Transaction } from "@codemirror/state";
import { debug } from "console";

const handleElement = new class extends GutterMarker {
  toDOM() {
    const markerNode = document.createElement("span")
    markerNode.innerText = "⸭"
    markerNode.draggable = true
    return markerNode
  }
}

// Very ugly way to check whether item was successfully 
let dropped = false;
let notDroppedUndo: ChangeSet | undefined;

const dndHandleGutter = [
  gutter({
    class: "cm-dnd-gutter",
    lineMarker(view, line) {
      return handleElement
    },
    initialSpacer: () => handleElement,
    domEventHandlers: {
      dragstart(view, block) {

        const line = view.state.doc.lineAt(block.from);
        const lineCode = line.text

        //delete original text, leaves blank line
        //atm this means an extra line is added to the file
        let deleteLineChange = view.state.update(
          {
            changes: { from: line.from, to: Math.min(view.state.doc.length, line.to + 1) }
          }).changes
        notDroppedUndo = deleteLineChange.invert(view.state.doc);

        view.dispatch({
          userEvent: "delete-drag-line",
          changes: deleteLineChange,
          annotations: [Transaction.addToHistory.of(false)],
        })

        dndDebug("dragstart");

        dropped = false;

        //magic line to tell dnd.ts to handle the previews and drop
        setDragContext({
          code: lineCode,
          type: "example",
          id: "pSlug",
          redoToMerge: deleteLineChange,
          undoToMerge: notDroppedUndo,
          dropCallback: () => { dropped = true; }
        });

        //must return false to let the drop be handled
        return false
      },
      dragend(view, block, event) {
        dndDebug("dragend");
        //reset the dnd.ts dragging
        setDragContext(undefined);
        if (!dropped) {
          view.dispatch({
            changes: notDroppedUndo,
            annotations: [Transaction.addToHistory.of(false)],
          })
        }
        return false
      }
    }
  }),
  // Sample code used EditorView.BaseTheme, but that was overriden 
  // so I have used theme directly
  EditorView.theme({
    ".cm-dnd-gutter": {
      // Default gutter width is huge 
      width: "fit-content"
    }
  })
]

export { dndHandleGutter }