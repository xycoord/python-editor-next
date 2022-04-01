/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  // See DragBlock for the element creation code.
  ".cm-cs--dnd-layer": {
    position: "absolute",
    top: 0,
	  left: "90%",
    height: "100%",
    width: "10%",
    zIndex: 10,
    pointerEvents: "none"
  },
  ".cm-cs--dnd-dragline": {
    display: "block",
    position: "absolute",
    backgroundColor: "green",
  },
  ".cm-cs--dnd-dragparent": {
    display: "block",
    position: "absolute",
    backgroundColor: "blue",
  },
  ".cm-cs--pointer-events-all": {
    pointerEvents: "all"
  },
  ".cm-cs--pointer-events-none": {
    pointerEvents: "none"
  }
});
