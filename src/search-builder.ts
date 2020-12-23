import api from "./narou";
import INarouSearchResults from "./narou-search-results";
import { BigGenre, Genre } from "./params";
import {
  SearchParams,
  Fields,
  Order,
  Buntai,
  NovelType,
  GzipLevel
} from "./params";

/**
 * 検索ヘルパー
 * @class SearchBuilder
 */
export default class SearchBuilder {
  /**
   * constructor
   * @private
   */
  constructor(protected params: SearchParams = {}) {}

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
  byTitle(bool: boolean = true): this {
    this.set({ title: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byOutline(bool: boolean = true): this {
    this.set({ ex: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byKeyword(bool: boolean = true): this {
    this.set({ keyword: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  byAuthor(bool: boolean = true): this {
    this.set({ wname: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  bigGenre(genre: BigGenre | BigGenre[]): this {
    this.set({ biggenre: array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  notBigGenre(genre: BigGenre | BigGenre[]): this {
    this.set({ notbiggenre: array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  genre(genre: Genre | Genre[]): this {
    this.set({ genre: array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  notGenre(genre: Genre | Genre[]): this {
    this.set({ notgenre: array2string(genre) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  userId(ids: number | number[]): this {
    this.set({ userid: array2string(ids) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isR15(bool: boolean = true): this {
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
  isBL(bool: boolean = true): this {
    if (bool) {
      this.set({ isbl: 1 });
    } else {
      this.set({ notbl: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isGL(bool: boolean = true): this {
    if (bool) {
      this.set({ isgl: 1 });
    } else {
      this.set({ notgl: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isZankoku(bool: boolean = true): this {
    if (bool) {
      this.set({ iszankoku: 1 });
    } else {
      this.set({ notzankoku: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTensei(bool: boolean = true): this {
    if (bool) {
      this.set({ istensei: 1 });
    } else {
      this.set({ nottensei: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTenni(bool: boolean = true): this {
    if (bool) {
      this.set({ istenni: 1 });
    } else {
      this.set({ nottenni: 1 });
    }
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isTT(): this {
    this.set({ istt: 1 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  length(length: number | number[]): this {
    this.set({ length: array2string(length) });
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
  sasie(num: number | number[]): this {
    this.set({ sasie: array2string(num) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  time(num: number | number[]): this {
    this.set({ time: array2string(num) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  ncode(ncodes: string | string[]): this {
    this.set({ ncode: array2string(ncodes) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  type(type: NovelType): this {
    this.set({ type });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  buntai(buntai: Buntai | Buntai[]): this {
    this.set({ buntai: array2string(buntai) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isStop(bool: boolean = true): this {
    this.set({ stop: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  isPickup(bool: boolean = true): this {
    this.set({ ispickup: bool ? 1 : 0 });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  lastUpdate(date: string): this;
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

  /**
   *
   * @return {SearchBuilder} this
   */
  fields(fields: Fields | Fields[]): this {
    this.set({ of: array2string(fields) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  limit(num: number): this {
    this.set({ lim: num });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  start(num: number): this {
    this.set({ st: num });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  page(no: number, count: number = 20): this {
    return this.limit(count).start(no * count);
  }

  opt(option: "weekly" | undefined): this {
    return this.set({ opt: option });
  }

  /**
   * 出力順序を指定する。指定しない場合は新着順となります。
   *
   * @description
   * allunique	閲覧者の多い順(未実装)
   * favnovelcnt	ブックマーク数の多い順
   * reviewcnt	レビュー数の多い順
   * hyoka	総合評価の高い順
   * hyokaasc	総合評価の低い順
   * impressioncnt	感想の多い順
   * hyokacnt	評価者数の多い順
   * hyokacntasc	評価者数の少ない順
   * weekly	週間ユニークユーザの多い順 毎週火曜日早朝リセット
   * (前週の日曜日から土曜日分)
   * lengthdesc	小説本文の文字数が多い順
   * lengthasc	小説本文の文字数が少ない順
   * ncodedesc	Nコードが新しい順
   * old	古い順
   * @param {Order} order 出力順序
   * @return {SearchBuilder} this
   */
  order(order: Order): this {
    this.set({ order: order });
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
    this.set({ gzip: level });
    return this;
  }

  /**
   * クエリパラメータをセットする
   * @private
   * @return {SearchBuilder} this
   */
  protected set(obj: SearchParams): this {
    this.params = { ...this.params, ...obj };
    return this;
  }

  /**
   * クエリパラメータを削除する
   * @private
   * @return {SearchBuilder} this
   */
  protected unset(key: keyof SearchParams): this {
    delete this.params[key];
    return this;
  }

  /**
   * なろう小説APIへの検索リクエストを実行する
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(): Promise<INarouSearchResults> {
    return api.executeNovel(this.params);
  }
}

function distinct<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

function array2string<T extends string | number>(n: T | T[]): string {
  if (Array.isArray(n)) {
    return distinct(n).join("-");
  } else {
    return n.toString();
  }
}
