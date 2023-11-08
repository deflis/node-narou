import { NarouRankingResult, RankingResult } from "./narou-ranking-results";
import SearchBuilder, { DefaultSearchResultFields } from "./search-builder";
import addDays from "date-fns/addDays";
import format from "date-fns/format";
import {
  Fields,
  GzipLevel,
  OptionalFields,
  RankingParams,
  RankingType,
} from "./params";
import NarouNovel from "./narou";
import { SearchResultFields } from "./narou-search-results";

const dateFormat = "yyyyMMdd";

/**
 * ランキングヘルパー
 * @class Ranking
 */
export default class RankingBuilder {
  protected date$: Date;
  protected type$: RankingType;

  /**
   * constructor
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
    this.date$ = addDays(Date.now(), -1);
    this.type$ = RankingType.Daily;
  }

  date(date: Date) {
    this.date$ = date;
    return this;
  }

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
   * クエリパラメータをセットする
   * @private
   * @return {RankingBuilder} this
   */
  protected set(obj: Partial<RankingParams>) {
    Object.assign(this.params, obj);
    return this;
  }

  /**
   * なろう小説APIへのリクエストを実行する
   * @returns ランキング
   */
  execute(): Promise<NarouRankingResult[]> {
    const date = format(this.date$, dateFormat);
    this.set({ rtype: `${date}-${this.type$}` });
    return this.api.executeRanking(this.params as RankingParams);
  }

  async executeWithFields(): Promise<
    RankingResult<DefaultSearchResultFields>[]
  >;

  async executeWithFields<TFields extends Fields>(
    fields: TFields | TFields[]
  ): Promise<RankingResult<SearchResultFields<TFields>>[]>;

  async executeWithFields(
    fields: never[],
    opt: OptionalFields | OptionalFields[]
  ): Promise<RankingResult<DefaultSearchResultFields | "weekly_unique">[]>;

  async executeWithFields<TFields extends Fields>(
    fields: TFields | TFields[],
    opt: OptionalFields | OptionalFields[]
  ): Promise<RankingResult<SearchResultFields<TFields> | "weekly_unique">[]>;

  async executeWithFields<
    TFields extends Fields,
    TOpt extends OptionalFields | undefined = undefined
  >(
    fields: TFields | TFields[] = [],
    opt?: TOpt
  ): Promise<RankingResult<SearchResultFields<TFields>>[]> {
    const ranking = await this.execute();
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
    const result = await builder.execute();

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
