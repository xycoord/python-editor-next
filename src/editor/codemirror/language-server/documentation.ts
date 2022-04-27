/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import DOMPurify from "dompurify";
import { marked } from "marked";
import { IntlShape } from "react-intl";
import { MarkupContent } from "vscode-languageserver-types";
import { firstParagraph } from "./docstrings";
import "./documentation.css";

export const renderDocumentation = (
  documentation: MarkupContent | string | undefined,
  firstParagraphOnly: boolean = false
): Element => {
  if (!documentation) {
    documentation = "No documentation";
  }
  const div = document.createElement("div");
  div.className = "docs-markdown";
  if (MarkupContent.is(documentation) && documentation.kind === "markdown") {
    try {
      div.innerHTML = renderMarkdown(
        documentation.value,
        firstParagraphOnly
      ).__html;
      return div;
    } catch (e) {
      // Fall through to simple text below.
    }
  }
  let fallbackContent = MarkupContent.is(documentation)
    ? documentation.value
    : documentation;
  if (firstParagraphOnly) {
    fallbackContent = firstParagraph(fallbackContent);
  }
  const p = div.appendChild(document.createElement("p"));
  p.appendChild(new Text(fallbackContent));
  return div;
};

export interface SanitisedHtml {
  __html: string;
}

const fixupMarkdown = (input: string): string => {
  // Pyright's reST -> markdown conversion is imperfect.
  // Make some fixes.
  // Messy because it's after escaping. Fragile because it's regex.
  // Let's see if we can upstream or align the docs with supported syntax.
  return input
    .replace(/^\\\n/, "")
    .replace(/`([\w² \n]+?) ?<(.*?)>`\\_/gs, "[$1]($2)")
    .replace(/\\\*args/, "*args")
    .replace(/\\\*kwargs/, "*kwargs")
    .replace(/\\\*\\\*/g, "**")
    .replace(/:param ([^:]+):/g, "**`$1`**: ")
    .replace(/:return:/g, "**returns**: ");
};

// Workaround to open links in a new tab.
DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
});

export const renderMarkdown = (
  markdown: string,
  firstParagraphOnly: boolean = false
): SanitisedHtml => {
  if (firstParagraphOnly) {
    markdown = firstParagraph(markdown);
  }
  const html = DOMPurify.sanitize(
    marked.parse(fixupMarkdown(markdown), { gfm: true })
  );
  return {
    __html: html,
  };
};

export const wrapWithDocumentationButton = (
  intl: IntlShape,
  child: Element,
  id: string
): Element => {
  const docsAndActions = document.createElement("div");
  docsAndActions.style.display = "flex";
  docsAndActions.style.height = "100%";
  docsAndActions.style.flexDirection = "column";
  docsAndActions.style.justifyContent = "space-between";
  docsAndActions.appendChild(child);

  const button = docsAndActions.appendChild(document.createElement("button"));
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 34 35" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" fill="currentColor">
      <g id="path1948" transform="matrix(0.304023,0,0,0.304023,-1.69991,-1.94485)">
          <path d="M60.51,6.398C55.927,6.419 51.549,6.81 47.698,7.492C36.351,9.496 34.291,13.692 34.291,21.429L34.291,31.648L61.104,31.648L61.104,35.054L24.229,35.054C16.436,35.054 9.613,39.738 7.479,48.648C5.017,58.861 4.908,65.234 7.479,75.898C9.385,83.836 13.936,89.492 21.729,89.492L30.948,89.492L30.948,77.242C30.948,68.392 38.605,60.585 47.698,60.585L74.479,60.585C81.934,60.585 87.885,54.447 87.885,46.96L87.885,21.429C87.885,14.163 81.755,8.704 74.479,7.492C69.873,6.725 65.094,6.377 60.51,6.398ZM46.01,14.617C48.78,14.617 51.041,16.915 51.041,19.742C51.041,22.558 48.78,24.835 46.01,24.835C43.231,24.835 40.979,22.558 40.979,19.742C40.979,16.915 43.231,14.617 46.01,14.617Z" style="fill-rule:nonzero;"/>
      </g>
      <g id="path1950" transform="matrix(0.304023,0,0,0.304023,-1.69991,-1.94485)">
          <path d="M91.229,35.054L91.229,46.96C91.229,56.191 83.403,63.96 74.479,63.96L47.698,63.96C40.362,63.96 34.291,70.239 34.291,77.585L34.291,103.117C34.291,110.383 40.61,114.657 47.698,116.742C56.185,119.237 64.324,119.688 74.479,116.742C81.229,114.787 87.885,110.854 87.885,103.117L87.885,92.898L61.104,92.898L61.104,89.492L101.291,89.492C109.084,89.492 111.988,84.056 114.698,75.898C117.497,67.499 117.378,59.422 114.698,48.648C112.772,40.891 109.094,35.054 101.291,35.054L91.229,35.054ZM76.166,99.71C78.946,99.71 81.198,101.988 81.198,104.804C81.198,107.631 78.946,109.929 76.166,109.929C73.397,109.929 71.135,107.631 71.135,104.804C71.135,101.988 73.397,99.71 76.166,99.71Z" style="fill-rule:nonzero;"/>
      </g>
    </svg>`;
  button.ariaLabel = intl.formatMessage({ id: "show-api-documentation" });
  button.style.display = "block";
  button.style.margin = "0";
  button.style.marginRight = "-0.5rem";
  button.style.padding = "0.5rem";
  button.style.alignSelf = "flex-end";
  button.onclick = () => {
    document.dispatchEvent(
      new CustomEvent("cm/openDocs", {
        detail: {
          id,
        },
      })
    );
  };
  return docsAndActions;
};
