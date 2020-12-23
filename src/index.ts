import NarouNovel from "./narou";
import RankingBuilder from "./ranking";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history";
import SearchBuilder from "./search-builder";
import SearchBuilderR18 from "./search-builder-r18";

export { NarouNovel, RankingHistoryResult };
export { RankingType } from "./ranking";
export {
  Fields,
  Order,
  BigGenre,
  BigGenreNotation,
  Genre,
  GenreNotation,
  R18Site,
  R18SiteNotation
} from "./params";
export { NarouSearchResult } from "./narou-search-results";
export { NarouRankingResult, RankingResult } from "./narou-ranking-results";

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(word: string = ""): SearchBuilder {
  var builder = new SearchBuilder();
  if (word != "") builder.word(word);
  return builder;
}

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function searchR18(word: string = ""): SearchBuilderR18 {
  var builder = new SearchBuilderR18();
  if (word != "") builder.word(word);
  return builder;
}

export function ranking(): RankingBuilder {
  const builder = new RankingBuilder();
  return builder;
}

export async function rankingHistory(
  ncode: string
): Promise<RankingHistoryResult[]> {
  const result = await NarouNovel.executeRankingHistory({ ncode });
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
  rankingHistory
};
