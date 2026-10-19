export const mockedReleaseChangeCommands: {
  packageManager: "npm" | "pnpm" | "yarn";
  expectedCommand: string;
  expectedArgs: string[];
}[] = [
  { packageManager: "npm", expectedCommand: "npx", expectedArgs: ["@release-change/cli"] },
  { packageManager: "pnpm", expectedCommand: "pnpx", expectedArgs: ["@release-change/cli"] },
  { packageManager: "yarn", expectedCommand: "yarn", expectedArgs: ["dlx", "@release-change/cli"] }
];
