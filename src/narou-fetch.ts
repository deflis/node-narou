import nodeFetch from "node-fetch";
import nodeURL from "./util/url";

import { unzipp } from "./util/unzipp";
import NarouNovel, { NarouParams } from "./narou";

/**
 * なろう小説APIへのリクエストを実行する
 * @class NarouNovel
 * @private
 */
export default class NarouNovelFetch extends NarouNovel {
  constructor(private fetch = nodeFetch) {
    super();
  }

  protected async execute<T>(
    params: NarouParams,
    endpoint: string
  ): Promise<T> {
    const query = { ...params, out: "json" };

    if (query.gzip === undefined) {
      query.gzip = 5;
    }
    const url = new nodeURL(endpoint);

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value.toString());
      }
    });

    const res = await this.fetch(url);

    if (query.gzip === 0) {
      return await res.json();
    }

    const buffer = await res.buffer();
    try {
      return await unzipp(buffer);
    } catch {
      try {
        throw JSON.stringify(buffer.toString());
      } catch {
        throw buffer.toString();
      }
    }
  }
}
