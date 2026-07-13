import { GITHUB_API_VERSION } from "@release-change/shared";

/**
 * Fetches the `release-change.config.json` file from a GitHub repository.
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param branch - The branch to fetch the file from.
 * @param token - The GitHub personal access token to use for authentication.
 * @return The parsed config file content if the file exists, `null` otherwise.
 */
export const fetchConfigFile = async (
  owner: string,
  repo: string,
  branch: string,
  token: string
): Promise<Record<string, unknown> | null> => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/release-change.config.json?ref=${encodeURIComponent(
      branch
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION
      }
    }
  );
  const { ok, status, statusText } = response;
  if (status === 404) return null;
  if (!ok) throw new Error(`Failed to fetch the config file: ${status} ${statusText}`);
  const data = await response.json();
  if (typeof data === "object" && data && "content" in data) {
    const { content } = data;
    if (typeof content === "string") {
      try {
        return JSON.parse(Buffer.from(content, "base64").toString("utf-8"));
      } catch {
        return null;
      }
    }
  }
  return null;
};
