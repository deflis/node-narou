import { NarouRankingResult } from "./narou-ranking-results";
import NarouSearchResults from "./narou-search-results";
import { RankingHistoryParams, RankingParams, SearchParams } from "./params";
import { RankingHistoryRawResult } from "./ranking-history";

export type NarouParams = SearchParams | RankingParams | RankingHistoryParams;

/**
 * なろう小説APIへのリクエストを実行する
 * @class NarouNovel
 * @private
 */
export default abstract class NarouNovel {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param endpoint APIエンドポイント
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  protected abstract execute<T>(
    params: NarouParams,
    endpoint: string
  ): Promise<T>;

  async executeSearch(
    params: NarouParams,
    endpoint = "http://api.syosetu.com/novelapi/api/"
  ): Promise<NarouSearchResults> {
    return new NarouSearchResults(await this.execute(params, endpoint), params);
  }

  async executeNovel(params: SearchParams): Promise<NarouSearchResults> {
    return await this.executeSearch(
      params,
      "http://api.syosetu.com/novelapi/api/"
    );
  }

  async executeNovel18(params: SearchParams): Promise<NarouSearchResults> {
    return await this.executeSearch(
      params,
      "http://api.syosetu.com/novel18api/api/"
    );
  }

  async executeRanking(params: RankingParams): Promise<NarouRankingResult[]> {
    return await this.execute(params, "http://api.syosetu.com/rank/rankget/");
  }

  async executeRankingHistory(
    params: RankingHistoryParams
  ): Promise<RankingHistoryRawResult[]> {
    return await this.execute(params, "http://api.syosetu.com/rank/rankin/");
  }
}
