import { expect, it, vi } from "vitest";

import { fetchConfigFile } from "../../src/utils/fetch-config-file.js";
import { getEligibleBranches } from "../../src/utils/get-eligible-branches.js";
import { mockedBranch } from "./fixtures/mocked-branch.js";
import { mockedOwner } from "./fixtures/mocked-owner.js";
import { mockedRepo } from "./fixtures/mocked-repo.js";
import { mockedToken } from "./fixtures/mocked-token.js";

const mockedDefaultEligibleBranches = ["alpha", "beta", "main", "master", "next"];

vi.mock("../../src/utils/fetch-config-file.js", () => ({
  fetchConfigFile: vi.fn()
}));

it("should get the eligible branches from the default config if at least one argument is an empty string", async () => {
  expect(await getEligibleBranches("", "", "", mockedToken)).toEqual(mockedDefaultEligibleBranches);
});
it("should get the eligible branches from the default config if the config file does not exist", async () => {
  vi.mocked(fetchConfigFile).mockResolvedValue(null);
  expect(await getEligibleBranches(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toEqual(
    mockedDefaultEligibleBranches
  );
});
it("should get the eligible branches from the default config if the config file exists, but does not set the branches", async () => {
  vi.mocked(fetchConfigFile).mockResolvedValue({
    dryRun: true
  });
  expect(await getEligibleBranches(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toEqual(
    mockedDefaultEligibleBranches
  );
});
it("should get the eligible branches from the default config if the config file exists, but does not set the branches as an array", async () => {
  vi.mocked(fetchConfigFile).mockResolvedValue({
    branches: "main",
    dryRun: true
  });
  expect(await getEligibleBranches(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toEqual(
    mockedDefaultEligibleBranches
  );
});
it("should get the eligible branches from the file config if it exists", async () => {
  vi.mocked(fetchConfigFile).mockResolvedValue({
    branches: ["main"],
    dryRun: true
  });
  expect(await getEligibleBranches(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toEqual([
    "main"
  ]);
});
