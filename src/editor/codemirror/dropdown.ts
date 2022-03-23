import {
    WidgetType,
    EditorView,
    Decoration,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

class DropdownWidget extends WidgetType {
  constructor(readonly options: string[], readonly selected: number) { super() }

  eq(other: DropdownWidget) {
    if (this.selected != other.selected) return false;
    return (this.options == other.options);
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "cm-dropdown";
    let sel = wrap.appendChild(document.createElement("select"));

    for (let i = 0; i < this.options.length; i++) {
      let opt = sel.appendChild(document.createElement("option"));
      opt.value = i.toString();
      if (i == this.selected) opt.selected = true;
      opt.append(this.options[i]);
    }

    return wrap;
  }

  ignoreEvent() { return false }
}

function dropdowns(view: EditorView, options: string[]) {
  let widgets = [];
  for (let {from,to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (type, from, to) => {
        if (type.name == "StringLiteral") {
          let stringContent = view.state.doc.sliceString(from, to);
          for (let i = 0; i < options.length; i++) {
            if (stringContent == options[i]) {
              let deco = Decoration.widget({
                widget: new DropdownWidget(options, i);
              })
              widgets.push(deco.range(to));
              break;
            }
          }
        }
      }
    })
  }
  return Decoration.set(widgets);
}
