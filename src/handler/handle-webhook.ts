import type { AppConfig, GitHubPayload } from "../types.js";

import { cloneRepository } from "../utils/clone-repository.js";
import { createTemporaryWorkspace } from "../utils/create-temporary-workspace.js";
import { deleteTemporaryWorkspace } from "../utils/delete-temporary-workspace.js";
import { extractBranchFromRef } from "../utils/extract-branch-from-ref.js";
import { getEligibleBranches } from "../utils/get-eligible-branches.js";
import { getInstallationToken } from "../utils/get-installation-token.js";
import { verifySignature } from "../utils/verify-signature.js";
import { runReleaseChange } from "./run-release-change.js";

/**
 * Handles a webhook request from GitHub.
 * @param config - The GitHub App configuration.
 * @param headers - The headers of the request.
 * @param rawBody - The raw body of the request.
 * @return An object containing the status code and a message to be sent in the response.
 */
export const handleWebhook = async (
  config: AppConfig,
  headers: Record<string, string | undefined>,
  rawBody: string
): Promise<{ status: number; message: string }> => {
  if (!verifySignature(config.webhookSecret, rawBody, headers["x-hub-signature-256"])) {
    return {
      status: 401,
      message: "Invalid signature"
    };
  }
  const event = headers["x-github-event"];
  if (event === "push") {
    const payload: GitHubPayload = JSON.parse(rawBody);
    const {
      ref,
      after,
      repository: { full_name: repositoryName },
      installation: { id: installationId }
    } = payload;
    const token = await getInstallationToken(config, installationId);
    const [owner, repo] = repositoryName.split("/");
    const branch = extractBranchFromRef(ref);
    const eligibleBranches = await getEligibleBranches(
      owner ?? "",
      repo ?? "",
      branch ?? "",
      token
    );
    if (branch && eligibleBranches.includes(branch)) {
      const workspace = await createTemporaryWorkspace(installationId, after);
      await cloneRepository(owner, repo, workspace, token);
      await runReleaseChange(workspace, token);
      await deleteTemporaryWorkspace(workspace);
      return { status: 200, message: "release-change has been triggered." };
    }
    return {
      status: 200,
      message:
        "The referenced branch is not part of the ones targeted by the config; therefore, release-change will not be triggered."
    };
  }
  return {
    status: 200,
    message: "The event is ignored; therefore, release-change will not be triggered."
  };
};
