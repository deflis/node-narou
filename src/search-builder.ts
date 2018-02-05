import api from "./narou";
import INarouSearchResults from "./narou-search-results";
import { SearchParams, Fields, Order, Buntai, NovelType, GzipLevel } from "./params";

function array2string<T>(n: T|T[]): (string|T) {
    if (Array.isArray(n)) {
        return (<string[]><any>n).join("-");
    } else {
        return n;
    }
}

/**
 * 検索ヘルパー
 * @class SearchBuilder
 */
export default class SearchBuilder {

    /**
     * constructor
     * @private
     */
    constructor(protected params: SearchParams = {}) {
    }

    /**
     * a
     * @return {SearchBuilder} this
     */
    word(word: string) {
        this.set({word: word});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    notWord(word: string) {
        this.set({notword: word});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    byTitle(bool: boolean = true) {
        this.set({title: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    byOutline(bool: boolean = true) {
        this.set({ex: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    byKeyword(bool: boolean = true) {
        this.set({keyword: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    byAuthor(bool: boolean = true) {
        this.set({wname: bool ? 1 : 0});
        return this;
    }


    /**

    /**
     * 
     * @return {SearchBuilder} this
     */
    userId(ids: number| number[]) {
        this.set({userid: array2string(ids)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isR15(bool: boolean = true) {
        this.set({isr15: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isBL(bool: boolean = true) {
        this.set({isbl: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isGL(bool: boolean = true) {
        this.set({isgl: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isZankoku(bool: boolean = true) {
        this.set({iszankoku: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    length(length: number| number[]) {
        this.set({length: array2string(length)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    kaiwaritu(num: number): this
    kaiwaritu(min: number, max: number): this

    kaiwaritu(min: number, max?: number) {
        let n: number|string;
        if (max != null) {
            n = `${min}-${max}`
        } else {
            n = min;
        }
        this.set({kaiwaritu: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    sasie(num: number| number[]) {
        this.set({sasie: array2string(num)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    time(num: number|number[]) {
        this.set({time: array2string(num)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    ncode(ncodes: string|string[]) {
        this.set({ncode: array2string(ncodes)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    type(type: NovelType) {
        this.set({type});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    buntai(buntai: Buntai|Buntai[]) {
        this.set({buntai: array2string(buntai)});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isStop(bool: boolean = true) {
        this.set({stop: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isPickup(bool: boolean = true) {
        this.set({ispickup: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    lastUpdate(date: string): this
    lastUpdate(from: number, to: number): this
    lastUpdate(from: Date, to: Date): this

    lastUpdate(x: string|number|Date, y?: number|Date) {
        let date: string
        if (typeof(x) == "string") {
            date = x;
        } else if (x instanceof Date && y instanceof Date ) {
            date = `${Math.floor(x.getTime()/1000)}-${Math.floor(x.getTime()/1000)}`;
        } else {
            date = `${x}-${y}`;
        }
        
        this.set({lastup: date});
        return this;
    }


    /**
     * 
     * @return {SearchBuilder} this
     */
    fields(fields: Fields| Fields[]) {
        let of: string;
        if (Array.isArray(fields)) {
            of = fields.join("-");
        } else {
            of = fields;
        }
        of = of.toLowerCase();
        this.set({of: of});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    limit(num: number) {
        this.set({lim: num});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    start(num: number) {
        this.set({st: num});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    page(no: number, count: number = 20) {
        return this.limit(count).start(no * count);
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
    order(order: Order) {
        this.set({order: order});
        return this;
    }

    /**
     * gzip圧縮する。
     * 
     * 転送量上限を減らすためにも推奨
     * @param {GzipLevel} level gzip圧縮レベル(1～5)
     * @return {SearchBuilder} this
     */
    gzip(level: GzipLevel) {
        this.set({gzip: level});
        return this;
    }

    /**
     * クエリパラメータをセットする
     * @private
     * @return {SearchBuilder} this
     */
    protected set(obj: SearchParams) {
        Object.assign(this.params, obj);
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

