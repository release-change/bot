import { spawn } from "node:child_process";

/**
 * Enable corepack.
 * @param cwd - The current working directory.
 * @return A promise which resolves when Corepack is enabled.
 */
export const enableCorepack = async (cwd: string) => {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn("corepack", ["enable"], { cwd });
    childProcess.on("error", reject);
    childProcess.on("close", code => {
      if (code) reject(new Error(`\`corepack enable\` exited with code ${code}.`));
      else resolve();
    });
  });
};
