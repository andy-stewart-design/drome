import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";

const inDir = join(dirname(fileURLToPath(import.meta.url)), "samples");
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const outFile = join(outDir, "drome.json");
console.log(outDir);

async function combineJSONFiles() {
  const result: Record<string, any> = {};

  // Get all files in directory
  const files = await readdir(inDir);

  // Filter to only .json files
  const jsonFiles = files.filter((f) => f.toLowerCase().endsWith(".json"));

  for (const file of jsonFiles) {
    const filePath = join(inDir, file);
    const content = await readFile(filePath, "utf8");

    try {
      const parsed = JSON.parse(content);
      const key = basename(file, ".json");
      result[key] = parsed;
    } catch (err) {
      console.error(`❌ Error parsing ${file}:`, (err as Error).message);
    }
  }

  await mkdir(outDir);
  await writeFile(outFile, JSON.stringify(result, null, 2), "utf8");
  console.log(`✅ Combined JSON written to ${outFile}`);
}

// // // Usage from CLI:
// // // node combine-json.js path/to/folder output.json
// // const [inputDir, outputFile] = process.argv.slice(2);

// // if (!inputDir || !outputFile) {
// //   console.error("Usage: node combine-json.js <folder> <outputFile>");
// //   process.exit(1);
// // }

combineJSONFiles().catch((err) => {
  console.error("Unexpected error:", err);
});
