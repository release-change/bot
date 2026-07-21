import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Creates a temporary workspace path, using the installation ID and the SHA of the most recent commit to avoid any collusions between concurrent jobs.
 * @param installationId - The installation ID.
 * @param after - The SHA of the most recent commit.
 * @return The temporary workspace path.
 */
export const createTemporaryWorkspace = async (
  installationId: number,
  after: string
): Promise<string> => {
  return await mkdtemp(join(tmpdir(), `release-change-${installationId}-${after.slice(0, 7)}-`));
};
