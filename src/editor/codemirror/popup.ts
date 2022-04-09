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
  visible: boolean

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
        b.className = "cm-popup-btn-"+i+"-"+j;
      }
    }

    return wrap;
  }

  ignoreEvent() {return this.visible;}
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
        if (type.name === "Boolean") {
          let deco = Decoration.widget({
            widget: new PopupWidget(falsum),
            side: 1,
          })
          widgets.push(deco.range(to));
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
      mousedown: (e, view) => {
        let target = e.target as HTMLElement;
        if (target.nodeName === "INPUT" &&
          target.parentElement!.classList.contains("cm-popup")) {
            console.log("boop");
            let ch = target.parentElement!.lastChild as HTMLElement;
            ch.classList.toggle("show");
            return true;
          }
      }
    },
  }
)

