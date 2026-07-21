import { spawn } from "node:child_process";

import { getPackageManager } from "@release-change/get-packages";

/**
 * Runs release-change.
 * @param cwd - The current working directory.
 * @param token - The GitHub personal access token to use for authentication.
 */
export const runReleaseChange = async (cwd: string, token: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const packageManager = getPackageManager(cwd, process.env);
    const command = packageManager === "pnpm" ? "pnpx" : packageManager === "npm" ? "npx" : null;
    if (command) {
      const childProcess = spawn(command, ["@release-change/cli", "--debug"], {
        cwd,
        env: { ...process.env, RELEASE_TOKEN: token },
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
