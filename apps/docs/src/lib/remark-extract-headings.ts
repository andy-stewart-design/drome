import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root, Text, InlineCode } from "mdast";

export const remarkExtractHeadings: Plugin<[], Root> = () => {
  return function transformer(tree, file) {
    const slugger = new GithubSlugger();
    const headings: { depth: number; slug: string; text: string }[] = [];

    visit(tree, "heading", (node) => {
      if (node.depth < 2 || node.depth > 3) return;

      const text = node.children
        .filter(
          (child): child is Text | InlineCode =>
            child.type === "text" || child.type === "inlineCode",
        )
        .map((child) => child.value)
        .join("");

      const slug = slugger.slug(text);
      headings.push({ depth: node.depth, slug, text });
    });

    const fm = (file.data.fm as Record<string, unknown>) ?? {};
    file.data.fm = { ...fm, headings };
  };
};
