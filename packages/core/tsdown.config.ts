import { defineConfig } from "tsdown";
import { rm } from "node:fs/promises";
import { build } from "tsdown";

export default defineConfig({
  exports: true,
  // minify: true,
  plugins: [importRaw()],
  dts: true,
});

function importRaw() {
  const outDir = `.tsdown-temp-${crypto.randomUUID()}`;

  return {
    name: "raw-import",
    async load(id: string) {
      if (id.endsWith("?raw")) {
        const filePath = id.replace("?raw", "");

        const built = await build({ entry: filePath, outDir, dts: false });
        const output = built[0].chunks.es?.[0];
        const code = output?.type === "chunk" && output.code;
        if (!code) return null;

        return `export default \`${code.replace(/`/g, "\\`")}\``;
      }
      return null;
    },
    async closeBundle() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        await rm(outDir, {
          recursive: true,
          force: true,
          maxRetries: 3,
          retryDelay: 100,
        });
        console.log("[RAW IMPORT] cleaned .tsdown-temp");
      } catch (err) {
        console.warn("[RAW IMPORT] cleanup failed:", err);
      }
    },
  };
}
