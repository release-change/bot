import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies the signature of a webhook request.
 * @param secret - The webhook secret.
 * @param body - The request raw body.
 * @param [signature] - The signature to verify.
 * @return `true` if the signature buffer is the expected one, `false` otherwise.
 */
export const verifySignature = (secret: string, body: string, signature?: string): boolean => {
  if (!signature) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (signatureBuffer.byteLength !== expectedBuffer.byteLength) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
};
