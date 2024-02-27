import type NarouNovel from "./narou.js";
import NarouNovelFetch from "./narou-fetch.js";
import NarouNovelJsonp from "./narou-jsonp.js";
import RankingBuilder from "./ranking.js";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history.js";
import SearchBuilder from "./search-builder.js";
import SearchBuilderR18 from "./search-builder-r18.js";
import UserSearchBuilder from "./user-search.js";

export * from "./index.common.js";
export { NarouNovelFetch, NarouNovelJsonp };

const narouNovelFetch = new NarouNovelFetch();

/**
 * なろう小説 API で小説を検索する
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(
  word = "",
  api: NarouNovel = narouNovelFetch
): SearchBuilder {
  const builder = new SearchBuilder({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * 18禁小説 API で小説を検索する
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function searchR18(
  word = "",
  api: NarouNovel = narouNovelFetch
): SearchBuilderR18 {
  const builder = new SearchBuilderR18({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * なろうユーザ検索 API でユーザを検索する
 */
export function searchUser(word = "", api: NarouNovel = narouNovelFetch) {
  const builder = new UserSearchBuilder({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * なろう小説ランキング API でランキングを取得する
 */
export function ranking(api: NarouNovel = narouNovelFetch): RankingBuilder {
  const builder = new RankingBuilder({}, api);
  return builder;
}

/**
 * なろう殿堂入り API でランキング履歴を取得する
 */
export async function rankingHistory(
  ncode: string,
  api: NarouNovel = narouNovelFetch
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
