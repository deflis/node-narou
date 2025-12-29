import type { NarouRankingResult, RankingResult } from "./narou-ranking-results.js";
import SearchBuilder from "./search-builder.js";
import type { DefaultSearchResultFields } from "./search-builder.js";
import type {
  GzipLevel,
  OptionalFields,
} from "./params.js";
import {
  RankingParams,
  RankingType,
  Fields,
} from "./params.js";
import type NarouNovel from "./narou.js";
import type { ExecuteOptions } from "./narou.js";
import type { SearchResultFields } from "./narou-search-results.js";
import { addDays, formatDate } from "./util/date.js";

/**
 * なろう小説ランキングAPIのヘルパークラス。
 *
 * ランキング種別や日付を指定してランキングデータを取得します。
 * また、取得したランキングデータに含まれるNコードを元に、
 * なろう小説APIを利用して詳細な小説情報を取得することも可能です。
 *
 * @class RankingBuilder
 * @see https://dev.syosetu.com/man/rankapi/ なろう小説ランキングAPI仕様
 */
export default class RankingBuilder {
  /**
   * ランキング集計対象の日付
   * @protected
   */
  protected date$: Date;
  /**
   * ランキング種別
   * @protected
   */
  protected type$: RankingType;

  /**
   * constructor
   * @param params - 初期クエリパラメータ
   * @param api - API実行クラスのインスタンス
   * @private
   */
  constructor(
    protected params: Partial<RankingParams> = {},
    protected api: NarouNovel
  ) {
    /**
     * クエリパラメータ
     * @protected
     */
    this.date$ = addDays(new Date(), -1);
    this.type$ = RankingType.Daily;
  }

  /**
   * ランキング集計対象の日付を指定します。
   *
   * - 日間: 任意の日付
   * - 週間: 火曜日の日付
   * - 月間・四半期: 1日の日付
   *
   * @param date 集計対象の日付
   * @returns {RankingBuilder} this
   * @see https://dev.syosetu.com/man/rankapi/
   */
  date(date: Date) {
    this.date$ = date;
    return this;
  }

  /**
   * ランキング種別を指定します。
   * @param type ランキング種別
   * @returns {RankingBuilder} this
   * @see https://dev.syosetu.com/man/rankapi/
   */
  type(type: RankingType) {
    this.type$ = type;
    return this;
  }

  /**
   * gzip圧縮する。
   *
   * 転送量上限を減らすためにも推奨
   * @param {GzipLevel} level gzip圧縮レベル(1～5)
   * @return {RankingBuilder} this
   */
  gzip(level: GzipLevel) {
    this.set({ gzip: level });
    return this;
  }

  /**
   * クエリパラメータを内部的にセットします。
   * @param obj - セットするパラメータオブジェクト
   * @returns {RankingBuilder} this
   * @private
   */
  protected set(obj: Partial<RankingParams>) {
    Object.assign(this.params, obj);
    return this;
  }

  /**
   * 設定されたパラメータに基づき、なろう小説ランキングAPIへのリクエストを実行します。
   *
   * 返される結果には、Nコード、ポイント、順位が含まれます。
   * @param options 実行オプション
   * @returns {Promise<NarouRankingResult[]>} ランキング結果の配列
   * @see https://dev.syosetu.com/man/rankapi/#output
   */
  execute(options?: ExecuteOptions): Promise<NarouRankingResult[]> {
    const date = formatDate(this.date$);
    this.set({ rtype: `${date}-${this.type$}` });
    return this.api.executeRanking(this.params as RankingParams, options);
  }

  /**
   * ランキングAPIを実行し、取得したNコードを元になろう小説APIで詳細情報を取得して結合します。
   */
  async executeWithFields(
    options?: ExecuteOptions
  ): Promise<RankingResult<DefaultSearchResultFields>[]>;
  /**
   * ランキングAPIを実行し、取得したNコードを元になろう小説APIで詳細情報を取得して結合します。
   *
   * @template TFields - 取得する小説情報のフィールド型
   * @param fields - 取得するフィールドの配列
   * @returns {Promise<RankingResult<SearchResultFields<TFields>>[]>} 詳細情報を含むランキング結果の配列
   */
  async executeWithFields<TFields extends Fields>(
    fields: TFields | TFields[],
    options?: ExecuteOptions
  ): Promise<RankingResult<SearchResultFields<TFields>>[]>;
  /**
   * ランキングAPIを実行し、取得したNコードを元になろう小説APIで詳細情報を取得して結合します。
   *
   * @param opt - オプショナルな取得フィールド (`weekly` など)
   * @returns {Promise<RankingResult<DefaultSearchResultFields | "weekly_unique">[]>} 詳細情報を含むランキング結果の配列
   */
  async executeWithFields(
    fields: never[],
    opt: OptionalFields | OptionalFields[],
    options?: ExecuteOptions
  ): Promise<RankingResult<DefaultSearchResultFields | "weekly_unique">[]>;
  /**
   * ランキングAPIを実行し、取得したNコードを元になろう小説APIで詳細情報を取得して結合します。
   *
   * @template TFields - 取得する小説情報のフィールド型
   * @param fields - 取得するフィールドの配列
   * @param opt - オプショナルな取得フィールド (`weekly` など)
   * @returns {Promise<RankingResult<SearchResultFields<TFields> | "weekly_unique">[]>} 詳細情報を含むランキング結果の配列
   */
  async executeWithFields<TFields extends Fields>(
    fields: TFields | TFields[],
    opt: OptionalFields | OptionalFields[],
    options?: ExecuteOptions
  ): Promise<RankingResult<SearchResultFields<TFields> | "weekly_unique">[]>;
  /**
   * ランキングAPIを実行し、取得したNコードを元になろう小説APIで詳細情報を取得して結合します。
   *
   * @template TFields - 取得する小説情報のフィールド型
   * @template TOpt - オプショナルな取得フィールドの型
   * @param fields - 取得するフィールドの配列 (省略時はデフォルトフィールド)
   * @param opt - オプショナルな取得フィールド (`weekly` など)
   * @returns {Promise<RankingResult<SearchResultFields<TFields>>[]>} 詳細情報を含むランキング結果の配列
   */
  async executeWithFields<
    TFields extends Fields,
    TOpt extends OptionalFields | undefined = undefined
  >(
    fields: TFields | TFields[] = [],
    opt?: TOpt,
    options?: ExecuteOptions
  ): Promise<RankingResult<SearchResultFields<TFields>>[]> {
    const ranking = await this.execute(options);
    const fields$ = Array.isArray(fields)
      ? fields.length == 0
        ? []
        : ([...fields, Fields.ncode] as const)
      : ([fields, Fields.ncode] as const);

    const rankingNcodes = ranking.map(({ ncode }) => ncode);
    const builder = new SearchBuilder({}, this.api);
    builder.fields(fields$);
    if (opt) {
      builder.opt(opt);
    }
    builder.ncode(rankingNcodes);
    builder.limit(ranking.length);
    const result = await builder.execute(options);

    return ranking.map<
      RankingResult<
        | SearchResultFields<TFields>
        | (TOpt extends "weekly" ? "weekly_unique" : never)
      >
    >((r) => ({
      ...r,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(result.values.find((novel) => novel.ncode == r.ncode) as any),
    }));
  }
}
