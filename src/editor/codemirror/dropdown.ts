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
  let widgets: Array<Range<Decoration>> = [];
  for (let {from,to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (type, from, to) => {
        console.log(type.name);
        if (type.name == "MemberExpression") {
          let stringContent = view.state.doc.sliceString(from, to);
          console.log(stringContent);
          for (let i = 0; i < options.length; i++) {
            console.log(stringContent);
            if (stringContent.includes(options[i])) {
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

export const dropdownPlugin = (options : string[]) => ViewPlugin.fromClass(
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
      onchange: (e, view) => {
        let target = e.target as HTMLSelectElement
        if (target.nodeName == "SELECT" &&
            target.parentElement!.classList.contains("cm-dropdown"))
          return switchDropdown(view, view.posAtDOM(target), options, target.value)
        else return false;
      }
    }
  }
)

function switchDropdown(view: EditorView, pos: number, options: string[], newVal: string) {
  //First, find the maximum length over all the options
  let m = 0;
  for (let i = 0; i < options.length; i++) {
    if (options[i].length > m) m = options[i].length;
  }

  let before = view.state.doc.sliceString(Math.max(0,m), pos);
  let change;

  //Now replace the slice. This requires knowing the length of the actual string to be
  //replaced, so they must be iterated.

  let i = 0;
  while (i < options.length) {
    if (before.endsWith(options[i])) {
      change = {
        from: pos - options[i].length,
        to: pos,
        insert: newVal,
      };
      break;
    }
    i++;
  }
  if (i == options.length) return false;

  //Finally, dispatch the change!
  view.dispatch({changes: change});
  return true;
}

//export dropdownPlugin;
