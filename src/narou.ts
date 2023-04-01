import { NarouRankingResult } from "./narou-ranking-results";
import NarouSearchResults, {
  NarouSearchResult,
  UserSearchResult,
} from "./narou-search-results";
import {
  RankingHistoryParams,
  RankingParams,
  SearchParams,
  UserSearchParams,
} from "./params";
import { RankingHistoryRawResult } from "./ranking-history";

export type NarouParams =
  | SearchParams
  | RankingParams
  | RankingHistoryParams
  | UserSearchParams;

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

  async executeSearch<T extends keyof NarouSearchResult>(
    params: SearchParams,
    endpoint = "https://api.syosetu.com/novelapi/api/"
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return new NarouSearchResults(await this.execute(params, endpoint), params);
  }

  async executeNovel<T extends keyof NarouSearchResult>(
    params: SearchParams
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novelapi/api/"
    );
  }

  async executeNovel18<T extends keyof NarouSearchResult>(
    params: SearchParams
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novel18api/api/"
    );
  }

  async executeRanking(params: RankingParams): Promise<NarouRankingResult[]> {
    return await this.execute(params, "https://api.syosetu.com/rank/rankget/");
  }

  async executeRankingHistory(
    params: RankingHistoryParams
  ): Promise<RankingHistoryRawResult[]> {
    return await this.execute(params, "https://api.syosetu.com/rank/rankin/");
  }

  async executeUserSearch<T extends keyof UserSearchResult>(
    params: UserSearchParams
  ): Promise<NarouSearchResults<UserSearchResult, T>> {
    return await this.execute(params, "https://api.syosetu.com/userapi/api/");
  }
}
