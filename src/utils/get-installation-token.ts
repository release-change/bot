import type { GitHubAppConfig } from "../types.js";

import { createJWT } from "./create-jwt.js";

import { GITHUB_REST_API_POST_HEADERS } from "../constants.js";

/**
 * Gets the installation token for the GitHub App.
 * @param config - The GitHub App configuration.
 * @param installationId - The installation ID.
 * @return The installation token.
 */
export const getInstallationToken = async (
  config: GitHubAppConfig,
  installationId: number
): Promise<string> => {
  const jwt = createJWT(config);
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        ...GITHUB_REST_API_POST_HEADERS,
        Authorization: `Bearer ${jwt}`
      }
    }
  );
  const { ok, status, statusText } = response;
  if (ok && status === 201) {
    const data = (await response.json()) as { token: string };
    return data.token;
  }
  throw new Error(`Failed to get installation token: ${status} ${statusText}`);
};
