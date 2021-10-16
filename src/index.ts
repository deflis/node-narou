import NarouNovel from "./narou";
import NarouNovelFetch from "./narou-fetch";
import RankingBuilder from "./ranking";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history";
import SearchBuilder from "./search-builder";
import SearchBuilderR18 from "./search-builder-r18";
import NarouNovelJsonp from "./narou-jsonp";

export { NarouNovel, RankingHistoryResult };
export { NarouNovelFetch, NarouNovelJsonp };
export { RankingType } from "./ranking";
export {
  Fields,
  Order,
  BigGenre,
  BigGenreNotation,
  Genre,
  GenreNotation,
  R18Site,
  R18SiteNotation,
} from "./params";
export { NarouSearchResult } from "./narou-search-results";
export { NarouRankingResult, RankingResult } from "./narou-ranking-results";

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(word: string = "", api?: NarouNovel): SearchBuilder {
  const builder = new SearchBuilder({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function searchR18(
  word: string = "",
  api?: NarouNovel
): SearchBuilderR18 {
  const builder = new SearchBuilderR18({}, api);
  if (word != "") builder.word(word);
  return builder;
}

export function ranking(api?: NarouNovel): RankingBuilder {
  const builder = new RankingBuilder({}, api);
  return builder;
}

export async function rankingHistory(
  ncode: string,
  api: NarouNovel = new NarouNovelFetch()
): Promise<RankingHistoryResult[]> {
  const result = await api.executeRankingHistory({ ncode });
  if (Array.isArray(result)) {
    return result.map(formatRankingHistory);
  } else {
    throw new Error(result);
  }
}

export default {
  search,
  ranking,
  searchR18,
  rankingHistory,
};
