import NarouNovel from "./narou.js";
import type { NarouParams, ExecuteOptions } from "./narou.js";
import { jsonp } from "./util/jsonp.js";

/**
 * なろう小説APIへのリクエストを実行する
 */
export default class NarouNovelJsonp extends NarouNovel {
  protected async execute<T>(
    params: NarouParams,
    endpoint: string,
    _options?: ExecuteOptions
  ): Promise<T> {
    void _options;
    const query = { ...params, out: "jsonp" };
    query.gzip = 0;

    const url = new URL(endpoint);

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    return await jsonp(url.toString());
  }
}
