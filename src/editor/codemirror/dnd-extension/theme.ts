/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";

const borderCss = (
  selectorPrefix: string,
  selectorSuffix: string,
  borderStyle: string
) => {
  return {
    // l-shaped left-edge-only border
    [selectorPrefix +
    "-left-edge-only.cm-cs--lshapes .cm-cs--indent" +
    selectorSuffix]: {
      borderRight: borderStyle,
      borderTop: borderStyle,
    },
    // boxes left-edge only border
    [selectorPrefix +
    "-left-edge-only.cm-cs--boxes .cm-cs--block" +
    selectorSuffix]: {
      borderLeft: borderStyle,
    },

    // l-shapes full border
    [selectorPrefix +
    "-borders.cm-cs--lshapes .cm-cs--indent" +
    selectorSuffix]: {
      borderTop: borderStyle,
    },
    [selectorPrefix +
    "-borders.cm-cs--lshapes .cm-cs--parent" +
    selectorSuffix]: {
      borderTop: borderStyle,
      borderRight: borderStyle,
      borderLeft: borderStyle,
    },
    [selectorPrefix + "-borders.cm-cs--lshapes .cm-cs--body" + selectorSuffix]:
      {
        borderRight: borderStyle,
        borderLeft: borderStyle,
        borderBottom: borderStyle,
      },
    // boxes full border
    [selectorPrefix + "-borders.cm-cs--boxes .cm-cs--block" + selectorSuffix]: {
      border: borderStyle,
    },
  };
};

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
  },
  ".cm-cs--block, .cm-cs--indent": {
    display: "block",
    position: "absolute",
  },
  ".cm-cs--block": {
    borderRadius: "var(--chakra-radii-lg)",
  },
  // Disable border radius when it looks bad.
  ".cm-cs--lshapes .cm-cs--block": {
    borderRadius: "unset",
  },
  ".cm-cs--borders-left-edge-only .cm-cs--block": {
    borderRadius: "unset",
  },
  ".cm-cs--cursor-borders-left-edge-only .cm-cs--block": {
    borderRadius: "unset",
  },

  ".cm-cs--background-block .cm-cs--block": {
    backgroundColor: "var(--chakra-colors-code-blockBackground)",
  },
  ".cm-cs--dnd-dragblock": {
    display: "block",
    position: "absolute",
    backgroundColor: "var(--chakra-colors-code-blockBorder)"
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
  // Enabled independently of .cm-cs--background-block
  ".cm-cs--cursor-background .cm-cs--block.cm-cs--active": {
    backgroundColor: "var(--chakra-colors-code-blockBackgroundActive)",
  },
  ".cm-cs--lshapes .cm-cs--body": {
    // Keep corner flush with parent above in the l-shape.
    borderTopLeftRadius: "unset",
  },
  ...borderCss(
    ".cm-cs--borders",
    "",
    "2px solid var(--chakra-colors-code-blockBorder)"
  ),
  ...borderCss(
    ".cm-cs--cursor-borders",
    ".cm-cs--active",
    "2px solid var(--chakra-colors-code-blockBorderActive)"
  ),
});
