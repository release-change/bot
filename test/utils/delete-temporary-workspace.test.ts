import * as fs from "node:fs/promises";

import { expect, it, vi } from "vitest";

import { deleteTemporaryWorkspace } from "../../src/utils/delete-temporary-workspace.js";

vi.mock("node:fs/promises", () => ({
  rm: vi.fn()
}));

it("should run `rm()`", async () => {
  const mockedWorkspace = "/tmp/release-change-123-abcdef0-";
  await deleteTemporaryWorkspace(mockedWorkspace);
  expect(fs.rm).toHaveBeenCalledWith(mockedWorkspace, { recursive: true, force: true });
});
