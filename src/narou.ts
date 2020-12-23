import fetch from "node-fetch";
import { URL } from "url";

import { NarouRankingResult } from "./narou-ranking-results";
import NarouSearchResults from "./narou-search-results";
import { RankingHistoryParams, RankingParams, SearchParams } from "./params";
import { RankingHistoryRawResult } from "./ranking-history";
import { unzipp } from "./util/unzipp";

type NarouParams = SearchParams | RankingParams | RankingHistoryParams;

/**
 * なろう小説APIへのリクエストを実行する
 * @class NarouNovel
 * @private
 */
export default class NarouNovel {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param endpoint APIエンドポイント
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  static async execute(
    params: NarouParams,
    endpoint = "http://api.syosetu.com/novelapi/api/"
  ): Promise<any> {
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

    const res = await fetch(url);

    if (query.gzip === 0) {
      return await res.json();
    }

    const buffer = await res.buffer();
    try {
      return await unzipp(buffer);
    } catch {
      try {
        return JSON.stringify(buffer.toString());
      } catch {
        return buffer.toString();
      }
    }
  }

  static async executeSearch(
    params: any,
    endpoint = "http://api.syosetu.com/novelapi/api/"
  ): Promise<NarouSearchResults> {
    return new NarouSearchResults(await this.execute(params, endpoint), params);
  }

  static executeNovel(params: SearchParams): Promise<NarouSearchResults> {
    return this.executeSearch(params, "http://api.syosetu.com/novelapi/api/");
  }

  static executeNovel18(params: SearchParams): Promise<NarouSearchResults> {
    return this.executeSearch(params, "http://api.syosetu.com/novel18api/api/");
  }

  static executeRanking(params: RankingParams): Promise<NarouRankingResult[]> {
    return this.execute(params, "http://api.syosetu.com/rank/rankget/");
  }

  static executeRankingHistory(
    params: RankingHistoryParams
  ): Promise<RankingHistoryRawResult[]> {
    return this.execute(params, "http://api.syosetu.com/rank/rankin/");
  }
}
