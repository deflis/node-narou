import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";

const require = createRequire(import.meta.url);

// Exercise the published bundles without installing development dependencies.
for (const api of [await import("narou"), require("narou")]) {
  assert.equal(typeof api.default.search, "function");
  const body = [{ allcount: 1 }, { ncode: "N0001AA", title: "互換性テスト" }];
  const requests = [];
  const client = new api.NarouNovelFetch(async (url, options) => {
    requests.push({ url, options });
    return {
      json: async () => body,
      arrayBuffer: async () => {
        const compressed = gzipSync(JSON.stringify(body));
        return compressed.buffer.slice(
          compressed.byteOffset,
          compressed.byteOffset + compressed.byteLength
        );
      },
    };
  });

  for (const gzip of [0, 5]) {
    const result = await api
      .search("日本語", client)
      .limit(1)
      .fields([api.Fields.ncode, api.Fields.title])
      .gzip(gzip)
      .execute({ fetchOptions: { headers: { "x-test": "runtime" } } });
    assert.equal(result.allcount, 1);
    assert.equal(result.limit, 1);
    assert.deepEqual(result.values, body.slice(1));
    const { url, options } = requests[requests.length - 1];
    assert.equal(url.searchParams.get("word"), "日本語");
    assert.equal(url.searchParams.get("gzip"), gzip ? "5" : null);
    assert.equal(options.headers["x-test"], "runtime");
  }

  const failure = new Error("request failed");
  const failingClient = new api.NarouNovelFetch(async () => {
    throw failure;
  });
  await assert.rejects(api.search("", failingClient).execute(), failure);
}

for (const api of [await import("narou/browser"), require("narou/browser")]) {
  assert.equal(typeof api.search, "function");
  assert.equal(typeof api.NarouNovelJsonp, "function");
}

console.log(
  `Runtime compatibility passed on ${process.version} (ESM/CJS, JSON/gzip, browser imports)`
);
