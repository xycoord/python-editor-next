/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { theme } from "@chakra-ui/react";

const Button = {
  variants: {
    // Ideally we'd drop this variant.
    zoom: (props: any) => {
      // Theme typing issue.
      const base: any = theme.components.Button.variants.solid(props);
      return {
        ...base,
        _hover: {
          ...base._hover,
          backgroundColor: "gray.400",
        },
        _active: {
          ...base._active,
          backgroundColor: "gray.500",
        },
      };
    },
    sidebar: (props: any) => {
      // Theme typing issue.
      const base: any = {
        ...theme.components.Button.variants.ghost(props),
      };
      return {
        ...base,
        _hover: {
          ...base._hover,
          bg: "white",
          color: "gray.700",
        },
        _active: {
          ...base._hover,
          bg: "white",
          color: "gray.800",
        },
      };
    },
  },
};

export default Button;
