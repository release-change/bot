import { runCommand } from "@release-change/shared";

/**
 * Clones a repository from GitHub.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param branch - The branch to clone.
 * @param cwd - The current working directory.
 * @param token - The GitHub personal access token to use for authentication.
 */
export const cloneRepository = async (
  owner: string,
  repo: string,
  branch: string,
  cwd: string,
  token: string
): Promise<void> => {
  if (owner && repo && branch) {
    const commandResult = await runCommand(
      "git",
      [
        "clone",
        "--branch",
        branch,
        `https://x-access-token:${token}@github.com/${owner}/${repo}.git`,
        "."
      ],
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
    "Failed to clone the repository: the owner, the repository name and the branch must not be empty."
  );
};
