/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import unconfiguredImageUrlBuilder from "@sanity/image-url";

export const defaultQuality = 80;

export const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId("ajwvhvgo")
  .dataset("apps")
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

export const getAspectRatio = (imageRef: string): number | undefined => {
  const dimensionsArr = imageRef.match(/\d+x\d+/g);
  if (!dimensionsArr) {
    return undefined;
  }
  const dimensions = dimensionsArr.join().split("x");
  const [width, height] = dimensions.map((n: string) => Number(n));
  return width / height;
};
