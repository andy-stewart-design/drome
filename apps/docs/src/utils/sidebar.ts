type BaseItem = { id: string };

type TreeItem<T extends BaseItem> = ({ type: "item" } & T) | TreeFolder<T>;

type TreeFolder<T extends BaseItem> = {
  type: "folder";
  id: string;
  items: TreeItem<T>[];
};

function buildSidebar<T extends { id: string; data?: { order?: number } }>(items: T[]): TreeItem<T>[] {
  const sortedPosts = items.sort((a, b) => {
    const aSegments = a.id.split("/");
    const bSegments = b.id.split("/");

    if (aSegments.length !== bSegments.length) {
      return aSegments.length - bSegments.length;
    }

    const aParent = aSegments.slice(0, -1).join("/");
    const bParent = bSegments.slice(0, -1).join("/");
    if (aParent !== bParent) {
      return aParent.localeCompare(bParent);
    }

    const aOrder = a.data?.order;
    const bOrder = b.data?.order;

    if (aOrder !== undefined && bOrder !== undefined) {
      if (aOrder !== bOrder) return aOrder - bOrder;
    } else if (aOrder !== undefined) {
      return -1;
    } else if (bOrder !== undefined) {
      return 1;
    }

    return a.id.localeCompare(b.id);
  });

  const groupedItems = sortedPosts.reduce((tree: TreeItem<T>[], item) => {
    const segments = item.id.split("/");
    let currentLevel = tree;
    let cumulativePath = "";

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1;
      cumulativePath = cumulativePath
        ? `${cumulativePath}/${segment}`
        : segment;

      if (isLast) {
        currentLevel.push({ type: "item", ...item });
      } else {
        let folder = currentLevel.find(
          (node): node is TreeFolder<T> =>
            node.type === "folder" && node.id === cumulativePath,
        );

        if (!folder) {
          folder = { type: "folder", id: cumulativePath, items: [] };
          currentLevel.push(folder);
        }

        currentLevel = folder.items;
      }
    });

    return tree;
  }, []);

  return groupedItems;
}

export { buildSidebar, type TreeItem };
