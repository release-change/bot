import { rm } from "node:fs/promises";

/**
 * Deletes a temporary workspace, with recursive and force options.
 * @param workspace - The temporary workspace path.
 */
export const deleteTemporaryWorkspace = async (workspace: string): Promise<void> => {
  await rm(workspace, { recursive: true, force: true });
};
