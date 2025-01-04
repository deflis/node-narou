import { HttpResponse, JsonBodyType } from "msw";
import { gzipSync } from "zlib";

export function responseGzipOrJson<T extends JsonBodyType>(response: T, url: URL) {
  if (parseInt(url.searchParams.get("gzip") ?? "0") > 0) {
    return HttpResponse.arrayBuffer(
      gzipSync(Buffer.from(JSON.stringify(response)))
    );
  }
  return HttpResponse.json(response);
}
