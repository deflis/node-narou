import SearchBuilder from "./search-builder";
import SearchBuilderR18 from "./search-builder-r18";
import RankingBuilder from "./ranking";
import { RankingType } from "./ranking";
import {
  Fields,
  Order,
  BigGenre,
  BigGenreNotation,
  Genre,
  GenreNotation,
  R18Site,
  R18SiteNotation
} from "./params";
import NarouNovel, { axios } from "./narou";
import { NarouSearchResult } from "./narou-search-results";
import { NarouRankingResult, RankingResult } from "./narou-ranking-results";
import {
  RankingHistoryRawResult,
  RankingHistoryResult,
  formatRankingHistory
} from "./ranking-history";

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
  searchR18
};

/**
 * なろうAPI
 * @global
 */
export {
  Fields,
  Order,
  RankingType,
  NarouSearchResult,
  NarouRankingResult,
  RankingResult,
  BigGenre,
  BigGenreNotation,
  Genre,
  GenreNotation,
  R18Site,
  R18SiteNotation,
  NarouNovel,
  RankingHistoryRawResult,
  RankingHistoryResult,
  axios
};
