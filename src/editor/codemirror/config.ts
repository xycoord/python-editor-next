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
      {text: "Image.HEART", displayText: "Heart"},
      {text: "Image.HEART_SMALL", displayText: "Small Heart"},
      {text: "Image.HAPPY", displayText: "Happy"},
      {text: "Image.SMILE", displayText: "Smile"},
      {text: "Image.SAD", displayText: "Sad"},
      {text: "Image.CONFUSED", displayText: "Confused"},
      {text: "Image.ANGRY", displayText: "Angry"},
      {text: "Image.ASLEEP", displayText: "Asleep"},
      {text: "Image.SURPRISED", displayText: "Surprised"},
      {text: "Image.SILLY", displayText: "Silly"},
      {text: "Image.FABULOUS", displayText: "Fabulous"},
      {text: "Image.YES", displayText: "Yes"},
      {text: "Image.NO", displayText: "No"},
      {text: "Image.MEH", displayText: "Meh"},
      {text: "Image.DUCK", displayText: "Duck"},
      {text: "Image.GIRAFFE", displayText: "Giraffe"},
      {text: "Image.PACMAN", displayText: "Pacman"},
      {text: "Image.GHOST", displayText: "Ghost"},
      {text: "Image.SKULL", displayText: "Skull"},
    ],
    //context: /^display\.show\([^\)\n]*\)/,

  }),
  dropdownPlugin({
    options: [
      {text: "music.BA_DING", displayText: "Ba Ding"},
      {text: "music.BADDY", displayText: "Baddy"},
      {text: "music.BIRTHDAY", displayText: "Happy Birthday"},
      {text: "music.BLUES", displayText: "Blues"},
      {text: "music.CHASE", displayText: "Chase"},
      {text: "music.DADADADUM", displayText: "Da Da Da Dum"},
      {text: "music.ENTERTAINER", displayText: "The Entertainer"},
      {text: "music.FUNERAL", displayText: "Funeral"},
      {text: "music.FUNK", displayText: "Funk"},
      {text: "music.JUMP_DOWN", displayText: "Jump Down"},
      {text: "music.JUMP_UP", displayText: "Jump Up"},
      {text: "music.NYAN", displayText: "Nyan Cat"},
      {text: "music.ODE", displayText: "Ode to Joy"},
      {text: "music.POWER_DOWN", displayText: "Power Down"},
      {text: "music.POWER_UP", displayText: "Power Up"},
      {text: "music.PRELUDE", displayText: "Prelude"},
      {text: "music.PUNCHLINE", displayText: "Punchline"},
      {text: "music.PYTHON", displayText: "Python"},
      {text: "music.RINGTONE", displayText: "Ringtone"},
      {text: "music.WAWAWAWAA", displayText: "Wa Wa Wa Waa"},
      {text: "music.WEDDING", displayText: "Wedding"},
    ],

  }),
  dropdownPlugin({
    options: [
      {text: "Sound.GIGGLE", displayText: "Giggle"},
      {text: "Sound.HAPPY", displayText: "Happy"},
      {text: "Sound.HELLO", displayText: "Hello"},
      {text: "Sound.MYSTERIOUS", displayText: "Mysterious"},
      {text: "Sound.SAD", displayText: "Sad"},
      {text: "Sound.SLIDE", displayText: "Slide"},
      {text: "Sound.SOARING", displayText: "Soaring"},
      {text: "Sound.SPRING", displayText: "Spring"},
      {text: "Sound.TWINKLE", displayText: "Twinkle"},
      {text: "Sound.YAWM", displayText: "Yawm"},
    ],

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
