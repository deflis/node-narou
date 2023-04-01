import NarouNovel, { NarouParams } from "./narou";
import { jsonp } from "./util/jsonp";

/**
 * なろう小説APIへのリクエストを実行する
 * @class NarouNovel
 * @private
 */
export default class NarouNovelJsonp extends NarouNovel {
  protected async execute<T>(
    params: NarouParams,
    endpoint: string
  ): Promise<T> {
    const query = { ...params, out: "jsonp" };
    query.gzip = 0;

    const url = new URL(endpoint);

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value.toString());
      }
    });

    return await jsonp(url.toString());
  }
}
