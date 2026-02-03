import path from "node:path";

import { extractMetadata } from "./lib/extract-metadata.ts";
import { groupByCamera } from "./lib/group-by-camera.ts";
import { scanDir } from "./lib/scan-dir.ts";

async function main() {
  const dir = process.argv[2];

  if (!dir) {
    console.error("Usage: node index.js <image-directory>");
    process.exit(1);
  }

  const filePaths = await scanDir(path.resolve(dir));
  const results = [];

  for (const filePath of filePaths) {
    const fileMetadata = await extractMetadata(filePath);

    results.push(fileMetadata);
  }
  const grouped = groupByCamera(results);

  console.log(grouped);
}

console.time("Execution Time");
await main();
console.timeEnd("Execution Time");
