import rehypeSlug from "rehype-slug";
import { remarkExtractHeadings } from "./src/lib/remark-extract-headings.ts";
import { remarkAlerts } from "./src/lib/remark-alerts.ts";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: ["javascript", "typescript", "bash", "json", "css", "html"],
});

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: [".md", ".mdx"],
  highlight: {
    highlighter: (code, lang) => {
      const language =
        lang && highlighter.getLoadedLanguages().includes(lang) ? lang : "text";
      return highlighter
        .codeToHtml(code, {
          lang: language,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        })
        .replace(/\{/g, "&#123;")
        .replace(/\}/g, "&#125;")
        .replace(/ tabindex="0"/g, "");
    },
  },
  remarkPlugins: [remarkExtractHeadings, remarkAlerts],
  rehypePlugins: [rehypeSlug],
};

export default config;
