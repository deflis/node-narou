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
 * なろう小説APIへのリクエストオプション
 */
export interface ExecuteOptions {
  /**
   * fetch関数のオプション
   */
  fetchOptions?: RequestInit;
}

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
   * @returns 実行結果
   */
  protected abstract execute<T>(
    params: NarouParams,
    endpoint: string,
    options?: ExecuteOptions
  ): Promise<T>;

  /**
   * APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @param endpoint APIエンドポイント
   * @returns 検索結果
   */
  protected async executeSearch<T extends keyof NarouSearchResult>(
    params: SearchParams,
    endpoint = "https://api.syosetu.com/novelapi/api/",
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return new NarouSearchResults(
      await this.execute(params, endpoint, options),
      params
    );
  }

  /**
   * 小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @returns 検索結果
   * @see https://dev.syosetu.com/man/api/
   */
  async executeNovel<T extends keyof NarouSearchResult>(
    params: SearchParams,
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novelapi/api/",
      options
    );
  }

  /**
   * R18小説APIへの検索リクエストを実行する
   * @param params クエリパラメータ
   * @returns 検索結果
   * @see https://dev.syosetu.com/xman/api/
   */
  async executeNovel18<T extends keyof NarouSearchResult>(
    params: SearchParams,
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return await this.executeSearch(
      params,
      "https://api.syosetu.com/novel18api/api/",
      options
    );
  }

  /**
   * ランキングAPIへのリクエストを実行する
   * @param params クエリパラメータ
   * @returns ランキング結果
   * @see https://dev.syosetu.com/man/rankapi/
   */
  async executeRanking(
    params: RankingParams,
    options?: ExecuteOptions
  ): Promise<NarouRankingResult[]> {
    return await this.execute(
      params,
      "https://api.syosetu.com/rank/rankget/",
      options
    );
  }

  /**
   * 殿堂入りAPiへのリクエストを実行する
   * @param params クエリパラメータ
   * @param options 実行オプション
   * @returns ランキング履歴結果
   * @see https://dev.syosetu.com/man/rankinapi/
   */
  async executeRankingHistory(
    params: RankingHistoryParams,
    options?: ExecuteOptions
  ): Promise<RankingHistoryRawResult[]> {
    return await this.execute(
      params,
      "https://api.syosetu.com/rank/rankin/",
      options
    );
  }

  /**
   * ユーザー検索APIへのリクエストを実行する
   * @param params クエリパラメータ
   * @returns 検索結果
   * @see https://dev.syosetu.com/man/userapi/
   */
  async executeUserSearch<T extends keyof UserSearchResult>(
    params: UserSearchParams,
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<UserSearchResult, T>> {
    return new NarouSearchResults<UserSearchResult, T>(
      await this.execute(
        params,
        "https://api.syosetu.com/userapi/api/",
        options
      ),
      params
    );
  }
}
