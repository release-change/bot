import type { ReleaseChangeJob } from "../types.js";

import { processReleaseChange } from "./process-release-change.js";

let chain: Promise<void> = Promise.resolve();

/**
 * Enqueues a release-change job to be processed sequentially in the background.
 * @param job - The job to enqueue.
 */
export const enqueueReleaseChange = (job: ReleaseChangeJob): void => {
  chain = chain
    .then(() => processReleaseChange(job))
    .catch(error => {
      console.error(
        `Failed to process release-change job (delivery ${job.deliveryId}): ${error instanceof Error ? error.message : error}`
      );
    });
};

/**
 * Waits for the chain of release-change jobs to complete.
 */
export const waitForChain = (): Promise<void> => chain;
