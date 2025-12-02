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
  const outDir = ".tsdown-temp";

  return {
    name: "raw-import",
    async load(id: string) {
      if (id.endsWith("?raw")) {
        const filePath = id.replace("?raw", "");

        const built = await build({ entry: filePath, outDir, dts: false });
        const output = built[0].chunks.es?.[0];
        const code = output?.type === "chunk" && output.code;
        console.log(filePath, code);
        if (!code) return null;

        return `export default \`${code.replace(/`/g, "\\`")}\``;
      }
      return null;
    },
    async closeBundle() {
      try {
        await rm(outDir, { recursive: true, force: true });
        console.log("[RAW IMPORT] cleaned .tsdown-temp");
      } catch (err) {
        console.warn("[RAW IMPORT] cleanup failed:", err);
      }
    },
  };
}
