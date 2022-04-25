/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, ReactNode, useContext, useMemo } from "react";
import { ApiDocsResponse } from "../language-server/apidocs";
import { SkullDocsResponse } from "../language-server/skulldocs";
import {
  ExploreToolkitState,
  useApiDocs,
  useSkullDocs,
  useExploreToolkit,
} from "./documentation-hooks";

export interface ToolkitContextValue {
  exploreToolkit: ExploreToolkitState;
  referenceToolkit: ApiDocsResponse | undefined;
  skeletonToolkit: SkullDocsResponse | undefined;
}

const ToolkitContext = createContext<ToolkitContextValue | undefined>(
  undefined
);

export const useToolkitState = (): ToolkitContextValue => {
  const value = useContext(ToolkitContext);
  if (!value) {
    throw new Error("Missing provider!");
  }
  return value;
};

const ToolkitProvider = ({ children }: { children: ReactNode }) => {
  const exploreToolkit = useExploreToolkit();
  const referenceToolkit = useApiDocs();
  const skeletonToolkit = useSkullDocs();

  const value: ToolkitContextValue = useMemo(() => {
    return { exploreToolkit, referenceToolkit, skeletonToolkit };
  }, [exploreToolkit, referenceToolkit, skeletonToolkit]);
  return (
    <ToolkitContext.Provider value={value}>{children}</ToolkitContext.Provider>
  );
};

export default ToolkitProvider;
