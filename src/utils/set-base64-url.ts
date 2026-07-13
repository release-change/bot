/**
 * Sets the base64 URL encoding of a buffer for the header and the payload of the JSON web token (JWT) to create.
 * @param input - The buffer to encode.
 * @return The base64 URL encoded string.
 */
export const setBase64Url = (input: Buffer): string => {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};
