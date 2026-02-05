import { Worker } from "node:worker_threads";
import { EventEmitter } from "node:events";

import { chunk } from "#utils";

const WORKER_PATH = new URL("./metadata.worker.ts", import.meta.url);
const THREADS = Number(process.env.THREADS ?? 4);
const CHUNK_SIZE = 50;

class WorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private queue: string[][] = [];
  private results: any[] = [];
  private activeJobs = 0;
  private size: number;

  constructor(size: number) {
    super();

    this.size = size;
    this.initWorkers();
  }

  private initWorkers() {
    for (let thread = 0; thread < this.size; thread++) {
      const worker = new Worker(WORKER_PATH);

      worker.on("message", ({ data }) => {
        this.results.push(...data);
        this.activeJobs--;
        this.dispatch(worker);
      });

      worker.on("error", (err) => {
        console.error("Worker error: ", err);
        this.activeJobs--;
      });

      this.workers.push(worker);
    }
  }

  private async dispatch(worker: Worker) {
    if (this.queue.length > 0) {
      this.activeJobs++;

      worker.postMessage(this.queue.shift());
    } else if (this.activeJobs === 0) {
      this.emit("done", this.results);
    }
  }

  private async cleanup() {
    await Promise.all(this.workers.map((w) => w.terminate()));
  }

  async process(files: string[]) {
    this.queue = chunk(files, CHUNK_SIZE);

    this.workers.forEach((w) => this.dispatch(w));

    return new Promise((resolve) => {
      this.once("done", async (results) => {
        await this.cleanup();

        resolve(results);
      });
    });
  }
}

process.on("message", async (msg: { type?: string; payload?: string[] }) => {
  if (msg.type === "PROCESS_FILES") {
    const pool = new WorkerPool(THREADS);
    const results = await pool.process(msg.payload ?? []);

    process.send?.({ type: "done", data: results });
  }
});
