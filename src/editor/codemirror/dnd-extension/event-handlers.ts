import { EditorView } from "@codemirror/view"
import { ChangeSet, Transaction } from "@codemirror/state";
import { debug as dndDebug, setDragContext } from "../dnd";

// Very ugly way to check whether item was successfully dropped
let dropped = false;
let notDroppedUndo: ChangeSet | undefined;

const handleDragStart = (view: EditorView, start: number, end: number) => {
  console.log(`${start}, ${end}`)
  const startLineStart = view.state.doc.lineAt(start).from
  const endLineEnd = Math.min(
    view.state.doc.length,
    view.state.doc.lineAt(end).to + 1
  )

  const draggedText = view.state.doc.sliceString(startLineStart, endLineEnd)

  let deleteBlockChange = view.state.update({
    changes: { from: startLineStart, to: endLineEnd }
  }).changes
  notDroppedUndo = deleteBlockChange.invert(view.state.doc);

  view.dispatch({
    userEvent: "delete-drag-block",
    changes: deleteBlockChange,
    annotations: [Transaction.addToHistory.of(false)],
  })

  dropped = false

  dndDebug("dragstart")

  setDragContext({
    code: draggedText,
    type: "rearrangement",
    id: "pSlug", // What does this do?
    redoToMerge: deleteBlockChange,
    undoToMerge: notDroppedUndo,
    dropCallback: () => { dropped = true; }
  });

  const dndOverlayLayer = document.getElementById("dnd-overlay-layer")
  if (dndOverlayLayer) {
    dndOverlayLayer.classList.remove("dnd-pointer-events") 
  }

}

const handleDrop = (view: EditorView) => {
  dndDebug("dragend");
  //reset the dnd.ts dragging
  setDragContext(undefined);
  if (!dropped) {
    view.dispatch({
      changes: notDroppedUndo,
      annotations: [Transaction.addToHistory.of(false)],
    })
  }
  const dndOverlayLayer = document.getElementById("dnd-overlay-layer")
  if (dndOverlayLayer) {
    dndOverlayLayer.classList.add("dnd-pointer-events") 
  }
}

export { handleDragStart, handleDrop }
