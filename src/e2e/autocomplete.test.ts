/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - autocomplete and signature help tests", () => {
  // Enable flags to allow testing the toolkit interactions.
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("shows autocomplete as you type", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");

    // Initial completions
    await app.findCompletionOptions(["scroll", "set_pixel", "show"]);
    await app.findCompletionActiveOption("scroll(value)");

    // Further refinement
    await app.typeInEditor("h");
    await app.findCompletionActiveOption("show(image)");

    // Accepted completion
    await app.acceptCompletion("show");
    await app.findVisibleEditorContents("display.show()");
  });

  it("autocomplete can navigate to toolkit content", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");

    await app.findCompletionActiveOption("show(image)");

    await app.followCompletionOrSignatureDocumentionLink();

    await app.findActiveToolkitEntry("show(image)");
  });

  it("shows signature help after autocomplete", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.sho");
    await app.acceptCompletion("show");

    await app.findSignatureHelp("show(image)");
  });

  it("does not insert brackets for import completion", async () => {
    // This relies on undocumented Pyright behaviour so important to cover at a high level.
    await app.selectAllInEditor();
    await app.typeInEditor("from audio import is_pla");
    await app.acceptCompletion("is_playing");

    await app.findVisibleEditorContents(/is_playing$/);
  });

  it("signature can navigate to toolkit content", async () => {
    await app.selectAllInEditor();
    // The closing bracket is autoinserted.
    await app.typeInEditor("from microbit import *\ndisplay.show(");

    await app.findSignatureHelp("show(image)");

    await app.followCompletionOrSignatureDocumentionLink();

    await app.findActiveToolkitEntry("clear()");
  });
});
