import { expect, it, vi } from "vitest";

import { fetchConfigFile } from "../../src/utils/fetch-config-file.js";
import { mockedBranch } from "./fixtures/mocked-branch.js";
import { mockedFetch } from "./fixtures/mocked-fetch.js";
import { mockedOwner } from "./fixtures/mocked-owner.js";
import { mockedRepo } from "./fixtures/mocked-repo.js";
import { mockedToken } from "./fixtures/mocked-token.js";

global.fetch = mockedFetch;

it("should throw an error if the response is not OK", async () => {
  vi.mocked(mockedFetch).mockReturnValue({
    ok: false,
    status: 403,
    statusText: "Forbidden"
  });
  await expect(fetchConfigFile(mockedOwner, mockedRepo, mockedBranch, mockedToken)).rejects.toThrow(
    "Failed to fetch the config file: 403 Forbidden"
  );
});
it("should return `null` if the config file is not found", async () => {
  vi.mocked(mockedFetch).mockReturnValue({
    ok: true,
    status: 404,
    statusText: "Not Found"
  });
  expect(await fetchConfigFile(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toBeNull();
});
it("should return `null` if the config file is found and the decoding fails", async () => {
  vi.mocked(mockedFetch).mockReturnValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () =>
      Promise.resolve({
        type: "file",
        encoding: "base64",
        size: 1337,
        name: "release-change.config.json",
        path: "release-change.config.json",
        content: "badly-encoded-content"
      })
  });
  expect(await fetchConfigFile(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toBeNull();
});
it("should return the config file content if this file is found and the decoding is correct", async () => {
  const expectedConfigFile = {
    branches: ["main"],
    dryRun: true
  };
  vi.mocked(mockedFetch).mockReturnValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () =>
      Promise.resolve({
        type: "file",
        encoding: "base64",
        size: 1337,
        name: "release-change.config.json",
        path: "release-change.config.json",
        content: Buffer.from(JSON.stringify(expectedConfigFile), "utf-8").toString("base64")
      })
  });
  expect(await fetchConfigFile(mockedOwner, mockedRepo, mockedBranch, mockedToken)).toEqual(
    expectedConfigFile
  );
});
