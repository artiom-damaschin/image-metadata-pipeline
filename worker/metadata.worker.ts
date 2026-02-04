import { parentPort } from "node:worker_threads";

import { extractMetadata } from "../lib/extract-metadata.ts";
import type { Metadata } from "../lib/types.ts";

parentPort?.on("message", async (filePaths: string[]) => {
  const results: Metadata[] = [];

  try {
    for (const filePath of filePaths) {
      const metadata = await extractMetadata(filePath);

      results.push(metadata);
    }
  } catch (error) {
    console.error(error);
  }

  parentPort?.postMessage(results);
});
