/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SkeletonToolkit } from "./skeleton/SkeletonToolkit";
import ToolkitSpinner from "./explore/ToolkitSpinner";
import { useToolkitState } from "./toolkit-hooks";

const SkeletonArea = () => {
  const { skeletonToolkit } = useToolkitState();
  return skeletonToolkit ? (
    <SkeletonToolkit docs={skeletonToolkit} />
  ) : (
    <ToolkitSpinner />
  );
};

export default SkeletonArea;
