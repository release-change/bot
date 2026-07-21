import { beforeEach, expect, it, vi } from "vitest";

import { handleWebhook } from "../src/handler/handle-webhook.js";
import * as runReleaseChangeModule from "../src/handler/run-release-change.js";
import * as cloneRepositoryModule from "../src/utils/clone-repository.js";
import * as createTemporaryWorkspaceModule from "../src/utils/create-temporary-workspace.js";
import * as deleteTemporaryWorkspaceModule from "../src/utils/delete-temporary-workspace.js";
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
  vi.spyOn(createTemporaryWorkspaceModule, "createTemporaryWorkspace").mockResolvedValue(
    "/tmp/release-change-123-abcdef0-"
  );
  vi.spyOn(cloneRepositoryModule, "cloneRepository").mockResolvedValue(undefined);
  vi.spyOn(runReleaseChangeModule, "runReleaseChange").mockResolvedValue(undefined);
  vi.spyOn(deleteTemporaryWorkspaceModule, "deleteTemporaryWorkspace").mockResolvedValue(undefined);
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
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).not.toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).not.toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).not.toHaveBeenCalled();
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
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).not.toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).not.toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).not.toHaveBeenCalled();
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
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).toHaveBeenCalled();
});
