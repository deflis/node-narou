import { unzipp } from "./util/unzipp.js";
import NarouNovel from "./narou.js";
import type { NarouParams } from "./narou.js";

type Fetch = typeof fetch;

/**
 * なろう小説APIへのリクエストを実行する
 */
export default class NarouNovelFetch extends NarouNovel {
  /**
   * コンストラクタ
   * @param fetch fetch関数（デフォルトはネイティブのfetch）
   */
  constructor(private fetch?: Fetch) {
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

    const res = await (this.fetch ?? fetch)(url);

    if (query.gzip === 0) {
      return (await res.json()) as T;
    }

    const buffer = await res.arrayBuffer();
    return await unzipp(buffer);
  }
}
