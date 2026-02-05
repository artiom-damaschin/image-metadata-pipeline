import cluster from "node:cluster";
import { availableParallelism } from "node:os";
import path from "node:path";
import process from "node:process";

import { groupByCamera } from "./lib/group-by-camera.ts";
import { scanDir } from "./lib/scan-dir.ts";
import { chunk } from "#utils";

const NUM_CPUS = availableParallelism();

if (cluster.isPrimary) {
  let completedWorkers = 0;
  let results: any[] = [];
  const dir = process.argv[2];

  if (!dir) {
    console.error("Usage: node index.ts <image-dir>");
    process.exit(1);
  }

  const files = await scanDir(path.resolve(dir));
  const actualWorkers = Math.min(NUM_CPUS, files.length);
  const jobs = chunk(files, Math.ceil(files.length / actualWorkers));

  for (let i = 0; i < actualWorkers; i++) {
    const worker = cluster.fork({ THREADS: 4 });

    worker.send({
      type: "PROCESS_FILES",
      payload: jobs[i] ?? [],
    });

    worker.on("message", ({ type, data }) => {
      if (type === "done") {
        results.push(...data);
        completedWorkers++;

        if (completedWorkers === NUM_CPUS) {
          const grouped = groupByCamera(results);
          console.log(grouped);
          process.exit(0);
        }
      }
    });

    worker.on("error", console.error);
  }
} else {
  import("./worker/cluster.worker.ts");
}
