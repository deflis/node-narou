import api from "./narou";

/**
 * 検索ヘルパー
 * @class SearchBuilder
 */
export default class SearchBuilder {
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
    word(word) {
        this.set({word: word});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    notWord(word) {
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
    length(length) {
        let len = length;
        if (Array.isArray(len)) {
            len = len.join("-");
        }
        this.set({length: len});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    kaiwaritu(num) {
        let n = num;
        if (Array.isArray(n)) {
            n = n.join("-");
        }
        this.set({kaiwaritu: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    sasie(num) {
        let n = num;
        if (Array.isArray(n)) {
            n = n.join("-");
        }
        this.set({kaiwaritu: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    time(num) {
        let n = num;
        if (Array.isArray(n)) {
            n = n.join("-");
        }
        this.set({kaiwaritu: n});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    ncode(codes) {
        let code = codes;
        if (Array.isArray(code)) {
            code = code.join("-");
        }
        code = code.toLowerCase();
        this.set({ncode: code});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    type(t) {
        this.set({type: t});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    buntai(codes) {
        let code = codes;
        if (Array.isArray(code)) {
            code = code.join("-");
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
    lastUpdate(date) {
        var lastup = date;
        if (Array.isArray(lastup)) {
            for(var n in lastup) {

            }
            lastup = lastup.join("-");
        }
        this.set({lastup: lastup});
        return this;

    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    fields(fields) {
        var of = fields;
        if (Array.isArray(of)) {
            of = of.join("-");
        }
        this.set({of: of});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    limit(num) {
        this.set({lim: num});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    start(num) {
        this.set({st: num});
        return this;
    }

    /**
     * 
     * @return {SearchBuilder} this
     */
    page(no, count = 20) {
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
    order(order) {
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
    gzip(level) {
        this.set({gzip: level});
        return this;
    }

    /**
     * クエリパラメータをセットする
     * @private
     * @return {SearchBuilder} this
     */
    set(obj) {
        Object.assign(this.params, obj);
        return this;
    }

    /**
     * なろう小説APIへの検索リクエストを実行する
     * @returns {Promise<NarouSearchResults>} 検索結果
     */
    execute() {
        return api.executeNovel(this.params);
    }
}

