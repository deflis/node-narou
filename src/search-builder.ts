import type NarouNovel from "./narou.js";
import type {
  NarouSearchResult,
  SearchResultFields,
  SearchResultOptionalFields,
} from "./narou-search-results.js";
import type NarouSearchResults from "./narou-search-results.js";
import type {
  BigGenre,
  SearchResultFieldNames,
  Genre,
  SearchParams,
  Fields,
  Order,
  BuntaiParam,
  NovelTypeParam,
  GzipLevel,
  OptionalFields,
  ParamsBaseWithOrder,
  DateParam,
} from "./params.js";
import { BooleanNumber, StopParam } from "./params.js";
import type { Join } from "./util/type.js";

export type DefaultSearchResultFields = keyof Omit<
  NarouSearchResult,
  "weekly_unique" | "noveltype" | "nocgenre" | "xid"
>;

export abstract class SearchBuilderBase<
  TParams extends ParamsBaseWithOrder<TOrder>,
  TOrder extends string,
> {
  /**
   * constructor
   * @private
   */
  constructor(
    protected params: TParams = {} as TParams,
    protected api: NarouNovel
  ) {}

  protected static distinct<T>(array: readonly T[]): T[] {
    return Array.from(new Set(array));
  }

  protected static array2string<T extends string | number>(
    n: T | readonly T[]
  ): Join<T> {
    if (Array.isArray(n)) {
      return this.distinct(n).join("-") as Join<T>;
    } else {
      return n.toString() as Join<T>;
    }
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  limit(num: number): this {
    this.set({ lim: num } as TParams);
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  start(num: number): this {
    this.set({ st: num } as TParams);
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  page(no: number, count = 20): this {
    return this.limit(count).start(no * count);
  }

  /**
   * 出力順序を指定する。指定しない場合は新着順となります。
   * old	古い順
   * @param {TOrder} order 出力順序
   * @return {SearchBuilder} this
   */
  order(order: TOrder): this {
    this.set({ order: order } as TParams);
    return this;
  }

  /**
   * gzip圧縮する。
   *
   * 転送量上限を減らすためにも推奨
   * @param {GzipLevel} level gzip圧縮レベル(1～5)
   * @return {SearchBuilder} this
   */
  gzip(level: GzipLevel): this {
    this.set({ gzip: level } as TParams);
    return this;
  }

  /**
   * クエリパラメータをセットする
   * @private
   * @return {SearchBuilder} this
   */
  protected set(obj: TParams): this {
    this.params = { ...this.params, ...obj };
    return this;
  }

  /**
   * クエリパラメータを削除する
   */
  protected unset(key: keyof TParams): this {
    delete this.params[key];
    return this;
  }
}

export abstract class NovelSearchBuilderBase<
  T extends SearchResultFieldNames,
> extends SearchBuilderBase<SearchParams, Order> {
  /**
   * a
   * @return {SearchBuilder} this
   */
  word(word: string): this {
    this.set({ word: word });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  notWord(word: string): this {
    this.set({ notword: word });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byTitle(bool = true): this {
    this.set({ title: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byOutline(bool = true): this {
    this.set({ ex: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byKeyword(bool = true): this {
    this.set({ keyword: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byAuthor(bool = true): this {
    this.set({ wname: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isBL(bool = true): this {
    if (bool) {
      this.set({ isbl: BooleanNumber.True });
    } else {
      this.set({ notbl: BooleanNumber.True });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isGL(bool = true): this {
    if (bool) {
      this.set({ isgl: BooleanNumber.True });
    } else {
      this.set({ notgl: BooleanNumber.True });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isZankoku(bool = true): this {
    if (bool) {
      this.set({ iszankoku: BooleanNumber.True });
    } else {
      this.set({ notzankoku: BooleanNumber.True });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTensei(bool = true): this {
    if (bool) {
      this.set({ istensei: BooleanNumber.True });
    } else {
      this.set({ nottensei: BooleanNumber.True });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTenni(bool = true): this {
    if (bool) {
      this.set({ istenni: BooleanNumber.True });
    } else {
      this.set({ nottenni: BooleanNumber.True });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTT(): this {
    this.set({ istt: BooleanNumber.True });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  length(length: number | readonly number[]): this {
    this.set({ length: NovelSearchBuilderBase.array2string(length) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  kaiwaritu(num: number): this;
  kaiwaritu(min: number, max: number): this;

  kaiwaritu(min: number, max?: number): this {
    let n: number | string;
    if (max != null) {
      n = `${min}-${max}`;
    } else {
      n = min;
    }
    this.set({ kaiwaritu: n });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  sasie(num: number | readonly number[]): this {
    this.set({ sasie: NovelSearchBuilderBase.array2string(num) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  time(num: number | readonly number[]): this {
    this.set({ time: NovelSearchBuilderBase.array2string(num) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  ncode(ncodes: string | readonly string[]): this {
    this.set({ ncode: NovelSearchBuilderBase.array2string(ncodes) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  type(type: NovelTypeParam): this {
    this.set({ type });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  buntai(buntai: BuntaiParam | readonly BuntaiParam[]): this {
    this.set({ buntai: NovelSearchBuilderBase.array2string(buntai) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isStop(bool = true): this {
    this.set({ stop: bool ? StopParam.Stopping : StopParam.NoStopping });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isPickup(bool = true): this {
    this.set({ ispickup: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  lastUpdate(date: DateParam): this;
  lastUpdate(from: number, to: number): this;
  lastUpdate(from: Date, to: Date): this;

  lastUpdate(x: string | number | Date, y?: number | Date): this {
    let date: string;
    if (typeof x == "string") {
      date = x;
    } else if (x instanceof Date && y instanceof Date) {
      date = `${Math.floor(x.getTime() / 1000)}-${Math.floor(
        x.getTime() / 1000
      )}`;
    } else {
      date = `${x}-${y}`;
    }

    this.set({ lastup: date });
    return this;
  }

  lastNovelUpdate(date: DateParam): this;
  lastNovelUpdate(from: number, to: number): this;
  lastNovelUpdate(from: Date, to: Date): this;

  lastNovelUpdate(x: string | number | Date, y?: number | Date): this {
    let date: string;
    if (typeof x == "string") {
      date = x;
    } else if (x instanceof Date && y instanceof Date) {
      date = `${Math.floor(x.getTime() / 1000)}-${Math.floor(
        x.getTime() / 1000
      )}`;
    } else {
      date = `${x}-${y}`;
    }

    this.set({ lastupdate: date });
    return this;
  }

  /**
   * なろう小説APIへの検索リクエストを実行する
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return this.api.executeNovel(this.params);
  }
}

/**
 * 検索ヘルパー
 * @class SearchBuilder
 */
export default class SearchBuilder<
  T extends keyof NarouSearchResult = DefaultSearchResultFields,
  TOpt extends keyof NarouSearchResult = never,
> extends NovelSearchBuilderBase<T | TOpt> {
  /**
   *
   * @return {SearchBuilder} this
   */
  bigGenre(genre: BigGenre | readonly BigGenre[]): this {
    this.set({ biggenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  notBigGenre(genre: BigGenre | readonly BigGenre[]): this {
    this.set({ notbiggenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  genre(genre: Genre | readonly Genre[]): this {
    this.set({ genre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  notGenre(genre: Genre | readonly Genre[]): this {
    this.set({ notgenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  userId(ids: number | readonly number[]): this {
    this.set({ userid: SearchBuilder.array2string(ids) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isR15(bool = true): this {
    if (bool) {
      this.set({ isr15: 1 });
    } else {
      this.set({ notr15: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  fields<TFields extends Fields>(
    fields: TFields | readonly TFields[]
  ): SearchBuilder<SearchResultFields<TFields>, TOpt> {
    this.set({ of: SearchBuilder.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  opt<TFields extends OptionalFields>(
    option: TFields | readonly TFields[]
  ): SearchBuilder<T, SearchResultOptionalFields<TFields>> {
    this.set({ opt: SearchBuilder.array2string(option) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
