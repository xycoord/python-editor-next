import { debug as dndDebug, setDragContext } from "../../editor/codemirror/dnd";
import { gutter, GutterMarker } from "@codemirror/gutter";
import {EditorView} from "@codemirror/view"

const handleElement = new class extends GutterMarker {
  toDOM() { 
    const markerNode = document.createElement("span") 
    markerNode.innerText = "⸭" 
    markerNode.draggable = true
    return markerNode
  }
}

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
        view.dispatch({
          changes: {from: line.from, to: line.to}
        })

        dndDebug("dragstart");

        //magic line to tell dnd.ts to handle the previews and drop
        setDragContext({
          code: lineCode,
          type: "example", //not sure what this is for
          id: "pSlug"      //or this
        });

        //must return false to let the drop be handled
        return false
      },
      drop(view, block, event) {
        dndDebug("dragend");
        //reset the dnd.ts draging
        setDragContext(undefined);
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

export {dndHandleGutter}