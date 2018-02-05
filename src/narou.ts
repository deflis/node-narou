import * as zlib from 'zlib';
import Axios, { AxiosInstance } from "axios";
import NarouSearchResults from './narou-search-results';
import { SearchParams } from './params';

export const axios: AxiosInstance = Axios.create()

const defaultGzipLevel = 5

/**
 * なろう小説APIへのリクエストを実行する
 * @class NarouNovel
 * @private
 */
export default class NarouNovel {

    /**
     * なろう小説APIへの検索リクエストを実行する
     * @param params クエリパラメータ
     * @param endpoint APIエンドポイント
     * @returns {Promise<NarouSearchResults>} 検索結果
     */
    static async execute<T>(params: any, endpoint = 'http://api.syosetu.com/novelapi/api/'): Promise<[T, any]> {

        let query = Object.assign(params, {out: 'json'});

        let requestObject = {
            method: 'GET',
            url: endpoint,
            params: query,
        };

        if (query.gzip && query.gzip != 0) {
            query.gzip = defaultGzipLevel;
        }
        
        if (query.gzip) {
            requestObject = Object.assign(requestObject, { responseType: 'stream'});
        }
        

        let response = await axios.request(requestObject)
        let result = response.data;
        if (query.gzip) {
            let unziped: NodeJS.ReadableStream = <NodeJS.ReadableStream>(response.data).pipe(zlib.createUnzip())
            result = await new Promise((resolve, reject) => {
                let data = "";
                unziped.on('data', (chunk: string) => data += chunk);
                unziped.on('end', () => resolve(data));
                unziped.on('error', (err: any) => reject(err));
            });
            result = JSON.parse(result);
        }

        return result;
    }

    static async executeSearch(params: any, endpoint = 'http://api.syosetu.com/novelapi/api/'): Promise<NarouSearchResults> {
        return new NarouSearchResults(await this.execute(params, endpoint), params);
    }

    static executeNovel(params: SearchParams) {
        return this.executeSearch(params, 'http://api.syosetu.com/novelapi/api/');
    }

    static executeNovel18(params: SearchParams) {
        return this.executeSearch(params, 'http://api.syosetu.com/novel18api/api/');
    }

    static executeRanking(params: any) {
        return this.execute(params, 'http://api.syosetu.com/rank/rankget/');
    }

    static executeRankingHistory(params: any) {
        return this.execute(params, 'http://api.syosetu.com/rank/rankin/');
    }
}

