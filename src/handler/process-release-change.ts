import type { ReleaseChangeJob } from "../types.js";

import { cloneRepository } from "../utils/clone-repository.js";
import { createTemporaryWorkspace } from "../utils/create-temporary-workspace.js";
import { deleteTemporaryWorkspace } from "../utils/delete-temporary-workspace.js";
import { getEligibleBranches } from "../utils/get-eligible-branches.js";
import { getInstallationToken } from "../utils/get-installation-token.js";
import { runReleaseChange } from "./run-release-change.js";

/**
 * Processes a release-change job, checking if the branch is eligible, then, if eligible, cloning the repository to a temporary workspace and running release-change.
 * @param job - The job to process.
 */
export const processReleaseChange = async (job: ReleaseChangeJob): Promise<void> => {
  const { config, deliveryId, after, installationId, owner, repo, branch } = job;
  const token = await getInstallationToken(config, installationId);
  const eligibleBranches = await getEligibleBranches(owner, repo, branch, token);
  if (!eligibleBranches.includes(branch)) return;
  console.log(`Processing delivery ${deliveryId} for ${owner}/${repo}#${branch}`);
  const workspace = await createTemporaryWorkspace(installationId, after);
  try {
    await cloneRepository(owner, repo, branch, workspace, token);
    await runReleaseChange(workspace, token);
  } finally {
    await deleteTemporaryWorkspace(workspace);
  }
};
