import { env } from "node:process";

export const config = {
  appId: env.APP_ID ?? "",
  privateKey: env.PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
  webhookSecret: env.WEBHOOK_SECRET ?? ""
};
export const port = env.PORT ?? 3000;
