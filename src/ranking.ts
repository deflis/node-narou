import { NarouRankingResult, RankingResult } from "./narou-ranking-results";
import { Fields } from "./index";
import SearchBuilder from "./search-builder";
import { addDays, format } from "date-fns";
import { RankingParams } from "./params";
import NarouNovel from "./narou";
import NarouNovelFetch from "./narou-fetch";

export enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarterly = "q",
}

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
    protected api: NarouNovel = new NarouNovelFetch()
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
   * @param {number} level gzip圧縮レベル(1～5)
   * @return {SearchBuilder} this
   */
  gzip(level: number) {
    this.set({ gzip: level });
    return this;
  }

  /**
   * クエリパラメータをセットする
   * @private
   * @return {SearchBuilder} this
   */
  protected set(obj: any) {
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

  async executeWithFields(
    fields: Fields | Fields[] = [],
    opt?: "weekly"
  ): Promise<RankingResult[]> {
    const ranking = await this.execute();
    const fields$: Fields[] = Array.isArray(fields)
      ? fields.length == 0
        ? []
        : [...fields, Fields.ncode]
      : [fields, Fields.ncode];

    const rankingNcodes = ranking.map(({ ncode }) => ncode);
    const builder = new SearchBuilder({}, this.api);
    builder.fields(fields$);
    if (opt) {
      builder.opt(opt);
    }
    builder.ncode(rankingNcodes);
    builder.limit(ranking.length);
    const result = await builder.execute();

    // TODO: 型的にはNull許容ではないが許容しているのでなんとかする（削除されている小説がある）
    return ranking.map<RankingResult>((r) => ({
      ...r,
      ...(result.values.find((novel) => novel.ncode == r.ncode) ?? ({} as any)),
    }));
  }
}
