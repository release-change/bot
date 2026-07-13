import { beforeEach, expect, it, vi } from "vitest";

import { handleWebhook } from "../src/handler/handle-webhook.js";
import * as runReleaseChangeModule from "../src/handler/run-release-change.js";
import { fetchConfigFile } from "../src/utils/fetch-config-file.js";
import * as getInstallationTokenModule from "../src/utils/get-installation-token.js";
import { mockSign } from "./fixtures/mock-sign.js";
import { mockedConfig } from "./fixtures/mocked-config.js";
import { mockedValidPayload } from "./fixtures/mocked-valid-payload.js";

vi.mock("../src/utils/fetch-config-file.js", () => ({
  fetchConfigFile: vi.fn()
}));
vi.mocked(fetchConfigFile).mockResolvedValue({ branches: ["main"] });

beforeEach(() => {
  vi.spyOn(getInstallationTokenModule, "getInstallationToken").mockResolvedValue("fake-token");
  vi.spyOn(runReleaseChangeModule, "runReleaseChange").mockResolvedValue(undefined);
});

it("should reject an invalid signature", async () => {
  const body = JSON.stringify(mockedValidPayload);
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": "sha256=invalid" },
    body
  );
  expect(result).toStrictEqual({ status: 401, message: "Invalid signature" });
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
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
});
it("should ignore the push event if the branch is not eligible", async () => {
  const body = JSON.stringify({ ...mockedValidPayload, ref: "refs/heads/wrong-branch" });
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": mockSign(body) },
    body
  );
  expect(result).toStrictEqual({
    status: 200,
    message:
      "The referenced branch is not part of the ones targeted by the config; therefore, release-change will not be triggered."
  });
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
});
it("should run release-change if the branch is eligible", async () => {
  const body = JSON.stringify(mockedValidPayload);
  const result = await handleWebhook(
    mockedConfig,
    { "x-github-event": "push", "x-hub-signature-256": mockSign(body) },
    body
  );
  expect(result).toStrictEqual({
    status: 200,
    message: "release-change has been triggered."
  });
  expect(runReleaseChangeModule.runReleaseChange).toHaveBeenCalled();
});
