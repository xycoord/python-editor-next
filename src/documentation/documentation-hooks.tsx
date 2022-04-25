/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RefObject, useEffect, useRef, useState } from "react";
import useIsUnmounted from "../common/use-is-unmounted";
import { apiDocs, ApiDocsResponse } from "../language-server/apidocs";
import { skullDocs, SkullDocsResponse } from "../language-server/skulldocs";
import { useLanguageServerClient } from "../language-server/language-server-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSettings } from "../settings/settings";
import dragImage from "./drag-image.svg";
import { fetchToolkit } from "./explore/api";
import { Toolkit } from "./explore/model";
import { pullModulesToTop } from "./reference/apidocs-util";
import { skullModulesToTop } from "./skeleton/skulldocs-util";

export type ExploreToolkitState =
  | { status: "ok"; toolkit: Toolkit }
  | { status: "error" }
  | { status: "loading" };

export const useExploreToolkit = (): ExploreToolkitState => {
  const [state, setState] = useState<ExploreToolkitState>({
    status: "loading",
  });
  const logging = useLogging();
  const isUnmounted = useIsUnmounted();
  const [{ languageId }] = useSettings();
  useEffect(() => {
    const load = async () => {
      try {
        const toolkit = await fetchToolkit(languageId);
        if (!isUnmounted()) {
          setState({ status: "ok", toolkit });
        }
      } catch (e) {
        logging.error(e);
        if (!isUnmounted()) {
          setState({
            status: "error",
          });
        }
      }
    };
    load();
  }, [setState, isUnmounted, logging, languageId]);
  return state;
};

export const useApiDocs = (): ApiDocsResponse | undefined => {
  const client = useLanguageServerClient();
  const [apidocs, setApiDocs] = useState<ApiDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await apiDocs(client);
        pullModulesToTop(docs);
        setApiDocs(docs);
      }
    };
    load();
  }, [client]);
  return apidocs;
};

export const useSkullDocs = (): SkullDocsResponse | undefined => {
  const client = useLanguageServerClient();
  const [skulldocs, setSkullDocs] = useState<SkullDocsResponse | undefined>();
  useEffect(() => {
    const load = async () => {
      if (client) {
        await client.initialize();
        const docs = await skullDocs(client);
        skullModulesToTop(docs);
        setSkullDocs(docs);
      }
    };
    load();
  }, [client]);
  return skulldocs;
};

let dragImageRefCount = 0;

export const useCodeDragImage = (): RefObject<HTMLImageElement | undefined> => {
  const ref = useRef<HTMLImageElement>();
  useEffect(() => {
    const id = "code-drag-image";
    let img = document.getElementById(id) as HTMLImageElement | null;
    if (!img) {
      img = new Image();
      img.id = id;
      img.alt = "";
      img.src = dragImage;
      // Seems to need to be in the DOM for Safari.
      // Our layout means this will be offscreen.
      document.body.appendChild(img);
    }
    ref.current = img;
    dragImageRefCount++;
    return () => {
      if (!img) {
        throw new Error();
      }
      dragImageRefCount--;
      if (dragImageRefCount === 0) {
        img.remove();
      }
    };
  }, []);
  return ref;
};
