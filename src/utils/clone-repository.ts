import { runCommand } from "@release-change/shared";

/**
 * Clones a repository from GitHub.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param cwd - The current working directory.
 * @param token - The GitHub personal access token to use for authentication.
 */
export const cloneRepository = async (
  owner: string | undefined,
  repo: string | undefined,
  cwd: string,
  token: string
): Promise<void> => {
  if (owner && repo) {
    const commandResult = await runCommand(
      "git",
      ["clone", `https://x-access-token:${token}@github.com/${owner}/${repo}.git`, "."],
      {
        cwd
      }
    );
    const { status, stdout, stderr } = commandResult;
    if (status) {
      throw new Error(`Failed to clone the repository: status ${status} ${stdout} ${stderr}`);
    }
    return;
  }
  throw new Error(
    "Failed to clone the repository: the owner and the repository name must not be undefined or empty."
  );
};
