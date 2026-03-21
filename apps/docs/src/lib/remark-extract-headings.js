import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";

/** @returns {import('unified').Transformer} */
export function remarkExtractHeadings() {
  return function transformer(tree, file) {
    const slugger = new GithubSlugger();
    const headings = [];

    visit(tree, "heading", (node) => {
      if (node.depth < 2 || node.depth > 3) return;

      const text = node.children
        .filter((child) => child.type === "text" || child.type === "inlineCode")
        .map((child) => child.value)
        .join("");

      const slug = slugger.slug(text);
      headings.push({ depth: node.depth, slug, text });
    });

    const fm = file.data.fm ?? {};
    file.data.fm = { ...fm, headings };
  };
}
