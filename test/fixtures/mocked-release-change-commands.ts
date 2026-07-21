export const mockedReleaseChangeCommands: {
  packageManager: "npm" | "pnpm";
  expectedCommand: string;
}[] = [
  { packageManager: "npm", expectedCommand: "npx" },
  { packageManager: "pnpm", expectedCommand: "pnpx" }
];
