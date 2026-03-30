import { z } from "zod";
import { buildSidebar, type TreeItem } from "./sidebar.js";
import type { Component } from "svelte";

const frontmatterSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  created: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  published: z.boolean().default(true),
  order: z.number().optional(),
  heroImage: z.string().optional(),
  headings: z
    .array(
      z.object({
        depth: z.number(),
        slug: z.string(),
        text: z.string(),
      }),
    )
    .default([]),
});

export type DocFrontmatter = z.infer<typeof frontmatterSchema>;

export interface DocEntry {
  id: string;
  slug: string;
  data: DocFrontmatter;
  component: Component;
}

const modules = import.meta.glob<{
  default: Component;
  metadata: Record<string, unknown>;
}>("/src/content/docs/**/*.{md,mdx}", { eager: true });

function pathToId(path: string): string {
  return path.replace("/src/content/docs/", "").replace(/\.(md|mdx)$/, "");
}

export function getAllDocs(): DocEntry[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const id = pathToId(path);
      const parsed = frontmatterSchema.safeParse(mod.metadata ?? {});
      if (!parsed.success) {
        console.warn(
          `[content] Invalid frontmatter in ${path}:`,
          parsed.error.flatten(),
        );
        return null;
      }
      return {
        id,
        slug: id,
        data: parsed.data,
        component: mod.default,
      };
    })
    .filter((entry): entry is DocEntry => entry !== null);
}

export function getPublishedDocs(): DocEntry[] {
  return getAllDocs().filter(
    (doc) => doc.data.published !== false && !doc.id.endsWith("/_index"),
  );
}

export function getSidebarTree(): TreeItem<DocEntry>[] {
  const all = getAllDocs().filter((doc) => doc.data.published !== false);
  return buildSidebar(all);
}

export function getDocBySlug(slug: string): DocEntry | undefined {
  return getPublishedDocs().find((doc) => doc.slug === slug);
}
