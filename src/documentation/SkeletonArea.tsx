/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Text } from "@chakra-ui/layout";
import { useIntl } from "react-intl";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import AreaHeading from "../common/AreaHeading";
import CodeEmbed from "./explore/CodeEmbed";
import { Divider } from "@chakra-ui/react";
import { useDialogs } from "../common/use-dialogs";

const SkeletonArea = () => {
  const intl = useIntl();
  const dialogs = useDialogs();
  return (
    <HeadedScrollablePanel
      heading={
        <AreaHeading
          name={intl.formatMessage({ id: "skeleton-tab-heading" })}
          description={intl.formatMessage({ id: "skeleton-tab-description" })}
        />
      }
    >
      <Text p={5} height="100%">
        <Box height="100%">
          <CodeEmbed code={"for i in range(0):\n   pass" }/>
          <Divider borderWidth="1px" />
        </Box>
        <Box height="100%">
          <CodeEmbed code={"while False:\n   pass" }/>
          <Divider borderWidth="1px" />
        </Box>
        <Box height="100%">
          <CodeEmbed code={"if False:\n   pass" }/>
          <Divider borderWidth="1px" />
        </Box>
        <Box height="100%">
          <CodeEmbed code={"if False:\n   pass\nelse:\n   pass" }/>
          <Divider borderWidth="1px" />
        </Box>
        <Box bg="gray.25" flex="0 0 auto" position="sticky" top="0" zIndex={1}>
          <CodeEmbed code={"if False:\n   pass\nelif False:\n   pass\nelse:\n   pass" }/>
        </Box>
      </Text>
      <Box height="100%" />
    </HeadedScrollablePanel>
  );
};

export default SkeletonArea;