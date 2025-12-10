import type { NarouRankingResult } from "./narou-ranking-results.js";
import NarouSearchResults from "./narou-search-results.js";
import type {
  NarouSearchResult,
  UserSearchResult,
} from "./narou-search-results.js";
import type {
  RankingHistoryParams,
  RankingParams,
  SearchParams,
  UserSearchParams,
} from "./params.js";
import type { RankingHistoryRawResult } from "./ranking-history.js";

/**
 * なろう小説APIへのリクエストパラメータ
 */
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
   * なろうAPIへのAPIリクエストを実行する
   * @param params クエリパラメータ
   * @param endpoint APIエンドポイント
   * @param fetchOptions fetchのオプション
   * @returns 実行結果
   */
  protected abstract execute<T>(
    params: NarouParams | undefined,
    endpoint: string,
    fetchOptions?: RequestInit
  ): Promise<T>;

  /**
   * APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param endpoint APIエンドポイント
   * @param fetchOptions fetchのオプション
   * @returns 検索結果
   */
  protected async executeSearch<T extends keyof NarouSearchResult>(
    params: SearchParams,
    endpoint = "https://api.syosetu.com/novelapi/api/",
    fetchOptions?: RequestInit
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return new NarouSearchResults(
      await this.execute(params, endpoint, fetchOptions),
      params
    );
  }

  /**
   * 小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param fetchOptions fetchのオプション
   * @returns 検索結果
   * @see https://dev.syosetu.com/man/api/
   */
  async executeNovel<T extends keyof NarouSearchResult>(
    params: SearchParams,
    fetchOptions?: RequestInit
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novelapi/api/",
      fetchOptions
    );
  }

  /**
   * R18小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param fetchOptions fetchのオプション
   * @returns 検索結果
   * @see https://dev.syosetu.com/xman/api/
   */
  async executeNovel18<T extends keyof NarouSearchResult>(
    params: SearchParams,
    fetchOptions?: RequestInit
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novel18api/api/",
      fetchOptions
    );
  }

  /**
   * ランキングAPIへのリクエストを実行する
   * @param params クエリパラメータ
   * @param fetchOptions fetchのオプション
   * @returns ランキング結果
   * @see https://dev.syosetu.com/man/rankapi/
   */
  async executeRanking(
    params: RankingParams,
    fetchOptions?: RequestInit
  ): Promise<NarouRankingResult[]> {
    return await this.execute(
      params,
      "https://api.syosetu.com/rank/rankget/",
      fetchOptions
    );
  }

  /**
   * 殿堂入りAPiへのリクエストを実行する
   * @param params クエリパラメータ
   * @param fetchOptions fetchのオプション
   * @returns ランキング履歴結果
   * @see https://dev.syosetu.com/man/rankinapi/
   */
  async executeRankingHistory(
    params: RankingHistoryParams,
    fetchOptions?: RequestInit
  ): Promise<RankingHistoryRawResult[]> {
    return await this.execute(
      params,
      "https://api.syosetu.com/rank/rankin/",
      fetchOptions
    );
  }

  /**
   * ユーザー検索APIへのリクエストを実行する
   * @param params クエリパラメータ
   * @param fetchOptions fetchのオプション
   * @returns 検索結果
   * @see https://dev.syosetu.com/man/userapi/
   */
  async executeUserSearch<T extends keyof UserSearchResult>(
    params: UserSearchParams,
    fetchOptions?: RequestInit
  ): Promise<NarouSearchResults<UserSearchResult, T>> {
    return new NarouSearchResults<UserSearchResult, T>(
      await this.execute(
        params,
        "https://api.syosetu.com/userapi/api/",
        fetchOptions
      ),
      params
    );
  }
}
