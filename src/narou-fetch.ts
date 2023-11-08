import { unzipp } from "./util/unzipp";
import NarouNovel, { NarouParams } from "./narou";

type Fetch = typeof fetch;

/**
 * なろう小説APIへのリクエストを実行する
 */
export default class NarouNovelFetch extends NarouNovel {
  constructor(private fetch: Fetch = require('node-fetch')) {
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
    const url = new URL(endpoint);

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value.toString());
      }
    });

    const res = await this.fetch(url);

    if (query.gzip === 0) {
      return (await res.json()) as T;
    }

    const buffer = await res.arrayBuffer();
    return await unzipp(buffer);
  }
}
