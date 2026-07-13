import { createHmac } from "node:crypto";

import { mockedSecret } from "./mocked-secret.js";

export const mockSign = (body: string): string => {
  return `sha256=${createHmac("sha256", mockedSecret).update(body).digest("hex")}`;
};
