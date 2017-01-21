import SearchBuilder from "./search-builder";
import SearchBuilderR18 from"./search-builder-r18";
import fields from "./fields";

/**
 * なろうAPI
 * @global
 */
export default class Index {

    /**
    * {@link SearchBuilder#fields}メソッドにパラメータを指定する際のヘルパー。
    * @type {Fields}
    */
    static get fields() { return fields; };
    
    /**
     * 検索
     * @param {string} [word] - 検索ワード
     * @returns {SearchBuilder}
     */
    static search(word: string = null) {
        var builder = new SearchBuilder();
        if (word != null) builder.word(word);
        return builder;
    };
    
    /**
     * 検索
     * @param {string} [word] - 検索ワード
     * @returns {SearchBuilder}
     */
    static searchR18(word: string = null) {
        var builder = new SearchBuilderR18();
        if (word != null) builder.word(word);
        return builder;
    };
}
