import { parentPort } from "node:worker_threads";

import { extractMetadata } from "../lib/extract-metadata.ts";

parentPort?.on("message", async (filePaths: string[]) => {
  try {
    const results = await Promise.all(filePaths.map((f) => extractMetadata(f)));

    parentPort?.postMessage({ success: true, data: results });
  } catch (error) {
    console.error(error);
    parentPort?.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
