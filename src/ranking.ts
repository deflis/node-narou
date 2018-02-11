import api from "./narou";
import * as moment from "moment";
import { Moment } from "moment";
import { NarouRankingResult, RankingResult } from "./narou-ranking-results";
import { Fields } from "./index";
import SearchBuilder from "./search-builder";

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
export default class RankingBuilder {
    protected date$: Moment
    protected type$: RankingType

    /**
     * constructor
     * @private
     */
    constructor(protected params = {}) {
        /**
         * クエリパラメータ
         * @protected
         */
        this.date$ = moment().days(-1);
        this.type$ = RankingType.Daily;
    }

    date(date: Date|Moment) {
        if (date instanceof Date) {
            this.date$ = moment(date)
        } else {
            this.date$ = date;
        }
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
        this.set({gzip: level});
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
        const date = this.date$.format("YYYYMMDD")
        this.set({rtype: `${date}-${this.type$}`})
        return api.executeRanking(this.params);
    }

    async executeWithFields(fields: Fields| Fields[] = []): Promise<RankingResult[]> {
        const result = await this.execute();
        const fields$: Fields[] = (Array.isArray(fields) ? (fields.length == 0 ? [] : fields.concat(Fields.ncode)) : [fields, Fields.ncode])
            .filter( (x, i, self) =>  self.indexOf(x) === i);
    
        const rankingWithFields:Promise<RankingResult[]>[] = arrayNgrouped(result).map(async (ranking) => {
            const rankingNcodes = ranking.map(({ncode}) => ncode);
            const builder = new SearchBuilder();
            builder.fields(fields$);
            builder.ncode(rankingNcodes);
            builder.limit(ranking.length);
            const result = await builder.execute();
        
            return ranking.map(r => Object.assign(r, result.values.find(novel => novel.ncode == r.ncode)))
        })
        
        return (await Promise.all(rankingWithFields)).reduce((a, b) => a.concat(b));
    }
}

function arrayNgrouped<T>(arr: T[], n: number = 10): T[][] {
    const result: T[][] = [];
    const arr$ = arr.concat();
    while (arr$.length > 0) {
        result.push(arr$.splice(0, n));
    }
    return result;
};

