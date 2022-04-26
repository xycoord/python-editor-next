/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { completionKeymap } from "@codemirror/autocomplete";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { defaultKeymap, indentLess, indentMore } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { defaultHighlightStyle } from "@codemirror/highlight";
import { history, historyKeymap } from "@codemirror/history";
import { python } from "@codemirror/lang-python";
import { indentOnInput, indentUnit } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { Compartment, EditorState, Extension, Prec } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightSpecialChars,
  KeyBinding,
  keymap,
} from "@codemirror/view";
import { dndSupport } from "./dnd";
import { dropCursor } from "./dropcursor";
import highlightStyle from "./highlightStyle";
import interact from "@replit/codemirror-interact";
import { popupPlugin } from "./popup";
import { dropdowns } from "./dropdown-config";

const customTabBinding: KeyBinding = {
  key: "Tab",
  run: indentMore,
  shift: indentLess,
};

export const themeExtensionsCompartment = new Compartment();

const indentSize = 4;
export const editorConfig: Extension = [
  EditorView.contentAttributes.of({
    // Probably a good idea? https://discuss.codemirror.net/t/ios-turn-off-autocorrect/2912
    autocorrect: "off",
    // This matches Ace/Monaco behaviour.
    autocapitalize: "none",
    // Disable Grammarly.
    "data-gramm": "false",
  }),
  dropCursor(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  indentOnInput(),
  Prec.fallback(defaultHighlightStyle),
  closeBrackets(),
  highlightStyle(),

  keymap.of([
    // Added, but see https://codemirror.net/6/examples/tab/ for accessibility discussion.
    customTabBinding,
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),

  // Fixed custom extensions.
  EditorState.tabSize.of(indentSize), // But hopefully not used!
  indentUnit.of(" ".repeat(indentSize)),
  python(),
  dndSupport(),
  dropdowns(),
  interact({
  rules: [
    //Rule for turning true to false onclick
    {
      regexp: /True/g,
      cursor: "pointer",
      onClick: (text, setText, e) => {
        setText("False");
      },
    },
    //Rule to do the opposite
    {
      regexp: /False/g,
      cursor: "pointer",
      onClick: (text, setText, e) => {
        setText("True");
      },
    },
  ],
  key: "ctrl",
  }),
  popupPlugin,

];
