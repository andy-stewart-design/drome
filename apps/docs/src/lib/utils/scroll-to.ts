const SCROLL_Y_OFF = 40;

function scrollTo(e: MouseEvent, slug: string) {
  e.preventDefault();
  const yOff = document.getElementById(slug)?.getBoundingClientRect().top;
  if (yOff === undefined) return;

  const style = getComputedStyle(document.documentElement);
  const rem = parseFloat(style.fontSize);
  const headerHeight =
    parseFloat(style.getPropertyValue("--app-editor-header-height")) * rem;

  const top = yOff + window.scrollY - headerHeight - SCROLL_Y_OFF;
  window.scrollTo({ top, behavior: "smooth" });
  history.pushState(null, "", `#${slug}`);
}

export { scrollTo };
