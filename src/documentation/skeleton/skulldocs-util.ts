/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SkullDocsEntry, SkullDocsResponse } from "../../language-server/skulldocs";

export const skullModulesToTop = (input: SkullDocsResponse) => {
  const recurse = (docs: SkullDocsEntry[], topLevel: boolean) => {
    let removedSoFar = 0;
    [...docs].forEach((d, index) => {
      if (d.kind === "module" && !topLevel) {
        input[d.fullName] = d;
        docs.splice(index - removedSoFar, 1);
        removedSoFar++;
      }
      if (d.children) {
        recurse(d.children, false);
      }
    });
  };
  recurse(Object.values(input), true);
};

export const resolveModule = (
  docs: SkullDocsResponse,
  name: string
): SkullDocsEntry | undefined => {
  return Object.values(docs)
    .filter(
      (module) =>
        name === module.fullName || name.startsWith(module.fullName + ".")
    )
    .reduce(
      (acc: SkullDocsEntry | undefined, curr) =>
        // Longest match wins.
        !acc || acc.fullName.length < curr.fullName.length ? curr : acc,
      undefined
    );
};

export const resolveDottedName = (docs: SkullDocsResponse, name: string) => {
  let entry = resolveModule(docs, name);
  if (!entry) {
    return undefined;
  }
  const remainder = name.substring(entry.fullName.length + 1);
  if (remainder.length > 0) {
    for (const part of remainder.split(".")) {
      if (entry && entry.children) {
        entry = entry.children.find((e) => e.name === part);
      } else {
        return undefined;
      }
    }
  }
  return entry;
};
