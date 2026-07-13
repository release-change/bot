import type { GitHubAppConfig } from "../types.js";

import { createPrivateKey, createSign } from "node:crypto";

import { setBase64Url } from "./set-base64-url.js";

import { JWT_CLOCK_DRIFT_PROTECTION_DELAY, JWT_EXPIRATION_DELAY } from "../constants.js";

/**
 * Creates a JSON web token (JWT) for the GitHub App.
 * @param config - The GitHub App configuration.
 * @return The JWT.
 */
export const createJWT = (config: GitHubAppConfig): string => {
  const { appId, privateKey } = config;
  const now = Math.floor(Date.now() / 1000);
  const header = setBase64Url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = setBase64Url(
    Buffer.from(
      JSON.stringify({
        iat: now - JWT_CLOCK_DRIFT_PROTECTION_DELAY,
        exp: now + JWT_EXPIRATION_DELAY,
        iss: appId
      })
    )
  );
  const data = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(data);
  const signature = setBase64Url(sign.sign(createPrivateKey(privateKey)));
  return `${data}.${signature}`;
};
