import type NarouNovel from "./narou.js";
import NarouNovelJsonp from "./narou-jsonp.js";
import SearchBuilder from "./search-builder.js";
import SearchBuilderR18 from "./search-builder-r18.js";
import RankingBuilder from "./ranking.js";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history.js";
import UserSearchBuilder from "./user-search.js";

export * from "./index.common.js";
export { NarouNovelJsonp };

const narouNovelJsonp = new NarouNovelJsonp();

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(
  word = "",
  api: NarouNovel = narouNovelJsonp
): SearchBuilder {
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
  word = "",
  api: NarouNovel = narouNovelJsonp
): SearchBuilderR18 {
  const builder = new SearchBuilderR18({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * ユーザ検索
 */
export function searchUser(word = "", api: NarouNovel = narouNovelJsonp) {
  const builder = new UserSearchBuilder({}, api);
  if (word != "") builder.word(word);
  return builder;
}

export function ranking(api: NarouNovel = narouNovelJsonp): RankingBuilder {
  const builder = new RankingBuilder({}, api);
  return builder;
}

export async function rankingHistory(
  ncode: string,
  api: NarouNovel = narouNovelJsonp
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
  searchR18,
  searchUser,
  ranking,
  rankingHistory,
};
