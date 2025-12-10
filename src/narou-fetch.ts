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
    params: NarouParams | undefined,
    endpoint: string,
    fetchOptions: RequestInit = {}
  ): Promise<T> {
    const query = { ...(params ?? {}), out: "json" };

    if (query.gzip === undefined) {
      query.gzip = 5;
    }
    if (query.gzip === 0) {
      delete query.gzip;
    }
    const url = new URL(endpoint);

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const res = await (this.fetch ?? fetch)(url, fetchOptions);

    if (!query.gzip) {
      return (await res.json()) as T;
    }

    const buffer = await res.arrayBuffer();
    return await unzipp(buffer);
  }
}
