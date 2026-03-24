import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Blockquote, Paragraph } from "mdast";

// [!WARNING] is parsed as a linkReference with identifier "!warning"
const ALERT_ID_RE = /^!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)$/i;

const LABELS: Record<string, string> = {
  NOTE: "Note",
  TIP: "Tip",
  WARNING: "Warning",
  IMPORTANT: "Important",
  CAUTION: "Caution",
};

export const remarkAlerts: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "blockquote", (node: Blockquote) => {
      const firstChild = node.children[0];
      if (firstChild?.type !== "paragraph") return;

      const firstNode = firstChild.children[0];
      if (firstNode?.type !== "linkReference") return;

      const match = firstNode.identifier.match(ALERT_ID_RE);
      if (!match) return;

      const type = match[1].toUpperCase();
      const label = LABELS[type];

      // Remove the linkReference node from the paragraph
      firstChild.children.splice(0, 1);

      // The next sibling is typically a text node starting with "\n" — trim it
      const nextNode = firstChild.children[0];
      if (nextNode?.type === "text" && nextNode.value.startsWith("\n")) {
        nextNode.value = nextNode.value.slice(1);
        if (!nextNode.value) firstChild.children.splice(0, 1);
      }

      // If the paragraph is now empty, remove it
      if (firstChild.children.length === 0) {
        node.children.splice(0, 1);
      }

      // Prepend a title paragraph
      const titleNode: Paragraph = {
        type: "paragraph",
        data: { hProperties: { className: "callout-title" } },
        children: [{ type: "text", value: label }],
      };
      node.children.unshift(titleNode);

      // Rewrite blockquote -> div.callout.callout-{type}
      node.data = {
        hName: "div",
        hProperties: { className: `callout callout-${type.toLowerCase()}` },
      };
    });
  };
};
