import { expect, it, vi } from "vitest";

import { createTemporaryWorkspace } from "../../src/utils/create-temporary-workspace.js";

vi.mock("node:fs/promises", () => ({
  mkdtemp: vi.fn(prefix => Promise.resolve(prefix))
}));
vi.mock("node:os", () => ({
  tmpdir: vi.fn(() => "/tmp")
}));

it("should return a temporary workspace path", async () => {
  expect(await createTemporaryWorkspace(123, "abcdef0123456789")).toBe(
    "/tmp/release-change-123-abcdef0-"
  );
});
