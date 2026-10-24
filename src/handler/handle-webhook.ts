import type { AppConfig, GitHubPayload } from "../types.js";

import { extractBranchFromRef } from "../utils/extract-branch-from-ref.js";
import { verifySignature } from "../utils/verify-signature.js";
import { enqueueReleaseChange } from "./enqueue-release-change.js";

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
      installation: { id: installationId },
      deleted
    } = payload;
    if (deleted) {
      return {
        status: 200,
        message:
          "The referenced branch has been deleted; therefore, release-change will not be triggered."
      };
    }
    if (ref.startsWith("refs/tags/")) {
      return {
        status: 200,
        message: "The referenced branch is a tag; therefore, release-change will not be triggered."
      };
    }
    const [owner, repo] = repositoryName.split("/");
    const branch = extractBranchFromRef(ref);
    if (typeof owner === "string" && typeof repo === "string" && typeof branch === "string") {
      enqueueReleaseChange({
        config,
        deliveryId: headers["x-github-delivery"] ?? "",
        after,
        installationId,
        owner,
        repo,
        branch
      });
      return { status: 202, message: "release-change being triggered…" };
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
