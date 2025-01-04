import { HttpResponse } from "msw";
import { gzipSync } from "zlib";

export function responseGzipOrJson(response: any, url: URL) {
  if (parseInt(url.searchParams.get("gzip") ?? "0") > 0) {
    return HttpResponse.arrayBuffer(
      gzipSync(Buffer.from(JSON.stringify(response)))
    );
  }
  return HttpResponse.json(response);
}
