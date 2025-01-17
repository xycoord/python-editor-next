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

import "./dropdown.css";

export interface OptionMap {
  text: string,
  displayText?: string,
  displayImg?: string,
}

export interface DropdownConfig {
  options: OptionMap[],
  context?: RegExp,
}

class DropdownWidget extends WidgetType {
  constructor(readonly options: OptionMap[], readonly selected: number) { super() }

  eq(other: DropdownWidget) {
    if (this.selected !== other.selected) return false;
    return (this.options === other.options);
  }

  toDOM() {
    let wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    wrap.className = "cm-dropdown";
    let sel = wrap.appendChild(document.createElement("select"));
    if (navigator.userAgent.match(/iPhone|iPad/i)) {
      sel.className ="cm-dropdown-select-ios";
    }
    else {
      sel.className = "cm-dropdown-select";
    }
    sel.setAttribute("dir","rtl");

    for (let i = 0; i < this.options.length; i++) {
      let opt = sel.appendChild(document.createElement("option"));
      opt.value = i.toString();
      if (i === this.selected) opt.selected = true;

      if (this.options[i].displayImg) {
        let t = this.options[i].displayImg as string;
        opt.appendChild(document.createElement("img")).setAttribute("href", t);
      }
      else if (this.options[i].displayText) {
        let t = this.options[i].displayText as string;
        opt.append(t);

      }
      else {opt.append(this.options[i].text);}
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

function dropdowns(view: EditorView, config: DropdownConfig) {
  let widgets: Array<Range<Decoration>> = [];
  let validRanges: Array<Array<number>> = [];
  if (config.context) {
    //First, identify all the ast nodes that match the RegExp
    for (let {from,to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (type, from, to) => {
          if ((config.context as RegExp).test(view.state.doc.sliceString(from,to))) {
            validRanges.push([from, to]);
          }
        }
      })
    }
  }

  //Now we can just iterate through as usual, but automatically reject if the thing isn't
  //in range
  for (let {from,to} of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from, to,
      enter: (type, from, to) => {

        let flag = false;
        for (let i = 0; i < validRanges.length; i++) {
          flag = flag || (validRanges[i][0] <= from && to <= validRanges[i][1]);
        }
        if (flag || !config.context) {
          let stringContent = view.state.doc.sliceString(from, to);
          for (let i = 0; i < config.options.length; i++) {
            if (stringContent === config.options[i].text) {
              let deco = Decoration.widget({
                widget: new DropdownWidget(config.options, i),
                side: 1,
                //block: true,
                inclusive: true,
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

//Exported for unit testing

export const dropdownPluginInternal = (config: DropdownConfig) => class {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = dropdowns(view, config)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = dropdowns(update.view, config)
    }
  }
}


export const dropdownPlugin = (config: DropdownConfig) => ViewPlugin.fromClass(
  dropdownPluginInternal(config),
  {
    decorations: v => v.decorations,

    eventHandlers: {
      change: (e, view) => {
        let target = e.target as HTMLSelectElement
        if (target.nodeName === "SELECT" &&
            target.parentElement!.classList.contains("cm-dropdown"))
        {return switchDropdown(view, view.posAtDOM(target), config.options, target.value)}
        else return false;
      },
    }
  }
)

function switchDropdown(view: EditorView, pos: number, options: OptionMap[], newVal: string) {
  //First, find the maximum length over all the options
  let m = 0;
  for (let i = 0; i < options.length; i++) {
    if (options[i].text.length > m) m = options[i].text.length;
  }

  let before = view.state.doc.sliceString(pos-m, pos);

  let change;

  //Now replace the slice. This requires knowing the length of the actual string to be
  //replaced, so they must be iterated.

  let i = 0; let chosen = -1;

  //Find the longest option that matches in the substring to replace - the longest must be
  //picked to account for one option being a subset of another
  while (i < options.length) {
    if (before.slice(m-options[i].text.length, m) === options[i].text) {
      if (chosen === -1 || options[chosen].text.length < options[i].text.length) chosen = i;
    }
    i++;
  }

  if (chosen === -1) return false;

  change = {
    from: pos - options[chosen].text.length,
    to: pos,
    insert: options[~~newVal].text,
  };

  //Finally, dispatch the change!
  view.dispatch({
    userEvent: "dropdown.change",
    changes: change,
  });
  return true;
}

