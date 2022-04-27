/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Divider, List, ListItem } from "@chakra-ui/layout";
import { useCallback } from "react";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import { getTopicAndEntry } from "./content";
import { Toolkit } from "./model";
import { useAnimationDirection } from "../common/documentation-animation-hooks";
import DocumentationBreadcrumbHeading from "../common/DocumentationBreadcrumbHeading";
import DocumentationContent from "../common/DocumentationContent";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import ReferenceTopicEntry from "./ReferenceTopicEntry";
import AreaHeading from "../../common/AreaHeading";
import DocumentationTopLevelItem from "../common/DocumentationTopLevelItem";
import { useIntl } from "react-intl";
import { isV2Only } from "../common/model";
import { docStyles } from "../../common/documentation-styles";

interface ReferenceDocumentationProps {
  toolkit: Toolkit;
}

/**
 * A data-driven toolkit component.
 *
 * The components used here are also used with the API data to
 * generate the API documentation.
 */
const ReferenceToolkit = ({ toolkit }: ReferenceDocumentationProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.reference);
  const direction = useAnimationDirection(anchor);
  const topicOrEntryId = anchor?.id;
  const handleNavigate = useCallback(
    (topicOrEntryId: string | undefined) => {
      setAnchor(
        topicOrEntryId ? { id: topicOrEntryId } : undefined,
        "documentation-user"
      );
    },
    [setAnchor]
  );
  return (
    <ActiveLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      topicOrEntryId={topicOrEntryId}
      onNavigate={handleNavigate}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveLevelProps extends ReferenceDocumentationProps {
  anchor: Anchor | undefined;
  topicOrEntryId: string | undefined;
  onNavigate: (topicOrEntryId: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveLevel = ({
  anchor,
  topicOrEntryId,
  onNavigate,
  toolkit,
  direction,
}: ActiveLevelProps) => {
  const [topic, activeItem] = getTopicAndEntry(toolkit, topicOrEntryId);
  const intl = useIntl();
  const referenceString = intl.formatMessage({ id: "reference-tab" });
  if (topic) {
    return (
      <HeadedScrollablePanel
        // Key prop used to ensure scroll position top
        // after using internal link to toolkit topic.
        key={topic.name}
        direction={direction}
        heading={
          <DocumentationBreadcrumbHeading
            parent={referenceString}
            title={topic.name}
            onBack={() => onNavigate(undefined)}
            subtitle={topic.subtitle}
            icon={topic.image}
          />
        }
      >
        {topic.introduction && (
          <Box
            p={5}
            pb={1}
            fontSize="sm"
            sx={{
              ...docStyles,
            }}
          >
            <DocumentationContent content={topic.introduction} />
          </Box>
        )}
        <List flex="1 1 auto">
          {topic.contents?.map((item) => (
            <ListItem key={item.name}>
              <ReferenceTopicEntry
                topic={topic}
                entry={item}
                anchor={anchor}
                active={activeItem === item}
              />
              <Divider />
            </ListItem>
          ))}
        </List>
      </HeadedScrollablePanel>
    );
  }
  return (
    <HeadedScrollablePanel
      direction={direction}
      heading={
        <AreaHeading name={referenceString} description={toolkit.description} />
      }
    >
      <List flex="1 1 auto" m={3}>
        {toolkit.contents?.map((topic) => (
          <DocumentationTopLevelItem
            key={topic.name}
            name={topic.name}
            isV2Only={isV2Only(topic)}
            description={topic.subtitle}
            icon={topic.image}
            onForward={() => onNavigate(topic.slug.current)}
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

export default ReferenceToolkit;
