import rehypeSlug from "rehype-slug";
import { remarkExtractHeadings } from "./src/lib/remark-extract-headings.ts";

/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: [".md", ".mdx"],
  remarkPlugins: [remarkExtractHeadings],
  rehypePlugins: [rehypeSlug],
};

export default config;
