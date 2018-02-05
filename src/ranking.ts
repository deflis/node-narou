import api from "./narou";

export enum RankingType {
    Daily = "d",
    Weekly = "w",
    Monthly = "m",
    Quarterly = "q",
}

/**
 * ランキングヘルパー
 * @class Ranking
 */
export default class Ranking {
    params: any
    _date: Date
    _type: RankingType

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
        this._date = new Date();
        this._type = RankingType.Daily
    }

    date(date: Date) {
        this._date = date;
        return this;
    }

    type(type: RankingType) {
        this._type = type;
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
    execute(): Promise<any> {
        this.set({rtype: `${this._date.getFullYear()}${("0"+this._date.getMonth()+1).slice(-2)}${("0"+this._date.getDate()).slice(-2)}-${this._type}`})
        return api.executeRanking(this.params);
    }
}

