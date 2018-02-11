import Axios, { AxiosInstance } from "axios";
import NarouSearchResults from './narou-search-results';
import { SearchParams } from './params';
import { NarouRankingResult } from './narou-ranking-results';

export const axios: AxiosInstance = Axios.create();

const isNode = typeof process !== 'undefined'

if (isNode) {
    const httpAdapter = require("axios/lib/adapters/http");
    axios.defaults.adapter = httpAdapter;
}

axios.interceptors.response.use(async (response) => {
    if (response.data != null && response.data.pipe != null) {
        const { unzipp } = require("axios/gzipIntecepter");
        response.data = await unzipp(response.data);
        return response;
    } else if (response.data instanceof String) {
        return Promise.reject(response);
    } else {
        return response;
    }
});

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

        let query = Object.assign(params, { out: 'json' });

        let requestObject = {
            method: 'GET',
            url: endpoint,
            params: query,
        };

        if (isNode) {
            if (query.gzip && query.gzip != 0) {
                query.gzip = defaultGzipLevel;
            }
    
            if (query.gzip) {
                requestObject = Object.assign(requestObject, { responseType: 'stream' });
            }
        } else {
            delete query.gzip
        }


        let response = await axios.request(requestObject)
        let result = response.data;

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

    static executeRanking(params: any): Promise<NarouRankingResult[]> {
        return this.execute(params, 'http://api.syosetu.com/rank/rankget/');
    }

    static executeRankingHistory(params: any) {
        return this.execute(params, 'http://api.syosetu.com/rank/rankin/');
    }
}

