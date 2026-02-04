import path from "node:path";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";

import { groupByCamera } from "./lib/group-by-camera.ts";
import { scanDir } from "./lib/scan-dir.ts";
import { chunk } from "#utils";

const WORKER_PATH = new URL("./worker/metadata.worker.ts", import.meta.url);
const THREADS = Math.max(1, availableParallelism() - 1);
const BATCH_SIZE = 100;

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: node index.ts <image-dir>");
    process.exit(1);
  }

  const files = await scanDir(path.resolve(dir));
  const jobs = chunk(files, BATCH_SIZE);

  let completedJobs = 0;
  const results: any[] = [];

  const workers = Array.from({ length: THREADS }, (_, i) => {
    const worker = new Worker(WORKER_PATH, {
      name: `meta-worker-${i}`,
    });

    worker.on("message", (batchResult) => {
      results.push(...batchResult);
      completedJobs++;

      dispatch(worker);

      if (completedJobs === jobs.length) {
        const grouped = groupByCamera(results);

        for (const worker of workers) {
          worker.terminate();
        }
      }
    });

    worker.on("error", console.error);

    return worker;
  });

  let jobIndex = 0;

  function dispatch(worker: Worker) {
    if (jobIndex < jobs.length) {
      worker.postMessage(jobs[jobIndex++]);
    }
  }

  workers.forEach(dispatch);
}

main().catch(console.error);
