import type NarouNovel from "./narou.js";
import type { ExecuteOptions } from "./narou.js";
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
   * @param params クエリパラメータ
   * @param api NarouNovel インスタンス
   */
  constructor(
    protected params: TParams = {} as TParams,
    protected api: NarouNovel
  ) { }

  /**
   * 配列から重複を除去する
   * @protected
   * @static
   * @param array 配列
   * @returns 重複を除去した配列
   */
  protected static distinct<T>(array: readonly T[]): T[] {
    return Array.from(new Set(array));
  }

  /**
   * 配列をハイフン区切りの文字列に変換する
   * @protected
   * @static
   * @param n 文字列または数値の配列、あるいは単一の文字列または数値
   * @returns ハイフン区切りの文字列
   */
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
   * 取得件数を指定する (lim)
   * @param num 取得件数 (1-500)
   * @return {this}
   */
  limit(num: number): this {
    this.set({ lim: num } as TParams);
    return this;
  }

  /**
   * 取得開始位置を指定する (st)
   * @param num 取得開始位置 (1-)
   * @return {this}
   */
  start(num: number): this {
    this.set({ st: num } as TParams);
    return this;
  }

  /**
   * ページ番号と1ページあたりの件数で取得範囲を指定する
   * @param no ページ番号 (0-)
   * @param count 1ページあたりの件数 (デフォルト: 20)
   * @return {this}
   */
  page(no: number, count = 20): this {
    return this.limit(count).start(no * count);
  }

  /**
   * 出力順序を指定する (order)
   * 指定しない場合は新着順となります。
   * @param {TOrder} order 出力順序
   * @return {this}
   */
  order(order: TOrder): this {
    this.set({ order: order } as TParams);
    return this;
  }

  /**
   * gzip圧縮レベルを指定する (gzip)
   *
   * 転送量上限を減らすためにも推奨
   * @param {GzipLevel} level gzip圧縮レベル(1～5)
   * @return {this}
   */
  gzip(level: GzipLevel): this {
    this.set({ gzip: level } as TParams);
    return this;
  }

  /**
   * クエリパラメータをセットする
   * @protected
   * @param obj セットするパラメータ
   * @return {this}
   */
  protected set(obj: TParams): this {
    this.params = { ...this.params, ...obj };
    return this;
  }

  /**
   * クエリパラメータを削除する
   * @protected
   * @param key 削除するパラメータのキー
   * @returns {this}
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
   * 検索語を指定します (word)。
   * 半角または全角スペースで区切るとAND抽出になります。部分一致でHITします。
   * @param word 検索語
   * @return {this}
   */
  word(word: string): this {
    this.set({ word: word });
    return this;
  }

  /**
   * 除外したい単語を指定します (notword)。
   * スペースで区切ることにより除外する単語を増やせます。部分一致で除外されます。
   * @param word 除外語
   * @return {this}
   */
  notWord(word: string): this {
    this.set({ notword: word });
    return this;
  }

  /**
   * 検索対象を作品名に限定するかどうかを指定します (title)。
   * @param bool trueの場合、作品名を検索対象とする (デフォルト: true)
   * @return {this}
   */
  byTitle(bool = true): this {
    this.set({ title: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   * 検索対象をあらすじに限定するかどうかを指定します (ex)。
   * @param bool trueの場合、あらすじを検索対象とする (デフォルト: true)
   * @return {this}
   */
  byOutline(bool = true): this {
    this.set({ ex: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   * 検索対象をキーワードに限定するかどうかを指定します (keyword)。
   * @param bool trueの場合、キーワードを検索対象とする (デフォルト: true)
   * @return {this}
   */
  byKeyword(bool = true): this {
    this.set({ keyword: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   * 検索対象を作者名に限定するかどうかを指定します (wname)。
   * @param bool trueの場合、作者名を検索対象とする (デフォルト: true)
   * @return {this}
   */
  byAuthor(bool = true): this {
    this.set({ wname: bool ? BooleanNumber.True : BooleanNumber.False });
    return this;
  }

  /**
   * ボーイズラブ作品を抽出または除外します (isbl/notbl)。
   * @param bool trueの場合、ボーイズラブ作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * ガールズラブ作品を抽出または除外します (isgl/notgl)。
   * @param bool trueの場合、ガールズラブ作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * 残酷な描写あり作品を抽出または除外します (iszankoku/notzankoku)。
   * @param bool trueの場合、残酷な描写あり作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * 異世界転生作品を抽出または除外します (istensei/nottensei)。
   * @param bool trueの場合、異世界転生作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * 異世界転移作品を抽出または除外します (istenni/nottenni)。
   * @param bool trueの場合、異世界転移作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * 異世界転生または異世界転移作品を抽出します (istt)。
   * @return {this}
   */
  isTT(): this {
    this.set({ istt: BooleanNumber.True });
    return this;
  }

  /**
   * 抽出する作品の文字数を指定します (length)。
   * 範囲指定する場合は、最小文字数と最大文字数をハイフン(-)記号で区切ってください。
   * @param length 文字数、または[最小文字数, 最大文字数]
   * @return {this}
   */
  length(length: number | readonly number[]): this {
    this.set({ length: NovelSearchBuilderBase.array2string(length) });
    return this;
  }

  /**
   * 抽出する作品の会話率を%単位で指定します (kaiwaritu)。
   * @param num 会話率(%)
   * @return {this}
   */
  kaiwaritu(num: number): this;
  /**
   * 抽出する作品の会話率を%単位で範囲指定します (kaiwaritu)。
   * @param min 最低会話率(%)
   * @param max 最高会話率(%)
   * @return {this}
   */
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
   * 抽出する作品の挿絵数を指定します (sasie)。
   * @param num 挿絵数、または[最小挿絵数, 最大挿絵数]
   * @return {this}
   */
  sasie(num: number | readonly number[]): this {
    this.set({ sasie: NovelSearchBuilderBase.array2string(num) });
    return this;
  }

  /**
   * 抽出する作品の予想読了時間を分単位で指定します (time)。
   * @param num 読了時間(分)、または[最小読了時間, 最大読了時間]
   * @return {this}
   */
  time(num: number | readonly number[]): this {
    this.set({ time: NovelSearchBuilderBase.array2string(num) });
    return this;
  }

  /**
   * Nコードを指定して取得します (ncode)。
   * @param ncodes Nコード、またはNコードの配列
   * @return {this}
   */
  ncode(ncodes: string | readonly string[]): this {
    this.set({ ncode: NovelSearchBuilderBase.array2string(ncodes) });
    return this;
  }

  /**
   * 抽出する小説タイプを指定します (type)。
   * @param type 小説タイプ (t: 短編, r: 連載中, er: 完結済連載小説, ter: 短編と完結済連載小説, re: 連載中と完結済連載小説)
   * @return {this}
   */
  type(type: NovelTypeParam): this {
    this.set({ type });
    return this;
  }

  /**
   * 抽出する作品の文体を指定します (buntai)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param buntai 文体コード、または文体コードの配列
   * @return {this}
   */
  buntai(buntai: BuntaiParam | readonly BuntaiParam[]): this {
    this.set({ buntai: NovelSearchBuilderBase.array2string(buntai) });
    return this;
  }

  /**
   * 連載停止中作品に関する指定をします (stop)。
   * @param bool trueの場合、長期連載停止中のみ取得する (デフォルト: true)。falseの場合、長期連載停止中を除外する。
   * @return {this}
   */
  isStop(bool = true): this {
    this.set({ stop: bool ? StopParam.Stopping : StopParam.NoStopping });
    return this;
  }

  /**
   * ピックアップ作品のみを取得します (ispickup)。
   * @return {this}
   */
  isPickup(): this {
    this.set({ ispickup: BooleanNumber.True });
    return this;
  }

  /**
   * 最終更新日時を指定します (lastup)。
   * @param date 最終更新日時 (YYYYMMDDhhmmss形式またはUNIXタイムスタンプ)
   * @return {this}
   */
  lastUpdate(date: DateParam): this;
  /**
   * 最終更新日時の範囲を指定します (lastup)。
   * @param from 開始日時 (UNIXタイムスタンプ)
   * @param to 終了日時 (UNIXタイムスタンプ)
   * @return {this}
   */
  lastUpdate(from: number, to: number): this;
  /**
   * 最終更新日時の範囲を指定します (lastup)。
   * @param from 開始日時 (Dateオブジェクト)
   * @param to 終了日時 (Dateオブジェクト)
   * @return {this}
   */
  lastUpdate(from: Date, to: Date): this;

  lastUpdate(x: string | number | Date, y?: number | Date): this {
    let date: string;
    if (typeof x == "string") {
      date = x;
    } else if (x instanceof Date && y instanceof Date) {
      date = `${Math.floor(x.getTime() / 1000)}-${Math.floor(
        y.getTime() / 1000
      )}`;
    } else {
      date = `${x}-${y}`;
    }

    this.set({ lastup: date });
    return this;
  }

  /**
   * 作品の更新日時を指定します (lastupdate)。
   * @param date 作品の更新日時 (YYYYMMDDhhmmss形式またはUNIXタイムスタンプ)
   * @return {this}
   */
  lastNovelUpdate(date: DateParam): this;
  /**
   * 作品の更新日時の範囲を指定します (lastupdate)。
   * @param from 開始日時 (UNIXタイムスタンプ)
   * @param to 終了日時 (UNIXタイムスタンプ)
   * @return {this}
   */
  lastNovelUpdate(from: number, to: number): this;
  /**
   * 作品の更新日時の範囲を指定します (lastupdate)。
   * @param from 開始日時 (Dateオブジェクト)
   * @param to 終了日時 (Dateオブジェクト)
   * @return {this}
   */
  lastNovelUpdate(from: Date, to: Date): this;

  lastNovelUpdate(x: string | number | Date, y?: number | Date): this {
    let date: string;
    if (typeof x == "string") {
      date = x;
    } else if (x instanceof Date && y instanceof Date) {
      date = `${Math.floor(x.getTime() / 1000)}-${Math.floor(
        y.getTime() / 1000
      )}`;
    } else {
      date = `${x}-${y}`;
    }

    this.set({ lastupdate: date });
    return this;
  }

  /**
   * なろう小説APIへの検索リクエストを実行する
   * @param options 実行オプション
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<NarouSearchResult, T>> {
    return this.api.executeNovel(this.params, options);
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
   * 大ジャンルを指定して取得します (biggenre)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param genre 大ジャンルコード、または大ジャンルコードの配列
   * @return {this}
   */
  bigGenre(genre: BigGenre | readonly BigGenre[]): this {
    this.set({ biggenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   * 除外したい大ジャンルを指定します (notbiggenre)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param genre 除外する大ジャンルコード、または大ジャンルコードの配列
   * @return {this}
   */
  notBigGenre(genre: BigGenre | readonly BigGenre[]): this {
    this.set({ notbiggenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   * ジャンルを指定して取得します (genre)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param genre ジャンルコード、またはジャンルコードの配列
   * @return {this}
   */
  genre(genre: Genre | readonly Genre[]): this {
    this.set({ genre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   * 除外したいジャンルを指定します (notgenre)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param genre 除外するジャンルコード、またはジャンルコードの配列
   * @return {this}
   */
  notGenre(genre: Genre | readonly Genre[]): this {
    this.set({ notgenre: SearchBuilder.array2string(genre) });
    return this;
  }

  /**
   * ユーザIDを指定して取得します (userid)。
   * 複数指定する場合はハイフン(-)で区切ってください。
   * @param ids ユーザID、またはユーザIDの配列
   * @return {this}
   */
  userId(ids: number | readonly number[]): this {
    this.set({ userid: SearchBuilder.array2string(ids) });
    return this;
  }

  /**
   * R15作品を抽出または除外します (isr15/notr15)。
   * @param bool trueの場合、R15作品を抽出する (デフォルト: true)。falseの場合、除外する。
   * @return {this}
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
   * 出力する項目を個別に指定します (of)。
   * 未指定時は全項目出力されます。転送量軽減のため、このパラメータの使用が推奨されます。
   * 複数項目を出力する場合はハイフン(-)記号で区切ってください。
   * @param fields 出力するフィールド名、またはフィールド名の配列
   * @return {SearchBuilder<SearchResultFields<TFields>, TOpt>} 型が更新されたビルダー
   */
  fields<TFields extends Fields>(
    fields: TFields | readonly TFields[]
  ): SearchBuilder<SearchResultFields<TFields>, TOpt> {
    this.set({ of: SearchBuilder.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  /**
   * 出力オプション項目を指定します (opt)。
   * 複数項目を出力する場合はハイフン(-)記号で区切ってください。
   * @param option 出力するオプションフィールド名、またはオプションフィールド名の配列
   * @return {SearchBuilder<T, SearchResultOptionalFields<TFields>>} 型が更新されたビルダー
   */
  opt<TFields extends OptionalFields>(
    option: TFields | readonly TFields[]
  ): SearchBuilder<T, SearchResultOptionalFields<TFields>> {
    this.set({ opt: SearchBuilder.array2string(option) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
