import { basicSetup, EditorView } from "codemirror";

import { javascript } from "./language";
import { theme } from "./theme";

function createCodeMirror(parent: HTMLElement, doc = "") {
  return new EditorView({
    doc,
    extensions: [basicSetup, theme, javascript()],
    parent,
  });
}

export { createCodeMirror };
