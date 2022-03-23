import {
    WidgetType,
    EditorView,
    Decoration,
    ViewUpdate,
    ViewPlugin,
    DecorationSet,
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
                widget: new DropdownWidget(options, i),
                side: 1,
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

const dropdownPlugin = options => ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = dropdowns(view, options)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = dropdowns(update.view, options)
      }
    }
  },
  {
    decorations: v => v.decorations,

    eventHandlers: {
      mousedown: (e, view) => {
        let target = e.target as HTMLElement
        if (target.nodeName == "SELECT" &&
            target.parentElement!.classList.contains("cm-dropdown"))
          return switchDropdown(view, view.posAtDOM(target), options, target.value)
      }
    }
  }
)

function switchDropdown(view: EditorView, pos: number, options: string[], newVal: string) {

}
