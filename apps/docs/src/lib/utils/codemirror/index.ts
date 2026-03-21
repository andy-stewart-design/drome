import { basicSetup, EditorView } from "codemirror";

import { javascript } from "./language.js";
import { theme } from "./theme.js";

function createCodeMirror(parent: HTMLElement, doc = "") {
  return new EditorView({
    doc,
    extensions: [basicSetup, theme, javascript()],
    parent,
  });
}

export { createCodeMirror };
