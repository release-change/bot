import { DEFAULT_CONFIG } from "@release-change/config";

import { fetchConfigFile } from "./fetch-config-file.js";

/**
 * Gets the eligible branches for a given repository.
 *
 * If the config file exists, it will return the branches specified in the config file. If the config file does not exist or does not contain a `branches` property, it will return the branches specified in the default config.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param branch - The branch to check.
 * @param token - The GitHub personal access token to use for authentication.
 * @return The eligible branches for the repository.
 */
export const getEligibleBranches = async (
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<readonly string[]> => {
  const { branches: defaultBranches } = DEFAULT_CONFIG;
  if (owner && repo && branch) {
    const configFile = await fetchConfigFile(owner, repo, branch, token);
    if (configFile) {
      if ("branches" in configFile) {
        const { branches } = configFile;
        return Array.isArray(branches) ? branches : defaultBranches;
      }
    }
  }
  return defaultBranches;
};
