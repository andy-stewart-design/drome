import { getSidebarTree } from "$lib/content.js";
import type { LayoutLoad } from "./$types.js";

export const prerender = true;

export const load: LayoutLoad = () => {
  return {
    sidebarTree: getSidebarTree(),
  };
};
