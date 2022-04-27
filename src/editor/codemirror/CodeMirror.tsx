/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { highlightActiveLineGutter, lineNumbers} from "@codemirror/gutter";
import { redoDepth, undoDepth } from "@codemirror/history";
import { lintGutter } from "./lint/lint";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";
import { EditorView, highlightActiveLine } from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { createUri } from "../../language-server/client";
import { useLanguageServerClient } from "../../language-server/language-server-hooks";
import { useLogging } from "../../logging/logging-hooks";
import { useRouterState } from "../../router-hooks";
import { ParameterHelpOption } from "../../settings/settings";
import { WorkbenchSelection } from "../../workbench/use-selection";
import {
  EditorActions,
  useActiveEditorActionsState,
  useActiveEditorInfoState,
} from "../active-editor-hooks";
import "./CodeMirror.css";
import { compartment, editorConfig } from "./config";
import { languageServer } from "./language-server/view";
import {
	dndStructure,
	// DndStructureSettings,
	dndStructureHighlightingCompartment,
} from "./dnd-extension";
import { codeStructure, CodeStructureSettings } from "./structure-highlighting";
import themeExtensions from "./themeExtensions";


interface CodeMirrorProps {
  className?: string;
  defaultValue: string;
  onChange: (doc: string) => void;

  selection: WorkbenchSelection;
  fontSize: number;
  codeStructureSettings: CodeStructureSettings;
  parameterHelpOption: ParameterHelpOption;
}

/**
 * A React component for CodeMirror 6.
 *
 * Changing style-related props will dispatch events to update CodeMirror.
 *
 * The document itself is uncontrolled. Consider using a key for the editor
 * (e.g. based on the file being edited).
 */
const CodeMirror = ({
  defaultValue,
  className,
  onChange,
  selection,
  fontSize,
  codeStructureSettings,
  parameterHelpOption,
}: CodeMirrorProps) => {
  // Really simple model for now as we only have one editor at a time.
  const [, setActiveEditor] = useActiveEditorActionsState();
  const uri = createUri(selection.file);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const client = useLanguageServerClient();
  const intl = useIntl();
  const [, setEditorInfo] = useActiveEditorInfoState();
  const logging = useLogging();

  // Reset undo/redo events on file change.
  useEffect(() => {
    setEditorInfo({
      undo: 0,
      redo: 0,
    });
  }, [setEditorInfo]);

  // Group the option props together to keep configuration updates simple.
  const options = useMemo(
    () => ({
      fontSize,
      codeStructureSettings,
      parameterHelpOption,
    }),
    [fontSize, codeStructureSettings, parameterHelpOption]
  );

  useEffect(() => {
    const initializing = !viewRef.current;
    if (initializing) {
      const notify = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.sliceDoc(0));
          setEditorInfo({
            undo: undoDepth(view.state),
            redo: redoDepth(view.state),
          });
        }
      });
      const state = EditorState.create({
        doc: defaultValue,
        extensions: [
          notify,
          editorConfig,
          // Extensions only relevant for editing:
          // Order of lintGutter and lineNumbers determines how they are displayed.
          lintGutter(),
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          // Extensions we enable/disable based on props.
          dndStructureHighlightingCompartment.of(
            //Changing the settings here doesn't seem to have any impact
            dndStructure({dragSmallStatements:false, indentHandles: false})
          ),
          compartment.of([
            client
              ? languageServer(client, uri, intl, logging, {
                  signatureHelp: {
                    automatic: parameterHelpOption === "automatic",
                  },
                })
              : [],
            codeStructure(options.codeStructureSettings),
            themeExtensionsForOptions(options),
          ]),
        ],
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });

      viewRef.current = view;
      setActiveEditor(new EditorActions(view, logging));
    }
  }, [
    client,
    defaultValue,
    intl,
    logging,
    onChange,
    options,
    setActiveEditor,
    setEditorInfo,
    parameterHelpOption,
    uri,
  ]);
  useEffect(() => {
    // Do this separately as we don't want to destroy the view whenever options needed for initialization change.
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
        setActiveEditor(undefined);
      }
    };
  }, [setActiveEditor]);

  useEffect(() => {
    viewRef.current!.dispatch({
      effects: [
        dndStructureHighlightingCompartment.reconfigure(
            dndStructure({dragSmallStatements: false, indentHandles: false})
        ),
        compartment.reconfigure([
          client
            ? languageServer(client, uri, intl, logging, {
                signatureHelp: {
                  automatic: parameterHelpOption === "automatic",
                },
              })
            : [],
          codeStructure(options.codeStructureSettings),
          themeExtensionsForOptions(options),
        ]),
      ],
    });
  }, [options, parameterHelpOption, client, intl, logging, uri]);

  const { location } = selection;
  useEffect(() => {
    // When the identity of location changes then the user has navigated.
    if (location.line) {
      const view = viewRef.current!;
      let line;
      try {
        line = view.state.doc.line(location.line);
      } catch (e) {
        // Document doesn't have that line, e.g. link from stale error
        // after a code edit.
        return;
      }
      view.dispatch({
        scrollIntoView: true,
        selection: EditorSelection.single(line.from),
      });
      view.focus();
    }
  }, [location]);

  const [routerState, setRouterState] = useRouterState();
  useEffect(() => {
    const listener = (event: Event) => {
      const id = (event as CustomEvent).detail.id;
      setRouterState(
        {
          tab: "api",
          api: { id },
        },
        "documentation-from-code"
      );
      const view = viewRef.current!;
      // Put the focus back in the text editor so the docs are immediately useful.
      view.focus();
    };
    document.addEventListener("cm/openDocs", listener);
    return () => {
      document.removeEventListener("cm/openDocs", listener);
    };
  }, [routerState, setRouterState]);

  return (
    <section
      data-testid="editor"
      aria-label={intl.formatMessage({ id: "code-editor" })}
      style={{ height: "100%" }}
      className={className}
      ref={elementRef}
    />
  );
};

function themeExtensionsForOptions(options: { fontSize: number }): Extension {
  return themeExtensions(options.fontSize + "pt");
}

export default CodeMirror;
