/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Toolkit, ToolkitTopic, ToolkitTopicEntry } from "./model";

// For now we just slurp the whole toolkit at once.
// Might revisit depending on eventual size.
const toolkitQuery = (languageId: string): string => {
  if (!languageId.match(/^[a-z-]+$/g)) {
    throw new Error("Invalid language id.");
  }
  return `
  *[_type == "toolkit" && language == "${languageId}" && slug.current == "explore" && !(_id in path("drafts.**"))]{
    id, name, description, language,
    contents[]->{
      name, slug, compatibility, subtitle, image,
      introduction[] {
        ...,
        markDefs[]{
          ...,
          _type == "toolkitInternalLink" => {
            "slug": @.reference->slug,
            "targetType": @.reference->_type
          }
        }
      },
      contents[]->{
        name, slug, compatibility, 
        content[] {
          ...,
          markDefs[]{
            ...,
            _type == "toolkitInternalLink" => {
              "slug": @.reference->slug,
              "targetType": @.reference->_type
            }
          }
        },
        alternativesLabel, alternatives, 
        detailContent[] {
          ...,
          markDefs[]{
            ...,
            _type == "toolkitInternalLink" => {
              "slug": @.reference->slug,
              "targetType": @.reference->_type
            }
          }
        },
      }
    }
  }`;
};
// No need to add a Sanity client dependency just for this.
const toolkitQueryUrl = (languageId: string): string => {
  return (
    "https://ajwvhvgo.api.sanity.io/v1/data/query/apps?query=" +
    encodeURIComponent(toolkitQuery(languageId))
  );
};

const fetchToolkitInternal = async (
  languageId: string
): Promise<Toolkit | undefined> => {
  const response = await fetch(toolkitQueryUrl(languageId));
  if (response.ok) {
    const { result } = await response.json();
    if (!result) {
      throw new Error("Unexpected response format");
    }
    const toolkits = result as Toolkit[];
    if (toolkits.length === 0) {
      return undefined;
    }
    if (toolkits.length > 1) {
      throw new Error("Unexpected results");
    }
    // Add topic entry parent for toolkit navigation.
    const toolkit = toolkits[0];
    toolkit.contents?.forEach((topic) => {
      topic.contents?.forEach((entry) => {
        entry.parent = topic;
      });
    });
    return toolkit;
  }
  throw new Error("Error fetching toolkit content: " + response.status);
};

export const fetchToolkit = async (languageId: string): Promise<Toolkit> => {
  const preferred = await fetchToolkitInternal(languageId);
  if (preferred) {
    return preferred;
  }
  const fallback = await fetchToolkitInternal("en");
  if (!fallback) {
    throw new Error("English toolkit must exist");
  }
  return fallback;
};

export const getTopicAndEntry = (
  toolkit: Toolkit,
  topicOrEntryId: string | undefined
): [ToolkitTopic | undefined, ToolkitTopicEntry | undefined] => {
  const topic = toolkit.contents?.find(
    (t) => t.slug.current === topicOrEntryId
  );
  if (topic) {
    return [topic, undefined];
  }
  const entry = toolkit.contents
    ?.flatMap((topic) => topic.contents ?? [])
    .find((entry) => entry.slug.current === topicOrEntryId);
  if (!entry) {
    return [undefined, undefined];
  }
  return [entry.parent, entry];
};
