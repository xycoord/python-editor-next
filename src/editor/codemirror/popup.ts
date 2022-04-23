/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
    WidgetType,
    EditorView,
    Decoration,
    ViewUpdate,
    ViewPlugin,
    DecorationSet,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/rangeset";
import "./popup.css";

class PopupWidget extends WidgetType {
  visible: boolean;

  constructor(readonly checked: boolean[][]) {
    super();
    this.visible = false;
  }

  eq(other: PopupWidget) {
    return this.checked === other.checked;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "cm-popup";

    let btn = wrap.appendChild(document.createElement("input"));
    btn.type = "checkbox";
    btn.className = "cm-popup-opener";

    //Actual internals for selecting displays
    let form = wrap.appendChild(document.createElement("div"));
    form.className = "cm-popup-text";

    //Five rows of buttons
    for (let i = 0; i < 5; i++) {
      let w = form.appendChild(document.createElement("div"));
      w.className = "cm-popup-btn-row"+i;

      //Five buttons a row
      for (let j = 0; j < 5; j++) {
        let b = w.appendChild(document.createElement("input"));
        b.type = "checkbox";
        b.checked = this.checked[i][j];
        b.className = "cm-popup-btn";
        b.classList.add("cm-popup-btn-"+i+"-"+j);
      }
    }

    return wrap;
  }

  ignoreEvent() {return false}
}

const falsum = [[false,false,false,false,false],
              [false,false,false,false,false],
              [false,false,false,false,false],
              [false,false,false,false,false],
              [false,false,false,false,false],
             ]

//Dummy code to test
function popups(view: EditorView) {
  let widgets: Array<Range<Decoration>> = [];
  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (type, from, to) => {
        if (type.name === "String") {
          let stringContent = view.state.doc.sliceString(from, to);
          if (/'\d\d\d\d\d:\d\d\d\d\d:\d\d\d\d\d:\d\d\d\d\d:\d\d\d\d\d'/.test(stringContent))
          {
            let digits = falsum;
            for (let i = 0; i < 5; i++) {
              for (let j = 0; j < 5; j++) {
                digits[i][j] = stringContent.charAt(1 + (6*i) + j) !== "0";
              }
            }
            let deco = Decoration.widget({
              widget: new PopupWidget(falsum),
              side: 1,
            })
            widgets.push(deco.range(to));
          }
        }
      }
    })
  }
  return Decoration.set(widgets)
}

export const popupPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = popups(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = popups(update.view)
      }
    }
  },
  {
    decorations: v => v.decorations,
    eventHandlers: {
      change: (e, view) => {
        let target = e.target as HTMLElement;
        if (target.nodeName === "INPUT" &&
          target.parentElement!.classList.contains("cm-popup")){
          if (target.classList.contains("cm-popup-opener")) {
            let ch = target.parentElement!.lastChild as HTMLElement;
            let t2 = target as HTMLInputElement
            if (t2.checked) ch.classList.add("show");
            else ch.classList.remove("show");
            return true;
          }
        }
        else if (target.nodeName === "INPUT" &&
          target.parentElement!.parentElement!.classList.contains("cm-popup-text")){
          console.log("doot");
          for (let i = 0; i < 5; i++) {
            for (let j  = 0; j < 5; j++) {
              if (target.classList.contains("cm-popup-btn-"+i+"-"+j)) {
                let t2 = target as HTMLInputElement;
                let pos = view.posAtDOM(target);
                let strTxt = view.state.doc.sliceString(pos-31, pos);
                let repC = "0";
                if (t2.checked) repC = "9";
                let after = strTxt.substring(0, 1 + (6*i) + j) + repC + strTxt.substring(2 + (6*i) + j, 31);
                console.log(after);
                let change = {
                  from: pos-31,
                  to: pos,
                  insert: after,
                };
                view.dispatch({
                  userEvent: "popup.change",
                  changes: change,
                });
                return true;
              }
            }
          }
        }
      }
    },
  }
)

