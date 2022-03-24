import { debug as dndDebug, setDragContext } from "./dnd";
import { gutter, GutterMarker } from "@codemirror/gutter";
import { BlockInfo, EditorView } from "@codemirror/view"
import { ChangeSet, Transaction } from "@codemirror/state";
import "./dnd-extension.css"

const preventDefaultHandler = true

const dndHandleGutter = gutter({
  class: "cm-dnd-gutter",
  lineMarker(view, line) {
    return handleElement
  },
  initialSpacer: () => handleElement,
  domEventHandlers: {
    dragstart(view, block) {
      handleDragStart(view, block)
      return !preventDefaultHandler 
    },
    dragend(view, block) {
      handleDrop(view)
      return !preventDefaultHandler
    }
  }
})

const handleElement = new class extends GutterMarker {
  toDOM() {
    const markerNode = document.createElement("span")
    markerNode.innerText = "⸭"
    markerNode.draggable = true
    markerNode.className = "cm-dnd-handle-element"
    return markerNode
  }
}()

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

export { dndHandleGutter }