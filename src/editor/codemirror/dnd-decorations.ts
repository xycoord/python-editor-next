/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { StateEffect } from "@codemirror/state";
import { makeShadow, dndShadowsTheme } from "../dnd-shadows";

export const timeoutEffect = StateEffect.define<{}>({});

// Exported for unit testing.
export class DndDecorationsViewPlugin {
  decorations: DecorationSet;
  previewPos = new Set<number>();
  droppedRecentPos = new Set<number>();
  droppedDonePos = new Set<number>();
  underlayLayer: HTMLElement;

  constructor(view: EditorView, private timeout: number = 100) {
    this.decorations = this.dndDecorationsForLines(view);

    this.underlayLayer = view.scrollDOM.appendChild(
          document.createElement("div")
        );
    this.underlayLayer.className = "cm-cs--dnd-under-layer";
    this.underlayLayer.setAttribute("aria-hidden", "true");
    this.underlayLayer.id = "dnd-underlay-layer"
    this.underlayLayer.setAttribute("dnd-pointer-events", "none")
    this.underlayLayer.style.zIndex = "-5"
    this.underlayLayer.style.position = "absolute"
    //WHAT IF THE GUTTER IS LARGER???
    this.underlayLayer.style.left = "96px"
    this.underlayLayer.style.width = "100%"
    this.underlayLayer.style.height = "100%"
  }

  update({ docChanged, transactions, changes, state, view }: ViewUpdate) {
    if (docChanged) {
      this.previewPos.clear();
      this.droppedRecentPos.clear();
      this.droppedDonePos.clear();

      const isPreview = transactions.some((t) => t.isUserEvent("dnd.preview"));
      const isDrop = transactions.some((t) => t.isUserEvent("dnd.drop"));
      if (isPreview || isDrop) {
        changes.iterChangedRanges((_fromA, toA, fromB, toB) => {
          const start = state.doc.lineAt(fromB);
          const end = state.doc.lineAt(toB);
           
          for (let l = start.number; l < end.number; ++l) {
            const line = state.doc.line(l);
            if (line.text.trim()) {
              if (isPreview) {
                this.previewPos.add(line.from);
              } else if (isDrop) {
                this.droppedRecentPos.add(line.from);
              }
            }
          }
          makeShadow(view, state, isPreview, isDrop, 
            this.underlayLayer, fromB, toB)
        });
      }

      // Later we need to flip the decoration type to fade the highlighting.
      // The "done" decoration will be removed by a future document change.
      if (transactions.some((t) => t.isUserEvent("dnd.drop"))) {
        setTimeout(() => {
          view.dispatch({
            effects: [timeoutEffect.of({})],
          });
        }, this.timeout);
      }
    } else {
      for (const transaction of transactions) {
        if (transaction.effects.find((e) => e.is(timeoutEffect))) {
          this.droppedDonePos = this.droppedRecentPos;
          this.droppedRecentPos = new Set();
        }
      }
    }
    this.decorations = this.dndDecorationsForLines(view);
  }

  dndDecorationsForLines = (view: EditorView): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();
    for (let { from: rangeFrom, to: rangeTo } of view.visibleRanges) {
      for (let pos = rangeFrom; pos <= rangeTo; ) {
        let { from, to } = view.state.doc.lineAt(pos);
        if (this.previewPos.has(from)) {
          builder.add(from, from, preview);
        } else if (this.droppedRecentPos.has(from)) {
          builder.add(from, from, droppedRecent);
        } else if (this.droppedDonePos.has(from)) {
          builder.add(from, from, droppedDone);
        }
        pos = to + 1;
      }
    }
    return builder.finish();
  };
}

const preview = Decoration.line({
  attributes: { class: "cm-preview" },
});

const droppedRecent = Decoration.line({
  attributes: { class: "cm-dropped--recent" },
});

const droppedDone = Decoration.line({
  attributes: { class: "cm-dropped--done" },
});

const baseColor = "#f7febf";

export const dndDecorations = () => [
  // EditorView.theme({
    // ".cm-preview": {
    //   backgroundColor: `${baseColor}55`,
    // },
    // ".cm-dropped--recent": {
    //   backgroundColor: `${baseColor}dd`,
    // },
    // ".cm-dropped--done": {
    //   transition: "background-color ease-in 2.9s",
    // },
  // }),
  dndShadowsTheme,
  ViewPlugin.fromClass(DndDecorationsViewPlugin, {
    decorations: (v) => v.decorations,
  }),
];
