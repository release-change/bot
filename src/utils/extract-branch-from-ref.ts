/**
 * Extracts the branch name from the `ref` property of the payload sent by the webhook request.
 * @param ref - The Git reference.
 * @return The branch name if the reference starts with `refs/heads/`, `null` otherwise.
 */
export const extractBranchFromRef = (ref: string): string | null => {
  const prefix = "refs/heads/";
  return ref.startsWith(prefix) ? ref.substring(prefix.length) : null;
};
