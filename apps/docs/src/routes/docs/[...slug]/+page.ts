import { getAllDocs, getDocBySlug } from "$lib/content.js";
import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types.js";

export const prerender = true;

export function entries() {
  return getAllDocs()
    .filter(
      (doc) => doc.data.published !== false && !doc.id.endsWith("/_index"),
    )
    .map((doc) => ({ slug: doc.slug }));
}

export const load: PageLoad = ({ params }) => {
  const doc = getDocBySlug(params.slug);
  if (!doc) error(404, "Not found");

  return {
    component: doc.component,
    title: doc.data.title,
    description: doc.data.description,
    created: doc.data.created,
    updated: doc.data.updated,
    headings: doc.data.headings,
  };
};
