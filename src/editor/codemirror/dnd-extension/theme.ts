/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";

const draghandle_width = "1.5rem";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  // See DragBlock for the element creation code.
  ".cm-cs--dnd-layer": {
	position: "absolute",
    top: 0,
	  height: "100%",
    width: "100%",
	  margin: "auto",
    left: "95px", 
    zIndex: 10,
    pointerEvents: "none"
  },
  ".cm-cs--dnd-dragline": {
    display: "block",
    position: "absolute",
    backgroundColor: "green",
    width: draghandle_width 
  },
  ".cm-cs--dnd-dragblock": {
    display: "block",
    position: "absolute",
    backgroundColor: "blue",
    width: draghandle_width  
  },
  ".cm-cs--pointer-events-all": {
    pointerEvents: "all"
  },
  ".cm-cs--pointer-events-none": {
    pointerEvents: "none"
  },
  ".cm-cs--layer": {
    left: draghandle_width
  }
});

//using theme here seems dodgy, it is needed to superseed default padding:0
export const theme = EditorView.theme({
  ".cm-content": {
    paddingLeft: draghandle_width
  }
});