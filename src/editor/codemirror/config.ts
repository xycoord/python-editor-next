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
import { dropdownPlugin } from "./dropdown";

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
  dropdownPlugin({
    options: [
      {text: "Image.HEART"},
      {text: "Image.HEART_SMALL"},
      {text: "Image.HAPPY"},
      {text: "Image.SMILE"},
      {text: "Image.SAD"},
      {text: "Image.CONFUSED"},
      {text: "Image.ANGRY"},
      {text: "Image.ASLEEP"},
      {text: "Image.SURPRISED"},
      {text: "Image.SILLY"},
      {text: "Image.FABULOUS"},
      {text: "Image.YES"},
      {text: "Image.NO"},
      {text: "Image.MEH"},
      {text: "Image.DUCK"},
      {text: "Image.GIRAFFE"},
      {text: "Image.PACMAN"},
      {text: "Image.GHOST"},
      {text: "Image.SKULL"},
    ]

  }),
  dropdownPlugin({
    options: [
      {text: "music.BA_DING"},
      {text: "music.BADDY"},
      {text: "music.BIRTHDAY"},
      {text: "music.BLUES"},
      {text: "music.CHASE"},
      {text: "music.DADADADUM"},
      {text: "music.ENTERTAINER"},
      {text: "music.FUNERAL"},
      {text: "music.FUNK"},
      {text: "music.JUMP_DOWN"},
      {text: "music.JUMP_UP"},
      {text: "music.NYAN"},
      {text: "music.ODE"},
      {text: "music.POWER_DOWN"},
      {text: "music.POWER_UP"},
      {text: "music.PRELUDE"},
      {text: "music.PUNCHLINE"},
      {text: "music.PYTHON"},
      {text: "music.RINGTONE"},
      {text: "music.WAWAWAWAA"},
      {text: "music.WEDDING"},
    ]

  }),
  dropdownPlugin({
    options: [
      {text: "Sound.GIGGLE"},
      {text: "Sound.HAPPY"},
      {text: "Sound.HELLO"},
      {text: "Sound.MYSTERIOUS"},
      {text: "Sound.SAD"},
      {text: "Sound.SLIDE"},
      {text: "Sound.SOARING"},
      {text: "Sound.SPRING"},
      {text: "Sound.TWINKLE"},
      {text: "Sound.YAWM"},
    ]

  }),
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
];
