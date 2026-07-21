import { runCommand } from "@release-change/shared";
import { expect, it, vi } from "vitest";

import { cloneRepository } from "../../src/utils/clone-repository.js";
import { mockedCwd } from "./fixtures/mocked-cwd.js";
import { mockedOwner } from "./fixtures/mocked-owner.js";
import { mockedRepo } from "./fixtures/mocked-repo.js";
import { mockedToken } from "./fixtures/mocked-token.js";

const expectedErrorMessage =
  "Failed to clone the repository: the owner and the repository name must not be undefined or empty.";

vi.mock("@release-change/shared", () => ({
  runCommand: vi.fn()
}));

it("should throw an error if the owner is undefined", async () => {
  await expect(cloneRepository(undefined, mockedRepo, mockedCwd, mockedToken)).rejects.toThrow(
    expectedErrorMessage
  );
});
it("should throw an error if the owner is empty", async () => {
  await expect(cloneRepository("", mockedRepo, mockedCwd, mockedToken)).rejects.toThrow(
    expectedErrorMessage
  );
});
it("should throw an error if the repository name is undefined", async () => {
  await expect(cloneRepository(mockedOwner, undefined, mockedCwd, mockedToken)).rejects.toThrow(
    expectedErrorMessage
  );
});
it("should throw an error if the repository name is empty", async () => {
  await expect(cloneRepository(mockedOwner, "", mockedCwd, mockedToken)).rejects.toThrow(
    expectedErrorMessage
  );
});
it("should run the `git clone` command", async () => {
  vi.mocked(runCommand).mockResolvedValue({ status: 0, stdout: "Some output", stderr: "" });
  await cloneRepository(mockedOwner, mockedRepo, mockedCwd, mockedToken);
  expect(runCommand).toHaveBeenCalledWith(
    "git",
    [
      "clone",
      `https://x-access-token:${mockedToken}@github.com/${mockedOwner}/${mockedRepo}.git`,
      "."
    ],
    { cwd: mockedCwd }
  );
});
it("should throw an error if the `git clone` command fails", async () => {
  vi.mocked(runCommand).mockResolvedValue({ status: 1, stdout: "", stderr: "Some error." });
  await expect(cloneRepository(mockedOwner, mockedRepo, mockedCwd, mockedToken)).rejects.toThrow(
    "Failed to clone the repository: status 1  Some error."
  );
});
it("should return nothing if the `git clone` command succeeds", async () => {
  vi.mocked(runCommand).mockResolvedValue({ status: 0, stdout: "Some output", stderr: "" });
  expect(await cloneRepository(mockedOwner, mockedRepo, mockedCwd, mockedToken)).toBeUndefined();
});
