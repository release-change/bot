import { createServer } from "node:http";

import { config, port } from "./config.js";
import { handleWebhook } from "./handler/handle-webhook.js";

/**
 * Creates a server listening for webhook requests and handling them.
 * @param request - The HTTP request.
 * @param response - The HTTP response.
 * @return A new instance of the HTTP server running the GitHub App and listening on the port defined by the configuration.
 */
createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/api/webhook") {
    response.writeHead(404).end();
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString("utf-8");
    const headers: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(request.headers)) {
      headers[key] = Array.isArray(value) ? value[0] : value;
    }
    const result = await handleWebhook(config, headers, rawBody);
    response.writeHead(result.status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(result.message));
  } catch (error) {
    const errorReporting = error instanceof Error ? error.message : "Unknown error";
    console.error("Internal server error:", errorReporting);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: errorReporting }));
  }
}).listen(port, () => {
  console.log(`App ${config.appId} listening on port ${port}`);
});
