/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {Extension} from "@codemirror/state";
import { dropdownPlugin } from "./dropdown";

export const dropdowns = (): Extension => [
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
    context: /^display\.show\([^)\n]*\)/,

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
      {text: "Sound.YAWN", displayText: "Yawn"},
    ],
  }),
  dropdownPlugin({
    options: [
      {text: "get_x", displayText: "x"},
      {text: "get_y", displayText: "y"},
      {text: "get_z", displayText: "z"},
    ],
    context: /accelerometer\..*\(\)|compass\..*\(\)/,
  }),
  dropdownPlugin({
    options: [
      {text: "button_a", displayText: "A"},
      {text: "button_b", displayText: "B"},
    ],
  }),
  dropdownPlugin({
    options: [
      {text: "'shake'", displayText: "Shake"},
      {text: "'up'", displayText: "Logo Up"},
      {text: "'down'", displayText: "Logo Down"},
      {text: "'face up'", displayText: "Face Up"},
      {text: "'face down'", displayText: "Face Down"},
      {text: "'left'", displayText: "Left"},
      {text: "'right'", displayText: "Right"},
      {text: "'freefall'", displayText: "Freefall"},
      {text: "'3g'", displayText: "3G"},
    ],
    context: /accelerometer\.(is|was)_gesture\([^)\n]*\)/,
  }),
  dropdownPlugin({
    options: [
      {text: "pin0", displayText: "0"},
      {text: "pin1", displayText: "1"},
      {text: "pin2", displayText: "2"},
    ],
  }),
]
