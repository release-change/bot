import { beforeEach, expect, it, vi } from "vitest";

import { processReleaseChange } from "../src/handler/process-release-change.js";
import * as runReleaseChangeModule from "../src/handler/run-release-change.js";
import * as cloneRepositoryModule from "../src/utils/clone-repository.js";
import * as createTemporaryWorkspaceModule from "../src/utils/create-temporary-workspace.js";
import * as deleteTemporaryWorkspaceModule from "../src/utils/delete-temporary-workspace.js";
import { fetchConfigFile } from "../src/utils/fetch-config-file.js";
import * as getEligibleBranchesModule from "../src/utils/get-eligible-branches.js";
import * as getInstallationTokenModule from "../src/utils/get-installation-token.js";
import { mockedJob } from "./fixtures/mocked-job.js";

vi.mock("../src/utils/fetch-config-file.js", () => ({
  fetchConfigFile: vi.fn()
}));
vi.mocked(fetchConfigFile).mockResolvedValue({ branches: ["main"] });

beforeEach(() => {
  vi.spyOn(getInstallationTokenModule, "getInstallationToken").mockResolvedValue("fake-token");
  vi.spyOn(getEligibleBranchesModule, "getEligibleBranches").mockResolvedValue(["main"]);
  vi.spyOn(createTemporaryWorkspaceModule, "createTemporaryWorkspace").mockResolvedValue(
    "/tmp/release-change-123-abcdef0-"
  );
  vi.spyOn(cloneRepositoryModule, "cloneRepository").mockResolvedValue(undefined);
  vi.spyOn(runReleaseChangeModule, "runReleaseChange").mockResolvedValue(undefined);
  vi.spyOn(deleteTemporaryWorkspaceModule, "deleteTemporaryWorkspace").mockResolvedValue(undefined);
});

it("should not clone the repository nor run release-change if the token could not be got", async () => {
  const errorMessage = "Could not get installation token";
  vi.spyOn(getInstallationTokenModule, "getInstallationToken").mockRejectedValue(
    new Error(errorMessage)
  );
  await expect(processReleaseChange(mockedJob)).rejects.toThrow(errorMessage);
  expect(getEligibleBranchesModule.getEligibleBranches).not.toHaveBeenCalled();
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).not.toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).not.toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).not.toHaveBeenCalled();
});
it("should not clone the repository nor run release-change if the branch is not eligible", async () => {
  await processReleaseChange({ ...mockedJob, branch: "wrong-branch" });
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).not.toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).not.toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).not.toHaveBeenCalled();
});
it("should clone the repository and run release-change if the branch is eligible", async () => {
  await processReleaseChange(mockedJob);
  expect(createTemporaryWorkspaceModule.createTemporaryWorkspace).toHaveBeenCalled();
  expect(cloneRepositoryModule.cloneRepository).toHaveBeenCalled();
  expect(runReleaseChangeModule.runReleaseChange).toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).toHaveBeenCalled();
});
it("should directly delete the temporary workspace if the repository fails to be cloned", async () => {
  const mockedErrorMessage = "Failed to clone the repository.";
  vi.spyOn(cloneRepositoryModule, "cloneRepository").mockRejectedValue(
    new Error(mockedErrorMessage)
  );
  await expect(processReleaseChange(mockedJob)).rejects.toThrow(mockedErrorMessage);
  expect(runReleaseChangeModule.runReleaseChange).not.toHaveBeenCalled();
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).toHaveBeenCalled();
});
it("should delete the temporary workspace if release-change fails to be run", async () => {
  const mockedErrorMessage = "release-change exited with code 1";
  vi.spyOn(runReleaseChangeModule, "runReleaseChange").mockRejectedValue(
    new Error(mockedErrorMessage)
  );
  await expect(processReleaseChange(mockedJob)).rejects.toThrow(mockedErrorMessage);
  expect(deleteTemporaryWorkspaceModule.deleteTemporaryWorkspace).toHaveBeenCalled();
});
