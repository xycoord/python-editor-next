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
  btns: HTMLButtonElement[][] = [[],[],[],[],[]]

  constructor(readonly levels: number[][]) {
    super();
    this.visible = false;
  }

  eq(other: PopupWidget) {
    return this.levels === other.levels;
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
        let b = w.appendChild(document.createElement("button"));
        b.className = "cm-popup-btn-"+this.levels[i][j];
        b.classList.add("cm-popup-btn");
        this.btns[i].push(b);
      }
    }

    let con = form.appendChild(document.createElement("div"));
    con.className = "cm-popup-controls";

    let sub = con.appendChild(document.createElement("button"));
    sub.className = "cm-popup-submit";
    sub.append("Submit");

    let drop = con.appendChild(document.createElement("select"));
    drop.className = "cm-popup-level";
    for (let i = 0; i < 10; i++) {
      let opt = drop.appendChild(document.createElement("option"));
      opt.value = i.toString();
      opt.append(i.toString());
    }

    return wrap;
  }

  ignoreEvent(_event : Event) {
    switch (_event.constructor) {
      case MouseEvent: return true;
      default: return false;
    }
  }
}

const zeroes = [[0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
                [0,0,0,0,0],
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
            let digits = zeroes;
            for (let i = 0; i < 5; i++) {
              for (let j = 0; j < 5; j++) {
                digits[i][j] = ~~stringContent.charAt(1 + (6*i) + j);
              }
            }
            let deco = Decoration.widget({
              widget: new PopupWidget(digits),
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
      },
      click: (e,view) => {
        let target = e.target as HTMLElement;
        if (target.nodeName === "BUTTON" &&
            target.parentElement!.parentElement!.classList.contains("cm-popup-text")) {
          if (target.classList.contains("cm-popup-btn")) {
            //This means we've clicked on a button, so change its intensity to the value
            //First remove all level classes from the button
            for (let i = 0; i < 10; i++) target.classList.remove("cm-popup-btn-"+i);

            //Now get the level selected from the dropdown to add
            let dropdown = target.parentElement!.parentElement!.lastChild!.lastChild! as HTMLSelectElement
            target.classList.add("cm-popup-btn-"+dropdown.value);
            return true;
          }
          else if (target.classList.contains("cm-popup-submit")) {

          }
        }
      }
    },
  }
)

