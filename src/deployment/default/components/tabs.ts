/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { theme } from "@chakra-ui/react";

const Tabs = {
  variants: {
    sidebar: (props: any) => {
      // Theme typing issue.
      const base = (theme.components.Tabs.variants["solid-rounded"] as any)(
        props
      );
      return {
        ...base,
        tablist: {
          background: "black",
        },
        tab: {
          ...base.tab,
          transition: "none",
          ml: "6px",
          borderRadius: "32px 0 0 32px",
          _selected: {
            color: "black",
            bg: "gray.50",
            outline: "none",
          },
          _focus: {
            boxShadow: "initial",
          },
          _active: {},
        },
      };
    },
  },
};

export default Tabs;
