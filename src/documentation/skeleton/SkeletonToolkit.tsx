/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Divider } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { firstParagraph } from "../../editor/codemirror/language-server/docstrings";
import { ApiDocsEntry, ApiDocsResponse } from "../../language-server/apidocs";
import { Anchor, RouterParam, useRouterParam } from "../../router-hooks";
import DocString from "../common/DocString";
import { allowWrapAtPeriods } from "../common/wrap";
import { useAnimationDirection } from "../explore/toolkit-hooks";
import ToolkitBreadcrumbHeading from "../explore/ToolkitBreadcrumbHeading";
import HeadedScrollablePanel from "../../common/HeadedScrollablePanel";
import AreaHeading from "../../common/AreaHeading";
import ToolkitTopLevelListItem from "../explore/ToolkitTopLevelListItem";
import { resolveModule } from "./skulldocs-util";
import ReferenceNode from "../reference/ReferenceNode";

interface SkeletonToolkitProps {
  docs: ApiDocsResponse;
}

export const SkeletonToolkit = ({ docs }: SkeletonToolkitProps) => {
  const [anchor, setAnchor] = useRouterParam(RouterParam.skeleton);
  const handleNavigate = useCallback(
    (id: string | undefined) => {
      setAnchor(id ? { id } : undefined, "toolkit-user");
    },
    [setAnchor]
  );
  const direction = useAnimationDirection(anchor);
  return (
    <ActiveToolkitLevel
      key={anchor ? 0 : 1}
      anchor={anchor}
      onNavigate={handleNavigate}
      docs={docs}
      direction={direction}
    />
  );
};

interface ActiveToolkitLevelProps {
  anchor: Anchor | undefined;
  docs: ApiDocsResponse;
  onNavigate: (state: string | undefined) => void;
  direction: "forward" | "back" | "none";
}

const ActiveToolkitLevel = ({
  anchor,
  onNavigate,
  docs,
  direction,
}: ActiveToolkitLevelProps) => {
  const intl = useIntl();
  const skeletonString = intl.formatMessage({ id: "skeleton-tab" });
  const module = anchor ? resolveModule(docs, anchor.id) : undefined;
  if (module) {
    return (
      <HeadedScrollablePanel
        direction={direction}
        heading={
          <ToolkitBreadcrumbHeading
            parent={skeletonString}
            title={module.name}
            onBack={() => onNavigate(undefined)}
            subtitle={<ShortModuleDescription value={module} />}
          />
        }
      >
        <List flex="1 1 auto">
          {(module.children ?? []).map((child: ApiDocsEntry) => (
            <ListItem key={child.id}>
              <ReferenceNode docs={child} width="100%" anchor={anchor} />
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
        <AreaHeading
          name={skeletonString}
          description={intl.formatMessage({ id: "skeleton-description" })}
        />
      }
    >
      <List flex="1 1 auto" m={3}>
        {sortBy(Object.values(docs), (m) => m.fullName).map((module) => (
          <ToolkitTopLevelListItem
            key={module.id}
            name={allowWrapAtPeriods(module.fullName)}
            description={<ShortModuleDescription value={module} />}
            onForward={() => onNavigate(module.id)}
          />
        ))}
      </List>
    </HeadedScrollablePanel>
  );
};

const ShortModuleDescription = ({ value }: { value: ApiDocsEntry }) =>
  value.docString ? (
    <DocString
      value={firstParagraph(value.docString).trim().replace(/\.$/, "")}
    />
  ) : null;
