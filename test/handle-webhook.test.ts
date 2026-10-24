import { beforeEach, expect, it, vi } from "vitest";

import * as enqueueReleaseChangeModule from "../src/handler/enqueue-release-change.js";
import { handleWebhook } from "../src/handler/handle-webhook.js";
import { mockSign } from "./fixtures/mock-sign.js";
import { mockedConfig } from "./fixtures/mocked-config.js";
import { mockedJob } from "./fixtures/mocked-job.js";
import { mockedValidPayload } from "./fixtures/mocked-valid-payload.js";

beforeEach(() => {
  vi.spyOn(enqueueReleaseChangeModule, "enqueueReleaseChange").mockImplementation(() => {});
});

it("should reject an invalid signature", async () => {
  const body = JSON.stringify(mockedValidPayload);
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": "sha256=invalid" },
    body
  );
  expect(result).toStrictEqual({ status: 401, message: "Invalid signature" });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).not.toHaveBeenCalled();
});
it("should ignore any events which are not push", async () => {
  const body = JSON.stringify(mockedValidPayload);
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "pull_request", "x-hub-signature-256": mockSign(body) },
    body
  );
  expect(result).toStrictEqual({
    status: 200,
    message: "The event is ignored; therefore, release-change will not be triggered."
  });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).not.toHaveBeenCalled();
});
it("should ignore the push event if the branch is deleted", async () => {
  const body = JSON.stringify({
    ...mockedValidPayload,
    ref: "refs/heads/deleted-branch",
    deleted: true
  });
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": mockSign(body) },
    body
  );
  expect(result).toStrictEqual({
    status: 200,
    message:
      "The referenced branch has been deleted; therefore, release-change will not be triggered."
  });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).not.toHaveBeenCalled();
});
it("should ignore the push event if the branch is a tag branch", async () => {
  const body = JSON.stringify({
    ...mockedValidPayload,
    ref: "refs/tags/v1.2.3"
  });
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": mockSign(body) },
    body
  );
  expect(result).toStrictEqual({
    status: 200,
    message: "The referenced branch is a tag; therefore, release-change will not be triggered."
  });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).not.toHaveBeenCalled();
});
it("should queue release-change if the branch is not eligible", async () => {
  const body = JSON.stringify({ ...mockedValidPayload, ref: "refs/heads/wrong-branch" });
  const result = await handleWebhook(
    mockedConfig,
    {
      "x-github-event": "push",
      "x-github-delivery": "fake-id",
      "x-hub-signature-256": mockSign(body)
    },
    body
  );
  expect(result).toStrictEqual({
    status: 202,
    message: "release-change being triggered…"
  });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).toHaveBeenCalledWith({
    ...mockedJob,
    branch: "wrong-branch"
  });
});
it("should run release-change if the branch is eligible", async () => {
  const body = JSON.stringify(mockedValidPayload);
  const result = await handleWebhook(
    mockedConfig,
    {
      "x-github-event": "push",
      "x-github-delivery": "fake-id",
      "x-hub-signature-256": mockSign(body)
    },
    body
  );
  expect(result).toStrictEqual({
    status: 202,
    message: "release-change being triggered…"
  });
  expect(enqueueReleaseChangeModule.enqueueReleaseChange).toHaveBeenCalledWith(mockedJob);
});
