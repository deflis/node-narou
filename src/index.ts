import SearchBuilder from "./search-builder";
import SearchBuilderR18 from"./search-builder-r18";
import fields from "./fields";


/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
function search(word: string = null): SearchBuilder {
    var builder = new SearchBuilder();
    if (word != null) builder.word(word);
    return builder;
}

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
function searchR18(word: string = null): SearchBuilder {
    var builder = new SearchBuilderR18();
    if (word != null) builder.word(word);
    return builder;
}

export default {
    fields,
    search,
    searchR18,
}

/**
 * なろうAPI
 * @global
 */
export {
    fields,
    search,
    searchR18,
}
