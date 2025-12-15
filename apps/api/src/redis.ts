import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { config } from "./config";

export const connection = new IORedis(config.redisUrl);

export const resolutionQueue = new Queue("resolution", { connection });

export function createWorker(handler: (jobName: string, data: any) => Promise<void>) {
  return new Worker(
    "resolution",
    async (job) => {
      await handler(job.name, job.data);
    },
    { connection }
  );
}
