import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root } from "hast";
import type { VFile } from "vfile";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export function extractHeadings() {
  return function transformer(tree: Root, file: VFile) {
    const headings: Heading[] = [];

    visit(tree, "element", (node) => {
      if (/^h[2-3]$/.test((node as { tagName: string }).tagName)) {
        const el = node as {
          tagName: string;
          properties?: Record<string, unknown>;
          children: unknown[];
        };
        const depth = parseInt(el.tagName[1], 10);
        const slug = (el.properties?.id as string) ?? "";
        const text = toString(node as Parameters<typeof toString>[0]);
        headings.push({ depth, slug, text });
      }
    });

    const fm = (file.data.fm as Record<string, unknown>) ?? {};
    file.data.fm = { ...fm, headings };
  };
}
