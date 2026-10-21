import { spawn } from "node:child_process";

/**
 * Installs Corepack globally using npm.
 * @param cwd - The current working directory.
 * @return A promise which resolves when Corepack is installed.
 */
export const installCorepack = async (cwd: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn("npm", ["install", "-g", "corepack"], { cwd });
    childProcess.on("error", reject);
    childProcess.on("close", code => {
      if (code) reject(new Error(`\`npm install -g corepack\` exited with code ${code}.`));
      else resolve();
    });
  });
};
