import { spawn } from "node:child_process";

import { getPackageManager } from "@release-change/get-packages";

import { enableCorepack } from "../utils/enable-corepack.js";
import { installCorepack } from "../utils/install-corepack.js";

/**
 * Runs release-change.
 * @param cwd - The current working directory.
 * @param token - The GitHub personal access token to use for authentication.
 */
export const runReleaseChange = async (cwd: string, token: string): Promise<void> => {
  const packageManager = getPackageManager(cwd, process.env);
  const command =
    packageManager === "pnpm"
      ? "pnpx"
      : packageManager === "yarn"
        ? packageManager
        : packageManager === "npm"
          ? "npx"
          : null;
  const args = ["@release-change/cli"];
  if (packageManager === "yarn") {
    args.unshift("dlx");
    await installCorepack(cwd);
    await enableCorepack(cwd);
  }
  await new Promise<void>((resolve, reject) => {
    if (command) {
      const { PRIVATE_KEY, WEBHOOK_SECRET, ...inheritedEnv } = process.env;
      const childProcess = spawn(command, args, {
        cwd,
        env: {
          ...inheritedEnv,
          RELEASE_TOKEN: token,
          ISSUE_PR_TOKEN: token,
          IS_GITHUB_APP: "true"
        },
        stdio: ["ignore", "inherit", "inherit"]
      });
      childProcess.on("error", reject);
      childProcess.on("close", code => {
        if (code) reject(new Error(`release-change exited with code ${code}.`));
        else resolve();
      });
    } else reject(new Error("No valid package manager found."));
  });
};
