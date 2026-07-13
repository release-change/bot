import process from "node:process";

export const runReleaseChange = (): void => {
  const { cwd, env } = process;
  console.log("potential context base", {
    cwd: cwd(),
    env
  });
};
