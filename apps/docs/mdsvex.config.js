import rehypeSlug from "rehype-slug";
import { remarkExtractHeadings } from "./src/lib/remark-extract-headings.ts";
import { remarkAlerts } from "./src/lib/remark-alerts.ts";

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: [".md", ".mdx"],
  remarkPlugins: [remarkExtractHeadings, remarkAlerts],
  rehypePlugins: [rehypeSlug],
};

export default config;
