import type { IncomingMessage } from "node:http";

export function formatRequestUrl(req: IncomingMessage) {
  const { method, url, headers } = req;
  const parsedUrl = new URL(url ?? "", `http://${headers.host}`);
  const path = parsedUrl.pathname;
  return { method, path };
}

export function extractIdFromUrl(req: any, index: number) {
  const segments = req.url.split("/");
  return parseInt(segments[index], 10);
}