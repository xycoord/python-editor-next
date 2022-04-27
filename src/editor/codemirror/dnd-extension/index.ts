/**
 * A CoreMirror view extension providing blocks for dragging and dropping using
 * CodeMirror's syntax tree.
 *
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Compartment, Extension } from "@codemirror/state";
import { baseTheme, theme } from "./theme";
import { dndStructureView } from "./view";

export const dndStructureHighlightingCompartment = new Compartment();

export interface DndStructureSettings {
  indentHandles: boolean;
  dragSmallStatements: boolean;
}

/**
 * Creates a CodeMirror extension that provides drag'n'drop boxes
 * based on the CodeMirror syntax tree.
 *
 * @param settings Settings for the code structure CodeMirror extension.
 * @returns A appropriately configured extension.
 */
export const dndStructure = (settings: DndStructureSettings): Extension => {
  return [dndStructureView(settings), baseTheme, theme];
};
