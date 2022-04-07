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

class PopupWidget extends WidgetType {
  visible: boolean;

  constructor() {
    this.visible = true;
    super();
  }

  eq(other: DropdownWidget) {
    return this.visible === other.visible;
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "cm-popup";

    //Dummy internals
    let i = wrap.appendChild(document.createElement("p"));
    i.className = "cm-popup-text";
    i.append("Hello, world!");

    return wrap;
  }

  ignoreEvent() {return false;}
}

//Dummy code to test
function dropdowns(view: EditorView) {
  let widgets: Array<Range<Decoration>> = [];
  for (let {from, to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (type, from, to) => {
        if (type.name === "Boolean") {
          let deco = Decoration.widget({
            widget: new PopupWidget(),
            side: 1,
          })
          widgets.push(deco.range(to));
        }
      }
    })
  }
  return Decoration.set(widgets)
}



