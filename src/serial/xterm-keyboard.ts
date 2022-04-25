/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
const copyShortcut = (e: KeyboardEvent): boolean => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyC") {
    e.preventDefault();
    document.execCommand("copy");
    return false;
  }
  return true;
};

const isMicroPythonCtrlShortcut = (code: string) => {
  // Editing keys are here: https://github.com/micropython/micropython/blob/46a11028521425e7d6c85458c849bb96ff82152e/lib/mp-readline/readline.c
  switch (code) {
    case "KeyA":
    case "KeyB":
    case "KeyC":
    case "KeyD":
    case "KeyE":
      return true;
    default:
      return false;
  }
};

const micropythonShortcuts = (e: KeyboardEvent) => {
  if (e.ctrlKey && isMicroPythonCtrlShortcut(e.code)) {
    // Avoid also triggering browser shortcuts, e.g. bookmark (Ctrl+D), search (Ctrl+E).
    e.preventDefault();
    e.stopPropagation();
  }
  return true;
};

const handlers = [copyShortcut, micropythonShortcuts];

/**
 * A key event handler that can be installed on an xterm.js terminal
 * to control which key events are handled by the terminal itself and
 * which propagate.
 *
 * @returns true if xterm.js should handle the event, false otherwise.
 */
const customKeyEventHandler = (e: KeyboardEvent): boolean => {
  for (const handler of handlers) {
    if (!handler(e)) {
      return false;
    }
  }
  return true;
};

export default customKeyEventHandler;
