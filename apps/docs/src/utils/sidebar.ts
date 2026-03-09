type BaseItem = { id: string };

type TreeItem<T extends BaseItem> = ({ type: "item" } & T) | TreeFolder<T>;

type TreeFolder<T extends BaseItem> = {
  type: "folder";
  id: string;
  items: TreeItem<T>[];
};

function buildSidebar<T extends { id: string }>(items: T[]): TreeItem<T>[] {
  const sortedPosts = items.sort((a, b) => {
    const aSegments = a.id.split("/");
    const bSegments = b.id.split("/");

    if (aSegments.length === bSegments.length) {
      return a.id.localeCompare(b.id);
    }

    return aSegments.length - bSegments.length;
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
