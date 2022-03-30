import { ChangeSet, EditorState, Text, Transaction } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { dropdownPluginInternal } from "./dropdown";

describe("dropdown", () => {
  it("null case", () => {
    const view = createView();
    const plugin = new (dropdownPluginInternal(["foo","bar","baz"]))(view);

    expect(plugin.decorations.size).toEqual(0); //Empty document should have no dropdowns

    plugin.update(createViewUpdate(view, false, undefined));

    expect(plugin.decorations.size).toEqual(0); //Empty document with no update should still have no dropdowns
  });

  it("empty dropdown", () => {
    const view = createView();
    const plugin = new (dropdownPluginInternal([]))(view);

    expect(plugin.decorations.size).toEqual(0); //Empty doc should still have no dropdowns

    plugin.update(
      createViewUpdate(
        view,
        true,
        view.state.update({
          userEvent: "input.type",
          changes: [
            {
              insert: "foo bar\n",
              from: 0,
            },
          ],
        }),
      )
    );

    expect(plugin.decorations.size).toEqual(0); //Empty dropdown generates nothing
  });

  it("dropdowns are generated", () => {
    let view = createView();
    const plugin = new (dropdownPluginInternal(["foo", "bar", "baz"]))(view);

    const update = createViewUpdate(
      view,
      true,
      view.state.update({
        userEvent: "input.type",
        changes: [
          {
            insert: "foo\n",
            from: 0,
          },
        ],
      }),
    );
    plugin.update(update);
    view = update.view;

    expect(plugin.decorations.size).toEqual(1);
  });
});

const createView = (doc: Text = Text.of([""])): EditorView => {
  return {
    visibleRanges: [{ from: 0, to: doc.length - 1 }],
    state: EditorState.create({ doc }),
    dispatch: jest.fn(),
  } as Partial<EditorView> as unknown as EditorView;
};

const createViewUpdate = (
  view: EditorView,
  docChanged: boolean,
  transaction: Transaction | undefined
): ViewUpdate => {
  const state = transaction ? transaction.state || view.state : view.state;
  return {
    view: createView(state.doc),
    state,
    transactions: transaction ? [transaction] : [],
    changes: transaction ? transaction.changes : ChangeSet.empty(0),
    docChanged,
  } as Partial<ViewUpdate> as unknown as any;
};
