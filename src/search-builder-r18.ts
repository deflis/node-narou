import api from "./narou";
import SearchBuilder from "./search-builder";
import INarouSearchResults from "./narou-search-results";

/**
 * 18禁API検索ヘルパー
 * @class SearchBuilderR18
 */
export default class SearchBuilderR18 extends SearchBuilder {
    /**
     * なろう小説APIへの検索リクエストを実行する
     * @override
     * @returns {Promise<INarouSearchResults>} 検索結果
     */
    execute(): Promise<INarouSearchResults> {
        return api.executeNovel18(this.params);
    }
}

