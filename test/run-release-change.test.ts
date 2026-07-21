import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";

import { getPackageManager } from "@release-change/get-packages";
import { beforeEach, expect, it, vi } from "vitest";

import { runReleaseChange } from "../src/handler/run-release-change.js";
import { mockedReleaseChangeCommands } from "./fixtures/mocked-release-change-commands.js";
import { mockedCwd } from "./utils/fixtures/mocked-cwd.js";
import { mockedToken } from "./utils/fixtures/mocked-token.js";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));
vi.mock("@release-change/get-packages", () => ({
  getPackageManager: vi.fn()
}));

beforeEach(() => {
  vi.mocked(spawn).mockImplementation(() => {
    const childProcess = new EventEmitter() as ReturnType<typeof spawn>;
    setImmediate(() => childProcess.emit("close", 0));
    return childProcess;
  });
});

it("should throw an error if no valid package manager is found", async () => {
  vi.mocked(getPackageManager).mockReturnValue(null);
  await expect(runReleaseChange(mockedCwd, mockedToken)).rejects.toThrow(
    "No valid package manager found."
  );
});
it.each(mockedReleaseChangeCommands)(
  "should run the `$expectedCommand` command when the package manager is `$packageManager`",
  async ({ packageManager, expectedCommand }) => {
    vi.mocked(getPackageManager).mockReturnValue(packageManager);
    await runReleaseChange(mockedCwd, mockedToken);
    expect(spawn).toHaveBeenCalledWith(
      expectedCommand,
      ["@release-change/cli", "--debug"],
      expect.objectContaining({
        cwd: mockedCwd,
        env: expect.objectContaining({ RELEASE_TOKEN: mockedToken })
      })
    );
  }
);
