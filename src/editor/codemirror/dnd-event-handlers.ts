import { BlockInfo, EditorView } from "@codemirror/view"
import { ChangeSet, Transaction } from "@codemirror/state";
import { debug as dndDebug, setDragContext } from "./dnd";

// Very ugly way to check whether item was successfully 
let dropped = false;
let notDroppedUndo: ChangeSet | undefined;

const handleDragStart = (view: EditorView, block: BlockInfo) => {
  const draggedText = view.state.doc.sliceString(block.from, block.to) 

  let deleteLineChange = view.state.update({
    changes: { 
      from: block.from, 
      to: Math.min(view.state.doc.length, block.to + 1) 
    }
  }).changes
  notDroppedUndo = deleteLineChange.invert(view.state.doc);

  view.dispatch({
    userEvent: "delete-drag-line",
    changes: deleteLineChange,
    annotations: [Transaction.addToHistory.of(false)],
  })

  dropped = false

  dndDebug("dragstart")

  //magic line to tell dnd.ts to handle the previews and drop
  setDragContext({
    code: draggedText,
    type: "example",
    id: "pSlug",
    redoToMerge: deleteLineChange,
    undoToMerge: notDroppedUndo,
    dropCallback: () => { dropped = true; }
  });

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
}

export {handleDragStart, handleDrop}