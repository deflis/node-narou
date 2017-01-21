import api from "./narou";
import INarouSearchResults from "./narou-search-results";
import Field from "./fields";

/**
 * 検索ヘルパー
 * @class SearchBuilder
 */
export default class SearchBuilder {
    params: any

    /**
     * constructor
     * @private
     */
    constructor(params = {}) {
        /**
         * クエリパラメータ
         * @protected
         */
        this.params = params;
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
        this.set({word: word});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isR15(bool = true) {
        this.set({isr15: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isBL(bool = true) {
        this.set({isbl: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isGL(bool = true) {
        this.set({isgl: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isZankoku(bool = true) {
        this.set({iszankoku: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    length(length: number| number[]) {
        let len: number|string;
        if (Array.isArray(length)) {
            len = (<string[]><any>length).join("-");
        } else {
            len = length;
        }
        this.set({length: len});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    kaiwaritu(num: number|number[]) {
        let n: number|string;
        if (Array.isArray(num)) {
            n = (<string[]><any>num).join("-");
        } else {
            n = num;
        }
        this.set({kaiwaritu: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    sasie(num: number| number[]) {
        let n: number|string;
        if (Array.isArray(num)) {
            n = (<string[]><any>num).join("-");
        } else {
            n = num;
        }
        this.set({sasie: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    time(num: number|number[]) {
        let n: number|string;
        if (Array.isArray(num)) {
            n = (<string[]><any>num).join("-");
        } else {
            n = num;
        }
        this.set({time: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    ncode(codes: string|string[]) {
        let code: string;
        if (Array.isArray(codes)) {
            code = codes.join("-");
        } else {
            code = codes;
        }
        code = code.toLowerCase();
        this.set({ncode: code});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    type(t: string) {
        this.set({type: t});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    buntai(codes: number|number[]) {
        let code: number|string;
        if (Array.isArray(codes)) {
            code = (<string[]><any>codes).join("-");
        } else {
            code = codes;
        }
        this.set({buntai: code});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isStop(bool = true) {
        this.set({stop: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    isPickup(bool = true) {
        this.set({ispickup: bool ? 1 : 0});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    lastUpdate(date: string): this
    lastUpdate(from: number, to: number): this

    lastUpdate(x: string|number, y?: number) {
        let date: string
        if (typeof(x) == "string") {
            date = x;
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
    fields(fields: Field| Field[]) {
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
    page(no: number, count = 20) {
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
    * @param {string} order 出力順序
    * @return {SearchBuilder} this
    */
    order(order: string) {
        this.set({order: order});
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
        this.set({gzip: level});
        return this;
    }

    /**
     * クエリパラメータをセットする
     * @private
     * @return {SearchBuilder} this
     */
    private set(obj: any) {
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

