/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProtocolRequestType } from "vscode-languageserver-protocol";
import { MarkupKind } from "vscode-languageserver-types";
import { LanguageServerClient } from "./client";

// This duplicates the types we added to Pyright.

export interface SkullDocsParams {
  modules: string[];
  path: string;
  documentationFormat?: MarkupKind[];
}

export interface SkullDocsBaseClass {
  name: string;
  fullName: string;
}

export type SkullDocsFunctionParameterCategory =
  | "simple"
  | "varargList"
  | "varargDict";

export interface SkullDocsFunctionParameter {
  name: string;
  category: SkullDocsFunctionParameterCategory;
  defaultValue?: string;
}

export interface SkullDocsEntry {
  id: string;
  name: string;
  docString?: string;
  fullName: string;
  type?: string;
  kind: "function" | "module" | "class" | "variable";
  children?: SkullDocsEntry[];
  baseClasses?: SkullDocsBaseClass[];
  params?: SkullDocsFunctionParameter[];
}

export interface SkullDocsResponse extends Record<string, SkullDocsEntry> {}

export const skullDocsRequestType = new ProtocolRequestType<
  SkullDocsParams,
  SkullDocsResponse,
  never,
  void,
  void
>("pyright/skulldocs");

export const skullDocs = (
  client: LanguageServerClient
): Promise<SkullDocsResponse> => {
  // This is a non-standard LSP call that we've added support for to Pyright.
  return client.connection.sendRequest(skullDocsRequestType, {
    path: client.options.rootUri,
    documentationFormat: [MarkupKind.Markdown],
    modules: [
      "loops",
      "logic",
    ],
  });
};
