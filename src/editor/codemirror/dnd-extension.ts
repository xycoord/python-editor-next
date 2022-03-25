import { gutter, GutterMarker } from "@codemirror/gutter";
import { handleDragStart, handleDrop } from "./dnd-event-handlers";
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

export { dndHandleGutter }