import request from 'request';
import zlib from 'zlib';
import {WritableStreamBuffer} from 'stream-buffers';
import NarouSearchResults from './narou-search-results.js';

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
    static execute(params, endpoint = 'http://api.syosetu.com/novelapi/api/') {

        let query = Object.assign(params, {out: 'json'});

        var req = request({
            method: 'GET',
            url: endpoint,
            qs: query,
        });
        var stream = new WritableStreamBuffer();


        if (query.gzip) {
            req = req.pipe(zlib.createUnzip());
        }
        
        var pipe = req.pipe(stream);
        
        var promise = new Promise((resolve, failure) =>
            pipe.on('error', e => failure(e))
                .on('finish', () => resolve(stream.getContents()))
        );

        return promise
            .then((text) => JSON.parse(text))
            .then((json) => new NarouSearchResults(json, params));
    }

    static executeNovel(params) {
        return this.execute(params, 'http://api.syosetu.com/novelapi/api/');
    }

    static executeNovel18(params) {
        return this.execute(params, 'http://api.syosetu.com/novel18api/api/');
    }
}

