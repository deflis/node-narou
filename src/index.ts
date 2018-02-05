import SearchBuilder from "./search-builder";
import SearchBuilderR18 from"./search-builder-r18";
import Ranking from"./ranking";
import { RankingType as rankingType } from"./ranking";
import { Fields, Order } from "./params";


/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
function search(word: string = ""): SearchBuilder {
    var builder = new SearchBuilder();
    builder.gzip(5);
    if (word != "") builder.word(word);
    return builder;
}

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
function searchR18(word: string = ""): SearchBuilderR18 {
    var builder = new SearchBuilderR18();
    builder.gzip(5);
    if (word != "") builder.word(word);
    return builder;
}

async function ranking(fields: Fields| Fields[] = []) {
    const builder = new Ranking();
    const result = await builder.execute();

    const rankingWithFields = result.map(async (ranking: any) => {
        const result = await search().fields(fields).ncode(ranking.ncode).execute();

        return Object.assign(ranking, result.values.shift());
    })
    
    return await Promise.all(rankingWithFields);
}

export default {
    search,
    ranking,
    rankingType,
    searchR18,
}

/**
 * なろうAPI
 * @global
 */
export {
    Fields,
    Order,
    search,
    ranking,
    rankingType,
    searchR18,
}
