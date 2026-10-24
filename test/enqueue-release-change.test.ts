import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { enqueueReleaseChange, waitForChain } from "../src/handler/enqueue-release-change.js";
import * as processReleaseChangeModule from "../src/handler/process-release-change.js";
import { mockedJob } from "./fixtures/mocked-job.js";

beforeEach(() => {
  vi.spyOn(processReleaseChangeModule, "processReleaseChange").mockImplementation(async () => {});
});
afterEach(async () => {
  await waitForChain();
});

it("should not process a job synchronously when it is enqueued", () => {
  enqueueReleaseChange(mockedJob);
  expect(processReleaseChangeModule.processReleaseChange).not.toHaveBeenCalled();
});
it("should resolve `waitForChain()` immediately when the queue is empty", async () => {
  await expect(waitForChain()).resolves.toBe(undefined);
});
it("should process the enqueued job in the background", async () => {
  enqueueReleaseChange(mockedJob);
  await waitForChain();
  expect(processReleaseChangeModule.processReleaseChange).toHaveBeenCalledWith(mockedJob);
});
it("should process jobs in FIFO order", async () => {
  const order: string[] = [];
  vi.spyOn(processReleaseChangeModule, "processReleaseChange").mockImplementation(async job => {
    order.push(job.deliveryId);
  });
  enqueueReleaseChange({ ...mockedJob, deliveryId: "1" });
  enqueueReleaseChange({ ...mockedJob, deliveryId: "2" });
  enqueueReleaseChange({ ...mockedJob, deliveryId: "3" });
  await waitForChain();
  expect(order).toStrictEqual(["1", "2", "3"]);
});
it("should not start a job before the previous one has completed", async () => {
  const deferred = () => {
    let resolve: () => void = () => {};
    let reject: (reason?: unknown) => void = () => {};
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
  const started = deferred();
  const gate = deferred();
  vi.spyOn(processReleaseChangeModule, "processReleaseChange")
    .mockImplementationOnce(async () => {
      started.resolve();
      await gate.promise;
    })
    .mockImplementationOnce(async () => {});
  enqueueReleaseChange(mockedJob);
  enqueueReleaseChange({ ...mockedJob, deliveryId: "second" });
  await started.promise;
  try {
    expect(processReleaseChangeModule.processReleaseChange).toHaveBeenCalledTimes(1);
  } finally {
    gate.resolve();
  }
  await waitForChain();
  expect(processReleaseChangeModule.processReleaseChange).toHaveBeenCalledTimes(2);
});
it("should keep processing subsequent jobs when a job fails", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(processReleaseChangeModule.processReleaseChange)
    .mockImplementationOnce(async () => {
      throw new Error("Failed to clone the repository.");
    })
    .mockImplementationOnce(async () => {});
  enqueueReleaseChange({ ...mockedJob, deliveryId: "failing" });
  enqueueReleaseChange({ ...mockedJob, deliveryId: "healthy" });
  await waitForChain();
  expect(processReleaseChangeModule.processReleaseChange).toHaveBeenCalledTimes(2);
  expect(consoleError).toHaveBeenCalledTimes(1);
});
it("should log the delivery ID of a failed job", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(processReleaseChangeModule.processReleaseChange).mockImplementationOnce(async () => {
    throw new Error("Failed to run release-change.");
  });
  enqueueReleaseChange({ ...mockedJob, deliveryId: "failing-delivery" });
  await waitForChain();
  expect(consoleError).toHaveBeenCalledWith(
    "Failed to process release-change job (delivery failing-delivery): Failed to run release-change."
  );
});
it("should resolve `waitForChain()` after a failed job", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(processReleaseChangeModule.processReleaseChange).mockImplementationOnce(async () => {
    throw new Error("Failed to clone the repository.");
  });
  enqueueReleaseChange(mockedJob);
  await expect(waitForChain()).resolves.toBe(undefined);
});
